// src/services/AuthService.ts
import { Response } from "express";
import User from "../models/User.js";
import {
  IAuthService,
  ILoginPayload,
  IRegisterPayload,
  ITokenResponse,
  ITokenVerify,
  IUser,
} from "../interfaces/IAuthService.js";

import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/customError.js";

import { IPasswordManagerService } from "../interfaces/IPasswordManagerService.js";
import {
  IJwtRefreshTokenResponse,
  ITokenManagerService,
} from "../interfaces/ITokenManagerService.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { IClientMetadata } from "../interfaces/IClientMetadataService.js";

export class AuthService implements IAuthService {
  constructor(
    private tokenManagerSvc: ITokenManagerService,
    private passwordManagerSvc: IPasswordManagerService
  ) {}

  async register(payload: IRegisterPayload): Promise<IUser> {
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) throw new ConflictError("Email already registered");

    const hashedPassword = await this.passwordManagerSvc.hashPassword(
      payload.password
    );
    const user = new User({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    });
    await user.save();

    const newUser: IUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    return newUser;
  }

  async login(
    payload: ILoginPayload,
    clientMetadata: IClientMetadata,
    resp?: Response
  ): Promise<ITokenResponse> {
    const user = await User.findOne({ email: payload.email });
    if (!user) throw new NotFoundError("User not found");

    const isValid = await this.passwordManagerSvc.verifyPassword(
      payload.password,
      user.password
    );
    if (!isValid) throw new UnauthorizedError("Invalid credentials");

    const tokens = await this.tokenManagerSvc.generateTokens(
      { userId: user._id.toString() },
      clientMetadata
    );

    const userResponse: IUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    return {
      user: userResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(
    refreshToken: string,
    clientMetadata: IClientMetadata,
    resp?: Response
  ): Promise<ITokenResponse> {
    // 🔐 Get both userId AND tokenId for secure operations
    const { userId, tokenId } = await this.tokenManagerSvc.verifyRefreshToken(
      refreshToken
    );

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // 🔐 ATOMIC REVOCATION: Use tokenId for fast, safe revocation
    await RefreshToken.findByIdAndUpdate(tokenId, {
      revokedAt: new Date(),
    });

    // Generate new tokens
    const tokens = await this.tokenManagerSvc.generateTokens(
      { userId },
      clientMetadata
    );

    const userResponse: IUser = {
      id: userId,
      name: user.name,
      email: user.email,
    };

    return {
      user: userResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async verifyToken(token: string): Promise<ITokenVerify> {
    // 🔐 Note: Token verification now includes lastLogout check in TokenManagerService
    const decoded = await this.tokenManagerSvc.verifyAccessToken(token);
    return decoded;
  }

  async verifyRefreshToken(
    refreshToken: string
  ): Promise<IJwtRefreshTokenResponse> {
    const data = await this.tokenManagerSvc.verifyRefreshToken(
      refreshToken
    );
    return data;
  }

  async logout(refreshToken: string): Promise<void> {
    // Find the refresh token document
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
    if (tokenDoc) {
      // Revoke the specific refresh token
      await RefreshToken.findByIdAndUpdate(tokenDoc._id, {
        revokedAt: new Date(),
      });

      // 🔐 IMPORTANT: Update lastLogout to invalidate ALL access tokens for this user
      // This ensures any access tokens issued before this time become invalid
      await User.findByIdAndUpdate(tokenDoc.userId, {
        lastLogout: new Date(),
      });
    }
  }

  async logoutAll(userId: string): Promise<void> {
    // Revoke all refresh tokens for the user
    await RefreshToken.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    );

    // 🔐 Update user's lastLogout to invalidate ALL access tokens
    // Any access token issued before this timestamp will be rejected
    await User.findByIdAndUpdate(userId, { lastLogout: new Date() });
  }
}

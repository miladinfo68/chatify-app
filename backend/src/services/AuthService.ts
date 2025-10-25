// src/services/AuthService.ts
import { Response } from "express";
import  User  from "../models/User.js";
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
} from "../utils/CustomError.js";
import { IPasswordManagerService } from "../interfaces/IPasswordManagerService.js";
import { ITokenManagerService } from "../interfaces/ITokenManagerService.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { IClientMetadata } from "../interfaces/IClientMetadataService.js";

export class AuthService implements IAuthService {
  constructor(
    private tokenManager: ITokenManagerService,
    private passwordManager: IPasswordManagerService
  ) {}

  async register(payload: IRegisterPayload): Promise<IUser> {
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) throw new ConflictError("Email already registered");

    const hashedPassword = await this.passwordManager.hashPassword(
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

    const isValid = await this.passwordManager.verifyPassword(
      payload.password,
      user.password
    );
    if (!isValid) throw new UnauthorizedError("Invalid credentials");

    const tokens = await this.tokenManager.generateTokens(
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
    const { userId } = await this.tokenManager.verifyRefreshToken(refreshToken);

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Revoke the old refresh token
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { revokedAt: new Date() }
    );

    // Generate new tokens
    const tokens = await this.tokenManager.generateTokens(
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

  async verifyToken(token: string): Promise<ITokenVerify> {
    const decoded = await this.tokenManager.verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("lastLogout");
    if (!user) throw new UnauthorizedError("User not found");
    return decoded;
  }

  async logout(refreshToken: string): Promise<void> {
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { revokedAt: new Date() }
    );
  }

  async logoutAll(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    );

    // Update user's lastLogout timestamp
    await User.findByIdAndUpdate(userId, { lastLogout: new Date() });
  }
}

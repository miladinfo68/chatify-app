// src/services/TokenManagerService.ts
import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import ms, { StringValue } from "ms";
import Env from "../configs/Env.js";
import {
  ITokenManagerService,
  IJwtPayload,
  ITokenResponse,
  IJwtVerifyResponse,
  IJwtRefreshTokenResponse,
} from "../interfaces/ITokenManagerService.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { UnauthorizedError } from "../utils/CustomError.js";
import { IClientMetadata } from "../interfaces/IClientMetadataService.js";
import {
  getCookieOptions,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../configs/cookieConfig.js";

export default class TokenManagerService implements ITokenManagerService {
  private readonly ACCESS_TOKEN_EXPIRES =
    Env.ACCESS_TOKEN_EXPIRES as StringValue;
  private readonly REFRESH_TOKEN_EXPIRES =
    Env.REFRESH_TOKEN_EXPIRES as StringValue;
  private readonly JWT_SECRET = Env.JWT_SECRET as string;
  private readonly COOKIE_ACCESS_TOKEN = Env.COOKIE_ACCESS_TOKEN as string;
  private readonly COOKIE_REFRESH_TOKEN = Env.COOKIE_REFRESH_TOKEN as string;

  async generateAccessToken(payload: IJwtPayload): Promise<string> {
    return jwt.sign({ userId: payload.userId }, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES,
    });
  }

  async generateRefreshToken(
    payload: IJwtPayload,
    clientMetadata: IClientMetadata
  ): Promise<string> {
    const refreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + ms(this.REFRESH_TOKEN_EXPIRES));

    await RefreshToken.create({
      token: refreshToken,
      userId: payload.userId,
      ipAddress: clientMetadata.ip,
      userAgent: clientMetadata.userAgent,
      expiresAt,
      revokedAt:null
    });

    return refreshToken;
  }

  async generateTokens(
    payload: IJwtPayload,
    clientMetadata: IClientMetadata,
    resp?: Response
  ): Promise<ITokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload, clientMetadata),
    ]);

    // if (resp) {
    //   this.setCookies(resp, accessToken, refreshToken);
    // }
    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<IJwtVerifyResponse> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as IJwtVerifyResponse;
      // Additional validation
      if (!decoded.userId) throw new UnauthorizedError("Invalid token payload");

      return {
        userId: decoded.userId as string,
        iat: decoded.iat!,
        exp: decoded.exp!,
        isValid: true,
      };

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new UnauthorizedError("Access token expired");

      if (error instanceof jwt.JsonWebTokenError)
        throw new UnauthorizedError("Invalid access token");
      throw error;
    }
  }

  async verifyRefreshToken(token: string): Promise<IJwtRefreshTokenResponse> {
    const doc = await RefreshToken.findOne({ token });
    if (!doc) throw new UnauthorizedError("Invalid refresh token");

    if (doc.revokedAt)
      throw new UnauthorizedError("Refresh token has been revoked");

    if (doc.expiresAt < new Date()) {
      // Auto-revoke expired tokens
      await RefreshToken.findByIdAndUpdate(doc._id, { revokedAt: new Date() });
      throw new UnauthorizedError("Refresh token expired");
    }

    return {
      userId: doc.userId.toString(),
      tokenId: doc._id as string,
    };
  }

  setCookies(resp: Response, accessToken: string, refreshToken: string): void {
    if (!resp) return;

    // Set access token cookie
    resp.cookie(
      this.COOKIE_ACCESS_TOKEN,
      accessToken,
      getAccessTokenCookieOptions()
    );

    // Set refresh token cookie with more restrictive settings
    resp.cookie(
      this.COOKIE_REFRESH_TOKEN,
      refreshToken,
      getRefreshTokenCookieOptions()
    );
  }

  clearAuthCookies(resp: Response): void {
    const baseOptions = getCookieOptions();

    // Clear access token cookie
    resp.clearCookie(this.COOKIE_ACCESS_TOKEN, {
      ...baseOptions,
      path: "/",
    });

    // Clear refresh token cookie with its specific path
    resp.clearCookie(this.COOKIE_REFRESH_TOKEN, {
      ...baseOptions,
      path: Env.REFRESH_TOKEN_PATH,
    });
  }
}

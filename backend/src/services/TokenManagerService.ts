// src/services/TokenManagerService.ts (updated)
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
import User from "../models/User.js";

import {
  getCookieOptions,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../configs/cookieConfig.js";

import { IDateTimeCovertor } from "../utils/dateTimeConvertor.js";

export default class TokenManagerService implements ITokenManagerService {

  private readonly ACCESS_TOKEN_EXPIRES = Env.ACCESS_TOKEN_EXPIRES as StringValue;
  private readonly REFRESH_TOKEN_EXPIRES = Env.REFRESH_TOKEN_EXPIRES as StringValue;
  private readonly JWT_SECRET = Env.JWT_SECRET as string;
  private readonly COOKIE_ACCESS_TOKEN = Env.COOKIE_ACCESS_TOKEN as string;
  private readonly COOKIE_REFRESH_TOKEN = Env.COOKIE_REFRESH_TOKEN as string;

  constructor(private dateTimeConvertor: IDateTimeCovertor) {} 

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
    
    // 🔥 USING DateTimeService for consistent timestamp handling
    const expiresAt = new Date(Date.now() + ms(this.REFRESH_TOKEN_EXPIRES));

    await RefreshToken.create({
      token: refreshToken,
      userId: payload.userId,
      ipAddress: clientMetadata.ip,
      userAgent: clientMetadata.userAgent,
      expiresAt,
      revokedAt: null
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

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<IJwtVerifyResponse> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as IJwtVerifyResponse;
      
      if (!decoded.userId) throw new UnauthorizedError("Invalid token payload");

      const user = await User.findById(decoded.userId).select("lastLogout");
      if (!user) throw new UnauthorizedError("User not found");
      
      if (user.lastLogout && decoded.iat) {
        const tokenIssuedAt = this.dateTimeConvertor.toMilliseconds(decoded.iat);
        if (tokenIssuedAt < user.lastLogout.getTime()) {
          throw new UnauthorizedError("Token revoked due to logout");
        }
      }

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
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedError("Refresh token required");
    }

    const doc = await RefreshToken.findOne({ token });
    if (!doc) throw new UnauthorizedError("Invalid refresh token");

    if (doc.revokedAt)
      throw new UnauthorizedError("Refresh token has been revoked");

    const now = this.dateTimeConvertor.nowUnix();
    const expiresAtUnix = this.dateTimeConvertor.toUnixTimestamp(doc.expiresAt);

    if (expiresAtUnix < now) {
      await RefreshToken.findByIdAndUpdate(doc._id, { 
        revokedAt: new Date() 
      });
      throw new UnauthorizedError("Refresh token expired");
    }

    return {
      userId: doc.userId.toString(),
      tokenId: doc._id as string,
      iat: this.dateTimeConvertor.toUnixTimestamp(doc.createdAt), 
      exp: this.dateTimeConvertor.toUnixTimestamp(doc.expiresAt), 
      isValid: true,
    };
  }

  setCookies(resp: Response, accessToken: string, refreshToken: string): void {
    if (!resp) return;

    resp.cookie(
      this.COOKIE_ACCESS_TOKEN,
      accessToken,
      getAccessTokenCookieOptions()
    );

    resp.cookie(
      this.COOKIE_REFRESH_TOKEN,
      refreshToken,
      getRefreshTokenCookieOptions()
    );
  }

  clearAuthCookies(resp: Response): void {
    const baseOptions = getCookieOptions();

    resp.clearCookie(this.COOKIE_ACCESS_TOKEN, {
      ...baseOptions,
      path: "/",
    });

    resp.clearCookie(this.COOKIE_REFRESH_TOKEN, {
      ...baseOptions,
      path: Env.REFRESH_TOKEN_PATH,
    });
  }
}

// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@

/*

// Alternative JWT-based refresh tokens
async generateRefreshToken(
  payload: IJwtPayload,
  clientMetadata: IClientMetadata
): Promise<string> {
  // Create JWT refresh token (includes iat/exp in the token itself)
  const refreshTokenJWT = jwt.sign(
    { 
      userId: payload.userId,
      type: 'refresh' 
    }, 
    this.JWT_SECRET, 
    { 
      expiresIn: this.REFRESH_TOKEN_EXPIRES 
    }
  );

  // Store in database with expiration
  const expiresAt = new Date(Date.now() + ms(this.REFRESH_TOKEN_EXPIRES));
  
  await RefreshToken.create({
    token: refreshTokenJWT, // Store the JWT instead of UUID
    userId: payload.userId,
    ipAddress: clientMetadata.ip,
    userAgent: clientMetadata.userAgent,
    expiresAt,
    revokedAt: null
  });

  return refreshTokenJWT;
}

async verifyRefreshToken(token: string): Promise<IJwtRefreshTokenResponse> {
  // First verify JWT signature and expiration
  const decoded = jwt.verify(token, this.JWT_SECRET) as any;
  
  // Then check database for revocation
  const doc = await RefreshToken.findOne({ token });
  if (!doc || doc.revokedAt) {
    throw new UnauthorizedError("Invalid or revoked refresh token");
  }

  return {
    userId: decoded.userId,
    tokenId: doc._id.toString(),
    iat: decoded.iat,    // From JWT
    exp: decoded.exp,    // From JWT
    isValid: true
  };
}

*/
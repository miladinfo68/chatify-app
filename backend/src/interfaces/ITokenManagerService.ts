// src/interfaces/ITokenManagerService.ts
import { Response } from "express";
import { IClientMetadata } from "./IClientMetadataService.js";

export interface IJwtPayload {
  userId: string;
}

export interface IJwtRefreshTokenResponse extends IJwtPayload {
  tokenId: string;
}

export interface IJwtVerifyResponse extends IJwtPayload {
  iat: number;
  exp: number;
  isValid:boolean;
}

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenManagerService {
  generateAccessToken( payload: IJwtPayload): Promise<string>;
  generateRefreshToken(payload: IJwtPayload,clientMetadata: IClientMetadata): Promise<string>;
  generateTokens(
    payload: IJwtPayload,
    clientMetadata: IClientMetadata, 
    resp?: Response //to attach cookies to the response
  ): Promise<ITokenResponse>;
  
  verifyAccessToken(token: string): Promise<IJwtVerifyResponse>;
  verifyRefreshToken(token: string): Promise<IJwtRefreshTokenResponse>;
  
  // setCookies(resp?: Response,...cookies:string[]):void; //rest operator 
  // clearAuthCookies(resp: Response): void;
}
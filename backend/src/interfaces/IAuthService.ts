// src/interfaces/IAuthService.ts
import { Response } from "express";
import { IClientMetadata } from "./IClientMetadataService.js";
import { IJwtRefreshTokenResponse } from "./ITokenManagerService.js";

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload extends ILoginPayload {
  name: string;
  avatar?: string;
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
}

export interface ITokenResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface ITokenVerify{
  userId:string,
  isValid:boolean,
  iat:number,
  exp:number
}

export interface IAuthService {
  register(payload: IRegisterPayload): Promise<IUser>;

  login(
    payload: ILoginPayload,
    clientMetadata: IClientMetadata,
    resp?: Response
  ): Promise<ITokenResponse>;

  refreshTokens(
    refreshToken: string,
    clientMetadata: IClientMetadata,
    resp?: Response
  ): Promise<ITokenResponse>;

  verifyToken(token:string):Promise<ITokenVerify>;
  verifyRefreshToken(refreshToken: string): Promise<IJwtRefreshTokenResponse>;

  logout(refreshToken: string): Promise<void>;
  logoutAll(userId: string): Promise<void>;
}

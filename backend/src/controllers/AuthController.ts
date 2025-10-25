// src/controllers/AuthController.ts
import { Request, Response } from "express";
import {
  IAuthService,
  ILoginPayload,
  IRegisterPayload,
} from "../interfaces/IAuthService.js";
import { IClientMetadataService } from "../interfaces/IClientMetadataService.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class AuthController {
  constructor(
    private authService: IAuthService,
    private clientMetadataService: IClientMetadataService
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const registerPayload: IRegisterPayload = req.body;
    const result = await this.authService.register(registerPayload);
    res
      .status(201)
      .json(ApiResponse.created(result, "User registered successfully"));
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const loginPayload: ILoginPayload = req.body;
    const clientMetadata = this.clientMetadataService.extract(req);
    const result = await this.authService.login(
      loginPayload,
      clientMetadata,
      res
    );
    res.json(ApiResponse.success(result, "Login successful"));
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    await this.authService.logout(refreshToken);
    res.json(ApiResponse.success(undefined, "Logged out successfully"));
  };

  logoutAll = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id.toString();
    await this.authService.logoutAll(userId);
    res.json(ApiResponse.success(undefined, "All sessions logged out"));
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const clientMetadata = this.clientMetadataService.extract(req);
    const result = await this.authService.refreshTokens(
      refreshToken,
      clientMetadata,
      res
    );
    res.json(ApiResponse.success(result, "Token refreshed successfully"));
  };

  verifyToken = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;
    const decoded = await this.authService.verifyToken(token);
    res.json(ApiResponse.success( decoded , "Token is valid"));
  };

  verifyRefreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const data = await this.authService.verifyRefreshToken(refreshToken);
    res.json(ApiResponse.success( data , "RefreshToken is valid"));
  };
}

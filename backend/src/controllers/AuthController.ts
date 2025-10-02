// src/controllers/AuthController.ts
import { Request, Response } from "express";
import {
  IAuthService,
  ILoginPayload,
  IRegisterPayload,
} from "../interfaces/IAuthService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  LoginInput,
  RegisterInput,
} from "../models/schema-validations/AuthValidations.js";

export class AuthController {
  constructor(private authService: IAuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    // Use validated data instead of req.body
    const payload: LoginInput = req.validatedData!;
    const result = await this.authService.login(payload as ILoginPayload);
    const response = ApiResponse.success(result, "Login successful");
    res.status(response.status).json(response);
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const payload: RegisterInput = req.validatedData!;
    const result = await this.authService.register(payload as IRegisterPayload);
    const response = ApiResponse.created(result,"User registered successfully");
    res.status(response.status).json(response);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.validatedData!;
    await this.authService.logout(userId);
    const response = ApiResponse.success(undefined, "Logout successful");
    res.status(response.status).json(response);
  };

  verifyToken = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.replace("Bearer ", "") || "";
    const user = await this.authService.validateToken(token);
    const response = ApiResponse.success(user, "Token is valid");
    res.status(response.status).json(response);
  };
}

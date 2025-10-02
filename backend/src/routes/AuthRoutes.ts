// src/routes/AuthRoutes.ts
import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { IAuthService } from "../interfaces/IAuthService.js";
import {
  validate, 
  validateHeaders
} from "../middlewares/RequestValidator.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { 
  loginSchema, 
  logoutSchema, 
  registerSchema, 
  authHeaderSchema 
} from "../models/schema-validations/AuthValidations.js";

export class AuthRoutes {
  private router: Router;
  private authController: AuthController;

  constructor(authService: IAuthService) {
    this.router = Router();
    this.authController = new AuthController(authService);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Public routes with Zod validation
    this.router.post(
      "/register",
      validate(registerSchema),
      this.authController.register
    );

    this.router.post(
      "/login", 
      validate(loginSchema),
      this.authController.login
    );

    this.router.post(
      "/logout",
      validate(logoutSchema),
      this.authController.logout
    );

    this.router.get(
      "/verify-token",
      validateHeaders(authHeaderSchema),
      this.authController.verifyToken
    );

    // Health check
    this.router.get("/health", (req, res) => {
      const response = ApiResponse.success(undefined, 'Auth service healthy');
      res.status(response.status).json(response);
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}

export const createAuthRoutes = (authService: IAuthService): Router => {
  return new AuthRoutes(authService).getRouter();
};
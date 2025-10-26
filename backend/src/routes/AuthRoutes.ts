// src/routes/AuthRoutes.ts
import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { IAuthService } from "../interfaces/IAuthService.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { IClientMetadataService } from "../interfaces/IClientMetadataService.js";
import { validate } from "../middlewares/requestValidation.js";
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  verifyTokenValidation,
} from "../validations/authValidation.js";

import { authenticate } from "../middlewares/authenticate.js";

export class AuthRoutes {
  private router: Router;
  private authController: AuthController;

  constructor(
    authService: IAuthService,
    clientMetadataService: IClientMetadataService
    // private authenticate: RequestHandler
  ) {
    this.router = Router();
    this.authController = new AuthController(
      authService,
      clientMetadataService
    );
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Public routes
    this.router.post(
      "/register",
      validate(registerValidation),
      this.authController.register
    );
    this.router.post(
      "/login",
      validate(loginValidation),
      this.authController.login
    );
    this.router.post(
      "/refresh-token",
      validate(refreshTokenValidation),
      this.authController.refreshToken
    );

    this.router.post(
      "/verify-token",
      // authenticate,
      validate(verifyTokenValidation), // ✅ Validate empty body
      this.authController.verifyToken
    );

    this.router.post(
      "/verify-refreshToken",
      validate(refreshTokenValidation), // ✅ Validate empty body
      this.authController.verifyRefreshToken
    );

    // Protected routes - with proper validation
    this.router.post("/logout", authenticate, this.authController.logout);
    this.router.post(
      "/logout-all",
      authenticate,
      this.authController.logoutAll
    );

    // Health check (with validation)
    this.router.get("/health", (req, res) => {
      const response = ApiResponse.success(undefined, "Auth service healthy");
      res.status(response.status).json(response);
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}

export const createAuthRoutes = (
  authService: IAuthService,
  clientMetadataService: IClientMetadataService
): Router => new AuthRoutes(authService, clientMetadataService).getRouter();

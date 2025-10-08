// src/App.ts
import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Env from "./configs/Env.js";
import db from "./configs/Database.js";
import { createAuthRoutes } from "./routes/AuthRoutes.js";
import { createChatRoutes } from "./routes/ChatRoutes.js";
import { AuthService } from "./services/AuthService.js";
import { ChatService } from "./services/ChatService.js";
import { errorHandler } from "./utils/errorHandler.js";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class App {
  private app: Express;
  private port: number;
  private server: any;
  private frontendPath: string | null = null;

  constructor() {
    this.app = express();
    this.port = Number(Env.PORT);
    this.findFrontendPath();
  }

  private findFrontendPath(): void {
    try {
      // Try multiple possible paths for frontend dist
      // console.log("__dirname",__dirname,path.resolve(__dirname, '../../frontend/dist'))
      const possiblePaths = [
        // From backend root (chatify-app/backend)
        path.resolve(process.cwd(), '../frontend/dist'),
        // From backend dist (chatify-app/backend/dist)
        // path.resolve(__dirname, "../../frontend/dist"),
      ];

      for (const possiblePath of possiblePaths) {
        console.log(`🔍 Checking frontend path: ${possiblePath}`);
        const indexPath = path.join(possiblePath, "index.html");

        if (fs.existsSync(indexPath)) {
          this.frontendPath = possiblePath;
          console.log(`✅ Found frontend at: ${this.frontendPath}`);
          break;
        }
      }

      if (!this.frontendPath) {
        console.warn(
          "⚠️ Frontend dist directory not found. Running in API-only mode."
        );
        console.log(
          "💡 Make sure to run: npm run build from the root directory first"
        );
      }
    } catch (error) {
      console.warn("⚠️ Error finding frontend path:", error);
    }
  }

  public async initialize(): Promise<void> {
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    await this.initializeDatabase();
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 Server is running on port ${this.port}`);
      console.log(`📍 Frontend URL: http://localhost:${this.port}`);
      console.log(`🔐 API endpoints: http://localhost:${this.port}/api`);

      if (this.frontendPath) {
        console.log(`📁 Serving frontend from: ${this.frontendPath}`);
      } else {
        console.log("⚠️ Frontend not found - serving API only");
      }
    });
  }

  public async stop(): Promise<void> {
    if (this.server) {
      console.log("🛑 Shutting down server...");

      return new Promise((resolve, reject) => {
        this.server.close(async (err: any) => {
          if (err) {
            console.error("Error closing server:", err);
            reject(err);
            return;
          }

          console.log("✅ Server closed");
          await db.disconnect();
          console.log("✅ Database disconnected");
          console.log("🛑 Server stopped gracefully");
          resolve();
        });
      });
    }
  }

  public getApp(): Express {
    return this.app;
  }

  public getPort(): number {
    return this.port;
  }

  private initializeMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Add logging middleware for debugging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use("/api/auth", createAuthRoutes(new AuthService()));
    this.app.use("/api/chat", createChatRoutes(new ChatService()));

    // Health check
    this.app.get("/health", this.handleHealthCheck);

    // Serve frontend if available
    if (this.frontendPath && Env.NODE_ENV === "production") {
      this.serveFrontend();
    }

    // Root route
    this.app.get("/", this.handleRoot);

    // 404 handler
    this.app.use(this.handleNotFound);
  }

  private serveFrontend(): void {
    if (!this.frontendPath) return;

    // Serve static files from frontend dist
    this.app.use(express.static(this.frontendPath));

    // SPA fallback - serve index.html for all non-API routes
    this.app.get(/^(?!\/api).*$/, (req: Request, res: Response) => {
      const indexPath = path.join(this.frontendPath!, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({
          success: false,
          error: "Frontend not found",
          message: "index.html file is missing from frontend build",
        });
      }
    });

    // // SPA fallback - use middleware approach instead of route
    // this.app.use((req: Request, res: Response, next: NextFunction) => {
    //   // Only handle if it's not an API route and not already handled
    //   if (!req.path.startsWith("/api/") && req.method === "GET") {
    //     const indexPath = path.join(this.frontendPath!, "index.html");
    //     if (fs.existsSync(indexPath)) {
    //       res.sendFile(indexPath);
    //     } else {
    //       res.status(404).json({
    //         success: false,
    //         error: "Frontend not found",
    //         message: "index.html file is missing from frontend build",
    //       });
    //     }
    //   }
    // });
    
  }

  private initializeErrorHandling(): void {
    // Global error handler - must be last
    this.app.use(errorHandler);
  }

  private async initializeDatabase(): Promise<void> {
    await db.connect();
  }

  private handleRoot = (req: Request, res: Response): void => {
    // If frontend is available and we're in production, it will be served by the SPA route
    // Otherwise, show API info
    if (this.frontendPath && Env.NODE_ENV === "production") {
      // Let the SPA route handle this
      return;
    }

    res.json({
      success: true,
      message: "Chatify API Server is running!",
      data: {
        timestamp: new Date().toISOString(),
        frontend: this.frontendPath ? "Available" : "Not found",
        endpoints: [
          "GET /health",
          "POST /api/auth/login",
          "POST /api/auth/register",
          "POST /api/auth/logout",
          "GET /api/auth/verify-token",
          "GET /api/chat/send",
        ],
        instructions: this.frontendPath
          ? "Frontend is available at the root URL"
          : "Run 'npm run build' from root to build frontend",
      },
    });
  };

  private handleHealthCheck = (req: Request, res: Response): void => {
    res.json({
      success: true,
      message: "Server is healthy",
      data: {
        timestamp: new Date().toISOString(),
        database: db.getConnectionStatus(),
        frontend: this.frontendPath ? "Available" : "Not found",
        uptime: process.uptime(),
      },
    });
  };

  private handleNotFound = (req: Request, res: Response): void => {
    res.status(404).json({
      success: false,
      error: "Route not found",
      path: req.originalUrl,
      method: req.method,
    });
  };
}

// Create and start the application
const application = new App();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n📦 Received SIGINT, shutting down gracefully...");
  await application.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("📦 Received SIGTERM, shutting down gracefully...");
  await application.stop();
  process.exit(0);
});

// Initialize and start
application
  .initialize()
  .then(() => {
    application.start();
  })
  .catch((error) => {
    console.error("❌ Failed to initialize application:", error);
    process.exit(1);
  });

export default application;

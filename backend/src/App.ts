import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
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
    // Look for frontend in the dist/frontApp directory (copied by copy-frontend.js)
    const frontendBuildPath = path.join(__dirname, "frontApp");
    
    if (fs.existsSync(frontendBuildPath)) {
      this.frontendPath = frontendBuildPath;
      console.log(`✅ Found frontend at: ${this.frontendPath}`);
      
      // Verify index.html exists
      const indexPath = path.join(frontendBuildPath, "index.html");
      if (fs.existsSync(indexPath)) {
        console.log('✅ Found index.html');
      } else {
        console.warn('⚠️ index.html not found in frontApp directory');
        // List what's actually there for debugging
        const files = fs.readdirSync(frontendBuildPath);
        console.log('📁 Files in frontApp directory:', files);
      }
    } else {
      console.warn("⚠️ Frontend dist directory not found. Running in API-only mode.");
      console.log("💡 Expected path:", frontendBuildPath);
      console.log("💡 Run 'npm run build' from root to build and copy frontend");
      this.frontendPath = null;
    }
  } catch (error) {
    console.warn("⚠️ Error finding frontend path:", error);
    this.frontendPath = null;
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
      console.log(`🏥 Health check: http://localhost:${this.port}/health`);

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
    // CORS middleware
    this.app.use(cors({
      origin:true,
      credentials: true,
    }));

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded());
    

    // Add logging middleware for debugging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // API routes - these come first
    this.app.use("/api/auth", createAuthRoutes(new AuthService()));
    this.app.use("/api/chat", createChatRoutes(new ChatService()));

    // Health check
    this.app.get("/health", this.handleHealthCheck);

    // Serve frontend static files if available
    this.serveFrontend();

    // Root route - handle both cases (with and without frontend)
    this.app.get("/", this.handleRoot);

    // 404 handler - must be last
    this.app.use(this.handleNotFound);
  }

  private serveFrontend(): void {
    if (!this.frontendPath) {
      console.log('🚫 Frontend path not available - skipping static file serving');
      return;
    }

    console.log(`📁 Serving static files from: ${this.frontendPath}`);
    
    // Serve static files from frontend dist
    this.app.use(express.static(this.frontendPath, {
      index: false, // Don't serve index.html for directories
      maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
    }));

    // SPA fallback - serve index.html for all non-API routes
    this.app.get(/^(?!\/api).*$/, (req: Request, res: Response) => {
      const indexPath = path.join(this.frontendPath!, "index.html");
      
      if (fs.existsSync(indexPath)) {
        console.log(`🎯 Serving SPA for: ${req.path}`);
        res.sendFile(indexPath);
      } else {
        console.warn(`❌ index.html not found at: ${indexPath}`);
        res.status(404).json({
          success: false,
          error: "Frontend not available",
          message: "The frontend application is not built or deployed yet.",
          instructions: "Run 'npm run build' from the root directory to build the frontend"
        });
      }
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler - must be last
    this.app.use(errorHandler);
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await db.connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  private handleRoot = (req: Request, res: Response): void => {
    // If frontend is available, the SPA route will handle this
    // This only gets called if frontend is not available
    if (!this.frontendPath) {
      res.json({
        success: true,
        message: "Chatify API Server is running!",
        data: {
          timestamp: new Date().toISOString(),
          frontend: "Not available",
          endpoints: [
            "GET /health",
            "POST /api/auth/login",
            "POST /api/auth/register",
            "POST /api/auth/logout",
            "GET /api/auth/verify-token",
            "GET /api/chat/send",
          ],
          instructions: "Run 'npm run build' from root directory to build and deploy the frontend",
        },
      });
    }
    // If frontend is available, the request will be handled by the SPA route
  };

  private handleHealthCheck = (req: Request, res: Response): void => {
    res.json({
      success: true,
      message: "Server is healthy",
      data: {
        timestamp: new Date().toISOString(),
        database: db.getConnectionStatus(),
        frontend: this.frontendPath ? "Available" : "Not found",
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    });
  };

  private handleNotFound = (req: Request, res: Response): void => {
    // If it's an API route, return JSON 404
    if (req.path.startsWith('/api/')) {
      res.status(404).json({
        success: false,
        error: "API route not found",
        path: req.originalUrl,
        method: req.method,
      });
    } else if (this.frontendPath) {
      // If it's a non-API route and frontend exists, let SPA handle routing
      const indexPath = path.join(this.frontendPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({
          success: false,
          error: "Route not found and frontend unavailable",
          path: req.originalUrl,
        });
      }
    } else {
      // No frontend and not API route
      res.status(404).json({
        success: false,
        error: "Route not found",
        path: req.originalUrl,
        method: req.method,
        note: "Frontend is not built. Run 'npm run build' to build the frontend.",
      });
    }
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

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize and start
application
  .initialize()
  .then(() => {
    application.start();
  })
  .catch((error: Error) => {
    console.error("❌ Failed to initialize application:", error);
    process.exit(1);
  });

export default application;
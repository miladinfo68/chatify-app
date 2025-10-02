// src/App.ts
import express, { Express, Request, Response, NextFunction } from "express";
import Env from "./configs/Env.js";
import db from "./configs/Database.js";
import { createAuthRoutes } from "./routes/AuthRoutes.js";
import { createChatRoutes } from "./routes/ChatRoutes.js";
import { AuthService } from "./services/AuthService.js";
import { ChatService } from "./services/ChatService.js";
import { errorHandler } from "./utils/errorHandler.js";

class App {
  private app: Express;
  private port: number;
  private server: any;

  constructor() {
    this.app = express();
    this.port = Number(Env.PORT);
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
      console.log(`📍 Test URL: http://localhost:${this.port}`);
      console.log(`🔐 Auth endpoints: http://localhost:${this.port}/api/auth`);
      console.log(`❤️ Health check: http://localhost:${this.port}/health`);
    });
  }

  public async stop(): Promise<void> {
    if (this.server) {
      console.log('🛑 Shutting down server...');
      
      return new Promise((resolve, reject) => {
        this.server.close(async (err: any) => {
          if (err) {
            console.error('Error closing server:', err);
            reject(err);
            return;
          }
          
          console.log('✅ Server closed');
          await db.disconnect();
          console.log('✅ Database disconnected');
          console.log('🛑 Server stopped gracefully');
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
    // Root route
    this.app.get("/", this.handleRoot);
    
    // Health check
    this.app.get("/health", this.handleHealthCheck);
    
    // Auth routes
    this.app.use("/api/auth", createAuthRoutes(new AuthService()));
    this.app.use("/api/chat", createChatRoutes(new ChatService()));
    
    // 404 handler - FIXED: Use "all" method with "*" pattern
    // this.app.all("*", this.handleNotFound);
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      this.handleNotFound(req, res);
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler - must be last
    this.app.use(errorHandler);
  }

  private async initializeDatabase(): Promise<void> {
    await db.connect();
  }

  private handleRoot = (req: Request, res: Response): void => {
    res.json({ 
      success: true,
      message: "Server is running!", 
      data: {
        timestamp: new Date().toISOString(),
        endpoints: [
          "GET /",
          "GET /health",
          "POST /api/auth/login",
          "POST /api/auth/register", 
          "POST /api/auth/logout",
          "GET /api/auth/verify-token",
          "GET /api/chat/send",
          "GET /api/auth/health"
        ]
      }
    });
  };

  private handleHealthCheck = (req: Request, res: Response): void => {
    res.json({
      success: true,
      message: "Server is healthy",
      data: {
        timestamp: new Date().toISOString(),
        database: db.getConnectionStatus(),
        uptime: process.uptime()
      }
    });
  };

  private handleNotFound = (req: Request, res: Response): void => {
    res.status(404).json({ 
      success: false,
      error: "Route not found",
      path: req.originalUrl,
      method: req.method
    });
  };
}

// Create and start the application
const application = new App();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📦 Received SIGINT, shutting down gracefully...');
  await application.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('📦 Received SIGTERM, shutting down gracefully...');
  await application.stop();
  process.exit(0);
});

// Initialize and start
application.initialize()
  .then(() => {
    application.start();
  })
  .catch((error) => {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  });

export default application;
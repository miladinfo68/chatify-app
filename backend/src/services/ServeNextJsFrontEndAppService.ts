// src/services/NextJsService.ts
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';
import fs from 'fs';
import Env from '../configs/Env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * NextJsService - Integrates Next.js frontend with Express backend
 * 
 * HOW IT WORKS:
 * 1. In production mode, this service runs Next.js as part of the same Node.js process
 * 2. Next.js compiles and serves the React frontend from the /frontend directory
 * 3. Express handles API routes (/api/*) while Next.js handles all other routes
 * 4. Both frontend and backend run in the SAME process - no separate servers needed
 * 
 * ARCHITECTURE:
 * - Single Node.js process running both Express and Next.js
 * - Express middleware chain → API routes → Next.js handler (for non-API routes)
 * - Next.js handles SSR, static generation, and client-side routing
 * 
 * DEPENDENCIES:
 * - Frontend is NOT a dependency of backend
 * - Both are separate codebases in the same monorepo
 * - Backend needs Next.js, React, React-DOM to run the frontend
 */
export class ServeNextJsFrontEndAppService {
  private nextHandler: any;
  private readonly isDev: boolean;
  private readonly nextAppDir: string;

  constructor() {
    this.isDev = Env.NODE_ENV !== 'production';
    
    /**
     * PATH RESOLUTION EXPLANATION:
     * - __dirname: /app/backend/dist/services (in Docker) or local dist path
     * - path.join(__dirname, '..', '..', '..'): goes up to project root (/app)
     * - then '/frontend': points to frontend source code
     * 
     * Directory structure:
     * /app (project root in Docker)
     *   ├── frontend/          # Next.js source code
     *   │   ├── app/
     *   │   ├── public/
     *   │   └── package.json
     *   ├── backend/           # Express backend
     *   │   ├── src/
     *   │   └── dist/
     *   └── docker-compose.yml
     */
    this.nextAppDir = path.join(__dirname, '..', '..', '..', 'frontend');
    console.log(`📂 Calculated frontend path: ${this.nextAppDir}`);
  }

  /**
   * Initializes Next.js application
   * - In development: runs Next.js in dev mode with hot reload
   * - In production: uses pre-built Next.js application
   * - Creates a request handler that processes React pages
   */
  public async init(): Promise<void> {
    try {
      console.log(`🚀 Initializing Next.js (${this.isDev ? 'dev' : 'prod'})`);
      console.log(`📂 App directory: ${this.nextAppDir}`);

      // Verify the frontend directory exists
      if (!this.directoryExists(this.nextAppDir)) {
        console.error(`❌ Frontend directory not found: ${this.nextAppDir}`);
        console.log('💡 Current working directory:', process.cwd());
        
        // Debug: List project root contents
        const projectRoot = path.join(__dirname, '..', '..', '..');
        if (fs.existsSync(projectRoot)) {
          const files = fs.readdirSync(projectRoot);
          console.log('📁 Project root contents:', files);
        }
        throw new Error(`Frontend directory not found: ${this.nextAppDir}`);
      }

      /**
       * DYNAMIC IMPORT EXPLANATION:
       * - Next.js doesn't have great TypeScript support when imported
       * - Dynamic import avoids TypeScript compilation issues
       * - 'next' package must be installed in backend/node_modules
       */
      const nextModule = await import('next');
      const createNextApp = nextModule.default as any;

      /**
       * NEXT.JS APP CREATION:
       * - dev: true = development mode with hot reload
       * - dev: false = production mode using pre-built files
       * - dir: points to frontend directory containing Next.js app
       */
      const nextApp = createNextApp({
        dev: this.isDev,
        dir: this.nextAppDir,
      });

      // Prepares Next.js (builds in dev, loads build in prod)
      await nextApp.prepare();
      
      /**
       * REQUEST HANDLER:
       * - This function handles all non-API HTTP requests
       * - It renders React pages, serves static assets, handles client-side routing
       * - Integrated into Express middleware chain
       */
      this.nextHandler = nextApp.getRequestHandler();

      console.log('✅ Next.js ready to handle requests');
    } catch (error) {
      console.error('❌ Failed to initialize Next.js:', error);
      // Graceful degradation: run in API-only mode if Next.js fails
      this.nextHandler = null;
    }
  }

  /**
   * Returns Express middleware function that handles frontend requests
   * 
   * REQUEST FLOW:
   * 1. HTTP Request → Express Server
   * 2. Express Middleware (CORS, JSON parsing, etc.)
   * 3. API Routes (/api/*) → Express handlers
   * 4. Non-API Routes (*) → Next.js handler (this function)
   * 5. Next.js renders React pages or serves static assets
   */
  public getRequestHandler() {
    if (!this.nextHandler) {
      // Fallback when Next.js is not available
      return (req: Request, res: Response) => {
        if (req.path.startsWith('/api/')) {
          return; // Let API routes handle it
        }
        res.status(503).json({
          success: false,
          error: 'Frontend not available',
          message: 'Next.js frontend is not running',
          instructions: 'Make sure the frontend directory exists and is built'
        });
      };
    }
    
    // Main Next.js request handler
    return (req: Request, res: Response) => {
      console.log(`🎯 Next.js handling: ${req.method} ${req.url}`);
      return this.nextHandler(req, res);
    };
  }

  public async close(): Promise<void> {
    console.log('🔌 Next.js service closed');
  }

  private directoryExists(dirPath: string): boolean {
    try {
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  }
}
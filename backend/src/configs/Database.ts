// src/configs/Database.ts
import mongoose from "mongoose";
import Env from "./Env.js";

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("✅ MongoDB already connected");
      return;
    }

    try {
      const MONGODB_URI = Env.MONGODB_URI;
      if (!MONGODB_URI) {
        console.log("🔌 MONGODB_URI not provided");
        return;
      }

      console.log("🔌 Connecting to MongoDB...");

      await mongoose.connect(MONGODB_URI, {
        // These options are no longer needed in mongoose 6+ but kept for reference
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
      });

      this.isConnected = true;
      console.log("✅ MongoDB connected successfully");

      // MongoDB connection event listeners
      mongoose.connection.on("connected", () => {
        console.log("✅ Mongoose connected to MongoDB");
      });

      mongoose.connection.on("error", (err) => {
        console.error("❌ Mongoose connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ Mongoose disconnected from MongoDB");
        this.isConnected = false;
      });

      // Handle application termination
      process.on("SIGINT", this.gracefulShutdown);
      process.on("SIGTERM", this.gracefulShutdown);

    } catch (error) {

      console.error("❌ MongoDB connection failed:", error);
      process.exit(1);
      
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.log("ℹ️ MongoDB already disconnected");
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("✅ MongoDB disconnected successfully");
    } catch (error) {
      console.error("❌ Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getNativeConnection(): typeof mongoose.connection {
    return mongoose.connection;
  }

  private gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`\n⚠️ Received ${signal}. Closing MongoDB connection...`);
    await this.disconnect();
    process.exit(0);
  };
}

export default Database.getInstance();

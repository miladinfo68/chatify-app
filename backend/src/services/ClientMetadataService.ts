// src/services/ClientMetadataService.ts
import { Request } from "express";
import {
  IClientMetadata,
  IClientMetadataService,
} from "../interfaces/IClientMetadataService.js";

export class ClientMetadataService implements IClientMetadataService {
  extract(req: Request): IClientMetadata {
    // console.log("xxxx req",req);

    // 1. Try X-Forwarded-For (for proxies, Cloudflare, Nginx, etc.)
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      const ip = typeof forwarded === "string"
          ? forwarded.split(",")[0].trim()
          : forwarded[0];
      return {
        ip: this.normalizeIp(ip),
        userAgent: this.getUserAgent(req),
      };
    }

    // 2. Use req.ip (reliable if app.set('trust proxy', true) is configured)
    if (req.ip) {
      return {
        ip: this.normalizeIp(req.ip),
        userAgent: this.getUserAgent(req),
      };
    }

    // 3. Fallback to socket (direct connection, e.g., localhost)
    const socketIp = req.socket?.remoteAddress;
    return {
      ip: socketIp ? this.normalizeIp(socketIp) : "unknown",
      userAgent: this.getUserAgent(req),
    };
  }

  private normalizeIp(ip: string): string {
    // Convert IPv4-mapped IPv6 (e.g., ::ffff:192.168.1.1 → 192.168.1.1)
    return ip.replace(/^::ffff:/, "");
  }

  private getUserAgent(req: Request): string {
    return req.get("User-Agent") || "unknown";
  }
}

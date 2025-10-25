// src/interfaces/IClientMetadataService.ts
import { Request } from "express";

export interface IClientMetadataService {
  extract(req: Request): IClientMetadata;
}

export interface IClientMetadata {
  ip: string;
  userAgent: string;
}
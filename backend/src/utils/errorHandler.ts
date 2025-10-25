// src/utils/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "./ApiResponse.js";
import Env from "../configs/Env.js";
import { UnauthorizedError } from "./CustomError.js";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  // Log error details
  if (Env.NODE_ENV !== "production") {
    console.error("🚨 Error Details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  } else {
    console.error("🚨 Error:", {
      name: error.name,
      message: error.message,
      url: req.url,
      method: req.method,
    });
  }

  // MongoDB duplicate key error
  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const response = ApiResponse.conflict(`${field} already exists`);
    return res.status(response.status).json(response);
  }

  // MongoDB validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    const response = ApiResponse.badRequest(messages.join(", "));
    return res.status(response.status).json(response);
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    const response = ApiResponse.unauthorized("Invalid token");
    return res.status(response.status).json(response);
  }

  if (error.name === "TokenExpiredError") {
    const response = ApiResponse.unauthorized("Token expired");
    return res.status(response.status).json(response);
  }

  // Custom errors with statusCode property
  if (error.statusCode && typeof error.statusCode === "number") {
    const response = ApiResponse.error(error.message, error.statusCode);
    return res.status(response.status).json(response);
  }

  // Default error
  const message = Env.NODE_ENV === "production" && error.statusCode >= 500
    ? "Internal server error"
    : error.message;

  const status = error.statusCode || 500;
  const response = ApiResponse.error(message, status);
  res.status(response.status).json(response);
};
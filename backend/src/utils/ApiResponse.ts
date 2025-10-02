// src/utils/ApiResponse.ts
import IApiResponse from '../interfaces/IApiResponse.js';

export class ApiResponse {
  static success<T>(data: T, message?: string, status: number = 200): IApiResponse<T> {
    return {
      success: true,
      data,
      status,
      message: message || 'Success',
      timestamp: new Date().toISOString()
    };
  }

  static error(message: string, status: number = 500): IApiResponse<undefined> {
    return {
      success: false,
      status,
      message,
      timestamp: new Date().toISOString()
    };
  }

  static created<T>(data: T, message?: string): IApiResponse<T> {
    return this.success(data, message || 'Item Created successfully', 201);
  }

  static noContent(message?: string): IApiResponse<undefined> {
    return this.success(undefined, message || 'No content', 204);
  }

  static badRequest(message?: string): IApiResponse<undefined> {
    return this.error(message || 'Bad request', 400);
  }

  static unauthorized(message?: string): IApiResponse<undefined> {
    return this.error(message || 'Unauthorized', 401);
  }

  static forbidden(message?: string): IApiResponse<undefined> {
    return this.error(message || 'Forbidden', 403);
  }

  static notFound(message?: string): IApiResponse<undefined> {
    return this.error(message || 'Not found', 404);
  }

  static conflict(message?: string): IApiResponse<undefined> {
    return this.error(message || 'Conflict', 409);
  }

  static internalError(message?: string): IApiResponse<undefined> {
    return this.error(message || 'Internal server error', 500);
  }
}
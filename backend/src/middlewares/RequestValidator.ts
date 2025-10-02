// src/middlewares/RequestValidator.ts

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../utils/ApiResponse.js';

// Extended Request interface to include validated data
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      validatedParams?: any;
      validatedQuery?: any;
    }
  }
}

type ValidationSource = 'body' | 'params' | 'query' | 'headers';
type ValidationTarget = 'validatedData' | 'validatedParams' | 'validatedQuery';

// Generic validation function
const createValidator = <T extends z.ZodSchema>(
  source: ValidationSource,
  target?: ValidationTarget
) => {
  return (schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const data = req[source];
      const result = schema.safeParse(data);

      if (!result.success) {
        const errorMessages = result.error.issues.map(issue => 
          issue.path.length > 0 
            ? `${issue.path.join('.')}: ${issue.message}`
            : issue.message
        ).join(', ');
        
        const response = ApiResponse.badRequest(errorMessages);
        res.status(response.status).json(response);
        return;
      }

      // Store validated data in req object if target is provided
      if (target) {
        (req as any)[target] = result.data;
      }

      next();
    };
  };
};

// Specific validators using the generic factory
//validate [req.body] if it was valid attach [req.validatedData] to request
export const validate = createValidator('body', 'validatedData');

//validate [req.params] if it was valid attach [req.validatedParams] to request
export const validateParams = createValidator('params', 'validatedParams');

//validate [req.query] if it was valid attach [req.validatedQuery] to request
export const validateQuery = createValidator('query', 'validatedQuery');

//validate [req.headers] 
export const validateHeaders = createValidator('headers'); // No target for headers
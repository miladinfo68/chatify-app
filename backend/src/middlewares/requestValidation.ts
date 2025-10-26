// src/middlewares/requestValidation.ts
import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'yup';
import {CustomError} from '../utils/customError.js'

export const validate = (schema: AnySchema) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    return next();
  } catch (err: any) {
    return next(new CustomError(err.message, 400));
  }
};
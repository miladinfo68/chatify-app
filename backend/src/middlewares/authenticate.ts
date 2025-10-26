// src/middlewares/authenticate.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from '../utils/customError.js';
import Env from '../configs/Env.js';
import User, { IUser } from '../models/User.js';
import { IJwtVerifyResponse } from '../interfaces/ITokenManagerService.js';

declare global {
  namespace Express {
    interface Request {
      //attach user to request
      user?: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new CustomError('Access token is required', 401));
    }
    const decoded = jwt.verify(token, Env.JWT_SECRET as string) as IJwtVerifyResponse;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new CustomError('User not found', 401));
    }

    // Check if user logged out after token was issued
    if (user.lastLogout && decoded.iat * 1000 < user.lastLogout.getTime()) {
      return next(new CustomError('Token expired due to logout', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new CustomError('Invalid access token', 401));
  }
};














// import { Request, Response, NextFunction } from "express";
// import { ITokenManagerService } from "../interfaces/ITokenManagerService.js";
// import { UnauthorizedError } from "../utils/CustomError.js";
// import { User } from "../models/User.js";
// import Env from "../configs/Env.js";
// import { getCookieOptions } from "../configs/cookieConfig.js";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         userId: string;
//         iat: number;
//         exp: number;
//       };
//     }
//   }
// }

// export const createAuthenticateMiddleware = (tokenManager: ITokenManagerService) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       let token: string | undefined = undefined;
//       let tokenSource: 'header' | 'cookie' | undefined = undefined;

//       // 1. Try Authorization header first (explicit method)
//       const authHeader = req.headers.authorization;
//       if (authHeader && authHeader.startsWith("Bearer ")) {
//         token = authHeader.substring(7); // Remove "Bearer " prefix
//         tokenSource = 'header';
//       }

//       // 2. If no header, try cookie (implicit method)
//       if (!token && req.cookies) {
//         token = req.cookies[Env.COOKIE_ACCESS_TOKEN as string];
//         tokenSource = 'cookie';
//       }

//       // 3. No token found
//       if (!token) {
//         throw new UnauthorizedError(
//           "Authentication required. Provide Bearer token in Authorization header or access token cookie."
//         );
//       }

//       // 4. Verify token (this validates both JWT structure and expiration)
//       const decoded = await tokenManager.verifyAccessToken(token);

//       // 5. Ensure user exists and is active
//       const user = await User.findById(decoded.userId).select('-password');
//       if (!user) {
//         throw new UnauthorizedError("User account not found");
//       }

//       // 6. Optional: Check if user was logged out after token was issued
//       if (user.lastLogout && decoded.iat * 1000 < user.lastLogout.getTime()) {
//         throw new UnauthorizedError("Session expired. Please login again.");
//       }

//       // 7. Attach user info to request
//       req.user = {
//         userId: decoded.userId,
//         iat: decoded.iat,
//         exp: decoded.exp
//       };

//       // 8. Add token source to response headers for debugging
//       res.set('X-Token-Source', tokenSource);

//       next();
//     } catch (error) {
//       // Clear cookies on any authentication error when using cookie-based auth
//       if (req.cookies?.[Env.COOKIE_ACCESS_TOKEN as string]) {
//         const baseOptions = getCookieOptions();
        
//         // Clear both cookies properly
//         res.clearCookie(Env.COOKIE_ACCESS_TOKEN as string, {
//           ...baseOptions,
//           path: '/',
//         });
        
//         res.clearCookie(Env.COOKIE_REFRESH_TOKEN as string, {
//           ...baseOptions,
//           path: Env.REFRESH_TOKEN_PATH,
//         });
//       }
//       next(error);
//     }
//   };
// };
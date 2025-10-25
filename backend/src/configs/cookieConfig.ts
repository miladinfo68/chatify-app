// src/configs/cookieConfig.ts
import { CookieOptions } from 'express';
import ms, { StringValue } from "ms";
import Env from "./Env.js";

export const getCookieOptions = () :CookieOptions=> {
  const isProduction = Env.NODE_ENV === 'production';
  return {
    httpOnly: true, // Prevent XSS
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    path: '/',
    maxAge: 0, // Will be set per cookie
    domain: isProduction ? Env.Domain  : undefined, 
  } as CookieOptions;;
};

// Specific cookie configurations
export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...getCookieOptions(),
  maxAge: ms(Env.ACCESS_TOKEN_EXPIRES as StringValue),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...getCookieOptions(),
  maxAge: ms(Env.REFRESH_TOKEN_EXPIRES as StringValue),
  path: Env.REFRESH_TOKEN_PATH, // More restrictive path
});
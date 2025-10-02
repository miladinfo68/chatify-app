// src/models/schema-validations/AuthValidations.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Valid email is required"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.email("Valid email is required"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

export const logoutSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const verifyTokenSchema = z.object({
  authorization: z
    .string()
    .regex(/^Bearer /, "Authorization header must start with Bearer"),
});

export const authHeaderSchema = z.object({
  authorization: z
    .string()
    .refine(
      (val) => val.startsWith("Bearer "),
      'Authorization header must start "Bearer "'
    ),
});

// Infer TypeScript types from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;

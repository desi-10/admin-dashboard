import { z } from "zod";

export const LoginCredentialsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const AuthResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: UserSchema.optional(),
});

export type AuthResult = z.infer<typeof AuthResultSchema>;

export const SessionDataSchema = z.object({
  userId: z.string(),
  username: z.string(),
  createdAt: z.number(),
  expiresAt: z.number(),
});

export type SessionData = z.infer<typeof SessionDataSchema>;

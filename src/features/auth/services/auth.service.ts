import {
  LoginCredentialsSchema,
  type LoginCredentials,
  type AuthResult,
  type User,
} from "../types/auth.types";

const HARDCODED_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export function validateCredentials(username: string, password: string): boolean {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  return (
    trimmedUsername === HARDCODED_CREDENTIALS.username &&
    trimmedPassword === HARDCODED_CREDENTIALS.password
  );
}

export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  const validated = LoginCredentialsSchema.parse(credentials);

  const isValid = validateCredentials(validated.username, validated.password);

  if (!isValid) {
    return {
      success: false,
      message: "Invalid username or password",
    };
  }

  const user: User = {
    id: "1",
    username: validated.username,
  };

  return {
    success: true,
    message: "Login successful",
    user,
  };
}

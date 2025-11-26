import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { login } from "@/features/auth/services/auth.service";
import { createSession, setSessionCookie } from "@/app/lib/auth";
import { LoginCredentialsSchema } from "@/features/auth/types/auth.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const credentials = LoginCredentialsSchema.parse(body);

    const result = await login(credentials);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    if (!result.user) {
      return NextResponse.json(
        { success: false, message: "Authentication error occurred" },
        { status: 500 }
      );
    }

    const sessionToken = createSession(result.user);
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      message: result.message,
      user: {
        id: result.user.id,
        username: result.user.username,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed. Use POST to login." },
    { status: 405 }
  );
}

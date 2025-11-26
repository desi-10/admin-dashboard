import { NextResponse } from "next/server";
import { clearSession } from "@/app/lib/auth";

export async function POST() {
  try {
    await clearSession();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout API error:", error);

    return NextResponse.json(
      { success: false, message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed. Use POST to logout." },
    { status: 405 }
  );
}

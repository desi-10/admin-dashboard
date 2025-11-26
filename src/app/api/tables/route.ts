import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as tableService from "@/features/tables/services/tables.service";

const QuerySchema = z.object({
  url: z.string().min(1, "Database URL is required"),
});

export async function GET(request: NextRequest) {
  try {
    const rawParams = Object.fromEntries(request.nextUrl.searchParams);
    const { url } = QuerySchema.parse(rawParams);

    const tables = await tableService.getAllTables({ url });

    return NextResponse.json({
      success: true,
      data: tables,
      count: tables.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error fetching tables:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch tables",
      },
      { status: 500 }
    );
  }
}

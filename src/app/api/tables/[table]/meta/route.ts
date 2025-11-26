import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as tableService from "@/features/tables/services/tables.service";

const QuerySchema = z.object({
  url: z.string().min(1, "Database URL is required"),
});

interface RouteParams {
  params: Promise<{ table: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { table } = await params;
    const url = request.nextUrl.searchParams.get("url");

    QuerySchema.parse({ url });

    const meta = await tableService.getTableMeta({ url: url! }, table);

    if (!meta) {
      return NextResponse.json(
        { success: false, message: `Table "${table}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: meta });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error fetching table metadata:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch table metadata",
      },
      { status: 500 }
    );
  }
}

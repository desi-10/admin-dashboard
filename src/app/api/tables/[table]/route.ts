import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as tableService from "@/features/tables/services/tables.service";
import { ListRecordsParamsSchema } from "@/features/tables/types/tables.types";

const QuerySchema = z.object({
  url: z.string().min(1, "Database URL is required"),
});

interface RouteParams {
  params: Promise<{ table: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { table } = await params;
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);

    const { url, ...queryParams } = searchParams;
    QuerySchema.parse({ url });

    const listParams = ListRecordsParamsSchema.parse(queryParams);
    const result = await tableService.listRecords({ url }, table, listParams);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error listing records:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch records",
      },
      { status: 500 }
    );
  }
}

const CreateBodySchema = z
  .record(z.string(), z.unknown())
  .refine((data) => Object.keys(data).length > 0, {
    message: "Request body is required",
  });

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { table } = await params;
    const url = request.nextUrl.searchParams.get("url");

    QuerySchema.parse({ url });

    const body = await request.json();
    const validatedBody = CreateBodySchema.parse(body);

    const result = await tableService.createRecord(
      { url: url! },
      table,
      validatedBody
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating record:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create record",
      },
      { status: 500 }
    );
  }
}

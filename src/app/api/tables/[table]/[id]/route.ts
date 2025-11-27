import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as tableService from "@/features/tables/services/tables.service";

const QuerySchema = z.object({
  url: z.string().min(1, "Database URL is required"),
});

const UpdateBodySchema = z
  .record(z.string(), z.unknown())
  .refine((data) => Object.keys(data).length > 0, {
    message: "Request body is required",
  });

interface RouteParams {
  params: Promise<{ table: string; id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { table, id } = await params;
    const url = request.nextUrl.searchParams.get("url");

    QuerySchema.parse({ url });
    const record = await tableService.getRecord({ url: url! }, table, id);

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error fetching record:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch record",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { table, id } = await params;
    const url = request.nextUrl.searchParams.get("url");

    QuerySchema.parse({ url });

    const body = await request.json();
    const validatedBody = UpdateBodySchema.parse(body);

    const result = await tableService.updateRecord(
      { url: url! },
      table,
      id,
      validatedBody
    );

    if (!result.success) {
      const status = result.message === "Record not found" ? 404 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating record:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update record",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { table, id } = await params;
    const url = request.nextUrl.searchParams.get("url");

    QuerySchema.parse({ url });

    const result = await tableService.deleteRecord({ url: url! }, table, id);

    if (!result.success) {
      const status = result.message === "Record not found" ? 404 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error deleting record:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete record",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params });
}

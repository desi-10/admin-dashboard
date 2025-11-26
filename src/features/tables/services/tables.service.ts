import { sql } from "kysely";
import { getDB } from "@/app/lib/manager";
import { extractMetadata } from "@/app/lib/extractor";
import {
  DbContextSchema,
  ListRecordsParamsSchema,
  RecordDataSchema,
  RecordIdSchema,
  type DbContext,
  type ListRecordsParams,
  type ListRecordsResult,
  type MutationResult,
  type DeleteResult,
  type TableMeta,
} from "../types/tables.types";

export async function getAllTables(ctx: DbContext): Promise<TableMeta[]> {
  const validated = DbContextSchema.parse(ctx);
  return extractMetadata(validated.url);
}

export async function getTableMeta(
  ctx: DbContext,
  tableName: string
): Promise<TableMeta | null> {
  const tables = await getAllTables(ctx);
  return tables.find((t) => t.name === tableName) ?? null;
}

export async function getPrimaryKey(
  ctx: DbContext,
  tableName: string
): Promise<string> {
  const meta = await getTableMeta(ctx, tableName);
  if (!meta) return "id";
  const pkColumn = meta.columns.find((col) => col.primaryKey);
  return pkColumn?.name ?? "id";
}

export async function listRecords(
  ctx: DbContext,
  tableName: string,
  params: Partial<ListRecordsParams> = {}
): Promise<ListRecordsResult> {
  const validated = DbContextSchema.parse(ctx);
  const queryParams = ListRecordsParamsSchema.parse(params);

  const db = getDB(validated.url);
  if (!db) {
    throw new Error("Failed to connect to database");
  }

  const { page, limit, sortBy, sortOrder } = queryParams;
  const offset = (page - 1) * limit;

  const countResult = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM ${sql.raw(`"${tableName}"`)}
  `.execute(db);

  const total = parseInt(countResult.rows[0]?.count ?? "0", 10);

  let query = db
    .selectFrom(tableName as never)
    .selectAll()
    .limit(limit)
    .offset(offset);

  if (sortBy) {
    query = query.orderBy(sortBy as never, sortOrder);
  }

  const data = await query.execute();

  return {
    data: data as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getRecord(
  ctx: DbContext,
  tableName: string,
  id: string | number
): Promise<Record<string, unknown> | null> {
  const validated = DbContextSchema.parse(ctx);
  const validatedId = RecordIdSchema.parse(id);

  const db = getDB(validated.url);
  if (!db) {
    throw new Error("Failed to connect to database");
  }

  const pkColumn = await getPrimaryKey(ctx, tableName);

  const result = await db
    .selectFrom(tableName as never)
    .selectAll()
    .where(pkColumn as never, "=", validatedId as never)
    .executeTakeFirst();

  return (result as Record<string, unknown>) ?? null;
}

export async function createRecord(
  ctx: DbContext,
  tableName: string,
  data: Record<string, unknown>
): Promise<MutationResult> {
  const validated = DbContextSchema.parse(ctx);
  const validatedData = RecordDataSchema.parse(data);

  const db = getDB(validated.url);
  if (!db) {
    return { success: false, message: "Failed to connect to database" };
  }

  try {
    const cleanData = Object.fromEntries(
      Object.entries(validatedData).filter(([, v]) => v !== undefined)
    );

    const result = await db
      .insertInto(tableName as never)
      .values(cleanData as never)
      .returningAll()
      .executeTakeFirst();

    return {
      success: true,
      message: "Record created successfully",
      data: result as Record<string, unknown>,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create record";
    return { success: false, message };
  }
}

export async function updateRecord(
  ctx: DbContext,
  tableName: string,
  id: string | number,
  data: Record<string, unknown>
): Promise<MutationResult> {
  const validated = DbContextSchema.parse(ctx);
  const validatedId = RecordIdSchema.parse(id);
  const validatedData = RecordDataSchema.parse(data);

  const db = getDB(validated.url);
  if (!db) {
    return { success: false, message: "Failed to connect to database" };
  }

  try {
    const pkColumn = await getPrimaryKey(ctx, tableName);

    const cleanData = Object.fromEntries(
      Object.entries(validatedData).filter(
        ([key, v]) => v !== undefined && key !== pkColumn
      )
    );

    if (Object.keys(cleanData).length === 0) {
      return { success: false, message: "No fields to update" };
    }

    const result = await db
      .updateTable(tableName as never)
      .set(cleanData as never)
      .where(pkColumn as never, "=", validatedId as never)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      return { success: false, message: "Record not found" };
    }

    return {
      success: true,
      message: "Record updated successfully",
      data: result as Record<string, unknown>,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update record";
    return { success: false, message };
  }
}

export async function deleteRecord(
  ctx: DbContext,
  tableName: string,
  id: string | number
): Promise<DeleteResult> {
  const validated = DbContextSchema.parse(ctx);
  const validatedId = RecordIdSchema.parse(id);

  const db = getDB(validated.url);
  if (!db) {
    return { success: false, message: "Failed to connect to database" };
  }

  try {
    const pkColumn = await getPrimaryKey(ctx, tableName);

    const result = await db
      .deleteFrom(tableName as never)
      .where(pkColumn as never, "=", validatedId as never)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      return { success: false, message: "Record not found" };
    }

    return {
      success: true,
      message: "Record deleted successfully",
      deletedId: id,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete record";
    return { success: false, message };
  }
}

export async function executeRawQuery(
  ctx: DbContext,
  query: string
): Promise<{ success: boolean; data?: unknown[]; message?: string }> {
  const validated = DbContextSchema.parse(ctx);

  const db = getDB(validated.url);
  if (!db) {
    return { success: false, message: "Failed to connect to database" };
  }

  try {
    const result = await sql.raw(query).execute(db);
    return { success: true, data: result.rows as unknown[] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Query execution failed";
    return { success: false, message };
  }
}

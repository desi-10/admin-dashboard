import { z } from "zod";
import type { TableMeta } from "@/app/lib/types";

export const ListRecordsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type ListRecordsParams = z.infer<typeof ListRecordsParamsSchema>;

export const DbContextSchema = z.object({
  url: z.string().min(1, "Database URL is required"),
});

export type DbContext = z.infer<typeof DbContextSchema>;

export const RecordDataSchema = z
  .record(z.string(), z.unknown())
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type RecordData = z.infer<typeof RecordDataSchema>;

export const RecordIdSchema = z.union([z.string().min(1), z.number().int()]);

export type RecordId = z.infer<typeof RecordIdSchema>;

export interface ListRecordsResult {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MutationResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface DeleteResult {
  success: boolean;
  message: string;
  deletedId?: string | number;
}

export type { TableMeta };

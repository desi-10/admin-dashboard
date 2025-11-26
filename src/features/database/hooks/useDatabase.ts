import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TableMeta } from "@/app/lib/types";
import {
  createRecord,
  deleteRecord,
  batchDeleteRecords,
  getTableMeta,
  getTables,
  testConnection,
  updateRecord,
} from "@/features/tables/api/tables";
import { listRecords } from "@/features/tables/api/tables";

export function useTestConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dbUrl: string) => testConnection(dbUrl),
    onSuccess: (data, dbUrl) => {
      queryClient.setQueryData(["tables", dbUrl], data);
    },
  });
}

export function useTables(dbUrl: string) {
  return useQuery<TableMeta[]>({
    queryKey: ["tables", dbUrl],
    queryFn: () => getTables(dbUrl),
    enabled: !!dbUrl,
  });
}

interface TableRecordsParams {
  dbUrl: string;
  tableName: string;
  page: number;
  limit: number;
}

interface TableRecordsResponse {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  totalPages: number;
}

export function useTableRecords({
  dbUrl,
  tableName,
  page,
  limit,
}: TableRecordsParams) {
  return useQuery<TableRecordsResponse>({
    queryKey: ["records", dbUrl, tableName, page, limit],
    queryFn: () => listRecords(dbUrl, tableName, page, limit),
    enabled: !!dbUrl && !!tableName,
  });
}

export function useTableMeta(dbUrl: string | null, tableName: string | null) {
  return useQuery<TableMeta | null>({
    queryKey: ["tableMeta", dbUrl, tableName],
    queryFn: () => getTableMeta(dbUrl || "", tableName || ""),
    enabled: !!dbUrl && !!tableName,
  });
}

interface CreateRecordParams {
  dbUrl: string;
  tableName: string;
  data: Record<string, unknown>;
}

export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dbUrl, tableName, data }: CreateRecordParams) =>
      createRecord(dbUrl, tableName, data),
    onSuccess: (_, { dbUrl, tableName }) => {
      queryClient.invalidateQueries({
        queryKey: ["records", dbUrl, tableName],
      });
    },
  });
}

interface UpdateRecordParams {
  dbUrl: string;
  tableName: string;
  id: string;
  data: Record<string, unknown>;
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dbUrl, tableName, id, data }: UpdateRecordParams) =>
      updateRecord(dbUrl, tableName, id, data),
    onSuccess: (_, { dbUrl, tableName }) => {
      queryClient.invalidateQueries({
        queryKey: ["records", dbUrl, tableName],
      });
    },
  });
}

interface DeleteRecordParams {
  dbUrl: string;
  tableName: string;
  id: string;
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dbUrl, tableName, id }: DeleteRecordParams) =>
      deleteRecord(dbUrl, tableName, id),
    onSuccess: (_, { dbUrl, tableName }) => {
      queryClient.invalidateQueries({
        queryKey: ["records", dbUrl, tableName],
      });
    },
  });
}

interface BatchDeleteParams {
  dbUrl: string;
  tableName: string;
  ids: string[];
}

export function useBatchDeleteRecords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dbUrl, tableName, ids }: BatchDeleteParams) =>
      batchDeleteRecords(dbUrl, tableName, ids),
    onSuccess: (_, { dbUrl, tableName }) => {
      queryClient.invalidateQueries({
        queryKey: ["records", dbUrl, tableName],
      });
    },
  });
}

import axios from "axios";
import { ListRecordsResult, MutationResult } from "../types/tables.types";
import { TableMeta } from "@/app/lib/types";

export async function testConnection(dbUrl: string) {
  const { data } = await axios.get(
    `/api/tables?url=${encodeURIComponent(dbUrl)}`
  );
  return data;
}

export async function getTables(dbUrl: string): Promise<TableMeta[]> {
  const { data } = await axios.get(
    `/api/tables?url=${encodeURIComponent(dbUrl)}`
  );
  return data;
}

export async function listRecords(
  dbUrl: string,
  tableName: string,
  page: number,
  limit: number
): Promise<ListRecordsResult> {
  const { data } = await axios.get(
    `/api/tables/${tableName}?url=${encodeURIComponent(
      dbUrl
    )}&page=${page}&limit=${limit}`
  );
  return data as ListRecordsResult;
}

export async function getTableMeta(dbUrl: string, tableName: string) {
  const { data } = await axios.get(
    `/api/tables/${tableName}/meta?url=${encodeURIComponent(dbUrl)}`
  );
  return data;
}

export async function createRecord(
  dbUrl: string,
  tableName: string,
  data: Record<string, unknown>
): Promise<MutationResult> {
  const { data: result } = await axios.post(
    `/api/tables/${tableName}?url=${encodeURIComponent(dbUrl)}`,
    data
  );
  return result;
}

export async function updateRecord(
  dbUrl: string,
  tableName: string,
  id: string,
  data: Record<string, unknown>
): Promise<MutationResult> {
  const { data: result } = await axios.put(
    `/api/tables/${tableName}/${id}?url=${encodeURIComponent(dbUrl)}`,
    data
  );
  return result;
}

export async function deleteRecord(
  dbUrl: string,
  tableName: string,
  id: string
): Promise<MutationResult> {
  const { data: result } = await axios.delete(
    `/api/tables/${tableName}/${id}?url=${encodeURIComponent(dbUrl)}`
  );
  return result;
}

export async function batchDeleteRecords(
  dbUrl: string,
  tableName: string,
  ids: string[]
): Promise<MutationResult> {
  const { data: result } = await axios.delete(
    `/api/tables/${tableName}?url=${encodeURIComponent(dbUrl)}&ids=${ids.join(
      ","
    )}`
  );
  return result;
}

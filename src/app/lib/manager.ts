import { createDB } from "./db";
import type { Kysely } from "kysely";

const dbCache = new Map<string, Kysely<unknown>>();

export function getDB(url: string) {
  if (!dbCache.has(url)) {
    dbCache.set(url, createDB(url));
  }
  return dbCache.get(url);
}

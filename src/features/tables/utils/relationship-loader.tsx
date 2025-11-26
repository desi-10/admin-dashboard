import { Kysely, sql } from "kysely";
import type { TableMeta } from "../types/tables.types";

export type LoadedRecord = Record<string, unknown>;

/**
 * Loads relational data for a single row.
 * Supports:
 *  - Many-to-one (foreign key → referenced table)
 *  - One-to-many (referenced by other tables)
 */
export async function loadRelationsForRecord(
  db: Kysely<unknown>,
  table: TableMeta,
  record: LoadedRecord,
  allTables: TableMeta[]
): Promise<LoadedRecord> {
  if (!record) return record;

  const result: LoadedRecord = { ...record };

  // ---------------------------------------------------
  // 1) MANY-TO-ONE (foreign key inside this table)
  // ---------------------------------------------------
  for (const column of table.columns) {
    if (!column.foreignKey) continue;

    const fk = column.foreignKey;

    const relatedTable = allTables.find((t) => t.name === fk.table);
    if (!relatedTable) continue;

    // Fetch referenced row
    const related = await db
      .selectFrom(fk.table as never)
      .selectAll()
      .where(fk.column as never, "=", record[column.name] as never)
      .executeTakeFirst();

    result[column.name.replace("_id", "")] = related ?? null;
  }

  // ---------------------------------------------------
  // 2) ONE-TO-MANY (other tables having a foreign key pointing to this table)
  // ---------------------------------------------------
  for (const otherTable of allTables) {
    for (const col of otherTable.columns) {
      if (col.foreignKey?.table === table.name) {
        // This table references the current row
        const rows = await db
          .selectFrom(otherTable.name as never)
          .selectAll()
          .where(
            col.name as never,
            "=",
            record[(table.columns[0]?.name as string) ?? "id"] as never
          )
          .execute();

        result[otherTable.name] = rows;
      }
    }
  }

  return result;
}

/**
 * Loads relations for ALL rows in listRecords()
 */
export async function loadRelationsForRows(
  db: Kysely<unknown>,
  table: TableMeta,
  rows: LoadedRecord[],
  allTables: TableMeta[]
): Promise<LoadedRecord[]> {
  return Promise.all(
    rows.map((r) => loadRelationsForRecord(db, table, r, allTables))
  );
}

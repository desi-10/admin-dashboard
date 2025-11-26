import { Kysely, PostgresDialect, MysqlDialect, SqliteDialect } from "kysely";
import { Pool as PostgresPool } from "pg";
import mysql from "mysql2/promise";
import Database from "better-sqlite3";

export function createDB(connectionString: string) {
  if (
    connectionString.startsWith("postgres://") ||
    connectionString.startsWith("postgresql://")
  ) {
    return new Kysely({
      dialect: new PostgresDialect({
        pool: new PostgresPool({ connectionString }),
      }),
    });
  }

  if (
    connectionString.startsWith("mysql://") ||
    connectionString.startsWith("mariadb://")
  ) {
    return new Kysely({
      dialect: new MysqlDialect({
        pool: mysql.createPool(connectionString),
      }),
    });
  }

  if (
    connectionString.startsWith("sqlite://") ||
    connectionString.endsWith(".sqlite") ||
    connectionString.endsWith(".db")
  ) {
    return new Kysely({
      dialect: new SqliteDialect({
        database: new Database(connectionString.replace("sqlite://", "")),
      }),
    });
  }

  //   if (connectionString.startsWith("sqlserver://")) {
  //     return new Kysely({
  //       dialect: new SqlServerDialect({
  //         connectionString,
  //       }),
  //     });
  //   }

  throw new Error(`Unsupported database dialect for URL: ${connectionString}`);
}

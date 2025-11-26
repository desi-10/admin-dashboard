import { z } from "zod";

export const DatabaseTypeSchema = z.enum(["mysql", "postgresql", "mariadb", "sqlite"]);
export type DatabaseType = z.infer<typeof DatabaseTypeSchema>;

export const ConnectionMethodSchema = z.enum(["credentials", "connection_string"]);
export type ConnectionMethod = z.infer<typeof ConnectionMethodSchema>;

export const CredentialsFormSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.number().int().positive("Port must be a positive number"),
  user: z.string().min(1, "User is required"),
  password: z.string().min(1, "Password is required"),
  database: z.string().min(1, "Database name is required"),
  schema: z.string(),
});

export type CredentialsForm = z.infer<typeof CredentialsFormSchema>;

export const ConnectionStringFormSchema = z.object({
  url: z.string().min(1, "Connection string is required"),
});

export type ConnectionStringForm = z.infer<typeof ConnectionStringFormSchema>;

export const SQLiteFormSchema = z.object({
  path: z.string().min(1, "Database file path is required"),
});

export type SQLiteForm = z.infer<typeof SQLiteFormSchema>;

export function buildConnectionUrl(type: DatabaseType, credentials: CredentialsForm): string {
  const { host, port, user, password, database } = credentials;

  switch (type) {
    case "postgresql":
      return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    case "mysql":
    case "mariadb":
      return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    case "sqlite":
      return database;
    default:
      throw new Error(`Unsupported database type: ${type}`);
  }
}

export function getDefaultPort(type: DatabaseType): number {
  switch (type) {
    case "postgresql":
      return 5432;
    case "mysql":
    case "mariadb":
      return 3306;
    case "sqlite":
      return 0;
    default:
      return 5432;
  }
}

export function getDefaultCredentials(type: DatabaseType): CredentialsForm {
  return {
    host: "",
    port: getDefaultPort(type),
    user: "",
    password: "",
    database: "",
    schema: "public",
  };
}

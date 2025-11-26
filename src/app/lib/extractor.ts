import type { TableMeta } from "./types";
import { getDMMF } from "@prisma/internals";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execAsync = promisify(exec);

type DatabaseProvider = "postgresql" | "mysql" | "sqlite";

function detectProvider(url: string): DatabaseProvider {
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return "postgresql";
  }

  if (url.startsWith("mysql://") || url.startsWith("mariadb://")) {
    return "mysql";
  }

  if (
    url.startsWith("sqlite://") ||
    url.endsWith(".sqlite") ||
    url.endsWith(".db")
  ) {
    return "sqlite";
  }

  throw new Error(`Unsupported database provider for URL: ${url}`);
}

export async function extractMetadata(url: string): Promise<TableMeta[]> {
  const provider = detectProvider(url);

  const tempDir = tmpdir();
  const schemaPath = join(tempDir, `prisma-schema-${Date.now()}.prisma`);

  let connectionString = url;
  if (provider === "sqlite") {
    connectionString = url.replace(/^sqlite:\/\//, "");
  }

  const schemaContent = `datasource db {
  provider = "${provider}"
  url      = "${connectionString}"
}
`;

  try {
    await writeFile(schemaPath, schemaContent, "utf-8");

    const cleanEnv = { ...process.env };
    delete cleanEnv.npm_config_npm_globalconfig;
    delete cleanEnv.npm_config_verify_deps_before_run;
    delete cleanEnv.npm_config__jsr_registry;

    const { stderr } = await execAsync(
      `npx prisma db pull --schema="${schemaPath}" --force`,
      {
        env: cleanEnv,
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    if (stderr && !stderr.includes("warning") && !stderr.includes("npm warn")) {
      console.warn("Prisma introspection warnings:", stderr);
    }

    const introspectedSchema = await readFile(schemaPath, "utf-8");

    const dmmf = await getDMMF({
      datamodel: introspectedSchema,
    });

    return convertDMMFToTableMeta(dmmf);
  } catch (error) {
    throw new Error(
      `Failed to introspect database: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    try {
      await unlink(schemaPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

function convertDMMFToTableMeta(
  dmmf: Awaited<ReturnType<typeof getDMMF>>
): TableMeta[] {
  const tables: TableMeta[] = [];

  for (const model of dmmf.datamodel.models) {
    const columns: TableMeta["columns"] = [];
    const relations: TableMeta["relations"] = [];

    const fkMap = new Map<string, { table: string; column: string }>();

    for (const field of model.fields) {
      if (field.kind === "object" && field.relationFromFields?.length) {
        fkMap.set(field.relationFromFields[0], {
          table: field.type,
          column: field.relationToFields?.[0] ?? "id",
        });

        relations.push({
          type: field.isList ? "hasMany" : "belongsTo",
          table: field.type,
          localField: field.relationFromFields[0],
          foreignField: field.relationToFields?.[0] ?? "id",
        });
      }
    }

    for (const field of model.fields) {
      if (field.kind !== "scalar") continue;

      const dbType = mapPrismaTypeToDbType(field.type);

      let defaultValue: unknown = undefined;
      if (field.hasDefaultValue && field.default) {
        if (typeof field.default === "object" && "name" in field.default) {
          const def = field.default.name;
          if (["autoincrement", "sequence"].includes(def))
            defaultValue = "autoincrement";
          else if (def === "now") defaultValue = "now()";
          else if (["uuid", "cuid"].includes(def)) defaultValue = `${def}()`;
        } else {
          defaultValue = field.default;
        }
      }

      columns.push({
        name: field.name,
        type: dbType,
        nullable: !field.isRequired,
        primaryKey: field.isId,
        defaultValue,
        foreignKey: fkMap.get(field.name),
      });
    }

    tables.push({
      name: model.name,
      columns,
      relations,
    });
  }

  return tables;
}

function mapPrismaTypeToDbType(prismaType: string): string {
  const typeMap: Record<string, string> = {
    String: "varchar",
    Int: "integer",
    BigInt: "bigint",
    Float: "real",
    Decimal: "decimal",
    Boolean: "boolean",
    DateTime: "timestamp",
    Json: "json",
    Bytes: "blob",
  };

  return typeMap[prismaType] || prismaType.toLowerCase();
}

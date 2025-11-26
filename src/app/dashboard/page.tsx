"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDatabase } from "@/features/database/context/DatabaseContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MdOutlineTableChart,
  MdOutlineStorage,
  MdOutlineKey,
  MdOutlineLink,
} from "react-icons/md";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { dbUrl, tables, isLoading } = useDatabase();

  useEffect(() => {
    if (!dbUrl && !isLoading) {
      router.push("/dashboard/get-started");
    }
  }, [dbUrl, isLoading, router]);

  if (!dbUrl) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Redirecting to setup...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Loading tables...</p>
      </div>
    );
  }

  const totalColumns = tables.reduce((acc, t) => acc + t.columns.length, 0);
  const primaryKeys = tables.reduce(
    (acc, t) => acc + t.columns.filter((c) => c.primaryKey).length,
    0
  );
  const foreignKeys = tables.reduce(
    (acc, t) => acc + t.columns.filter((c) => c.foreignKey).length,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Database overview and statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <MdOutlineTableChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Columns</CardTitle>
            <MdOutlineStorage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalColumns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Keys</CardTitle>
            <MdOutlineKey className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{primaryKeys}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Foreign Keys</CardTitle>
            <MdOutlineLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{foreignKeys}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tables</CardTitle>
          <CardDescription>
            Click on a table to view and manage its data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => (
              <Link
                key={table.name}
                href={`/dashboard/tables/${table.name}`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <MdOutlineTableChart
                  size={20}
                  className="text-muted-foreground"
                />
                <div>
                  <p className="font-medium">{table.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {table.columns.length} columns
                    {table.relations.length > 0 &&
                      ` · ${table.relations.length} relations`}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {tables.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No tables found in this database
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

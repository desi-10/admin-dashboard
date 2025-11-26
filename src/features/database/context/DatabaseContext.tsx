"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TableMeta } from "@/app/lib/types";

interface DatabaseContextType {
  dbUrl: string | null;
  setDbUrl: (url: string | null) => void;
  tables: TableMeta[];
  setTables: (tables: TableMeta[]) => void;
  isLoading: boolean;
  error: string | null;
  refreshTables: () => Promise<void>;
  disconnect: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [dbUrl, setDbUrlState] = useState<string | null>(null);
  const [tables, setTables] = useState<TableMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedUrl = localStorage.getItem("db_url");
    if (savedUrl) {
      setDbUrlState(savedUrl);
    }
  }, []);

  const setDbUrl = useCallback((url: string | null) => {
    setDbUrlState(url);
    if (url) {
      localStorage.setItem("db_url", url);
    } else {
      localStorage.removeItem("db_url");
      setTables([]);
    }
  }, []);

  const refreshTables = useCallback(async () => {
    if (!dbUrl) {
      setTables([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tables?url=${encodeURIComponent(dbUrl)}`);
      const data = await res.json();

      if (data.success) {
        setTables(data.data);
        queryClient.setQueryData(["tables", dbUrl], data.data);
      } else {
        setError(data.message);
        setTables([]);
      }
    } catch {
      setError("Failed to fetch tables");
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  }, [dbUrl, queryClient]);

  const disconnect = useCallback(() => {
    setDbUrl(null);
    setTables([]);
    queryClient.clear();
  }, [setDbUrl, queryClient]);

  useEffect(() => {
    if (dbUrl) {
      refreshTables();
    }
  }, [dbUrl, refreshTables]);

  return (
    <DatabaseContext.Provider
      value={{
        dbUrl,
        setDbUrl,
        tables,
        setTables,
        isLoading,
        error,
        refreshTables,
        disconnect,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within DatabaseProvider");
  }
  return context;
}

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MdOutlineKey, MdOutlineLink } from "react-icons/md";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import type { ColumnMeta } from "@/app/lib/types";

export function generateColumns<TData, TValue>(
  columnsMeta: ColumnMeta[] | []
): ColumnDef<TData, TValue>[] {
  // -----------------------------------------------------
  // SELECT COLUMN
  // -----------------------------------------------------
  const selectColumn: ColumnDef<TData, TValue> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };

  // -----------------------------------------------------
  // DATA COLUMNS (generated from metadata)
  // -----------------------------------------------------
  const dataColumns: ColumnDef<TData, TValue>[] = columnsMeta.map((col) => ({
    accessorKey: col.name,
    header: () => (
      <div className="flex items-center gap-1">
        {col.primaryKey && (
          <MdOutlineKey size={14} className="text-yellow-500" />
        )}
        {col.foreignKey && (
          <MdOutlineLink size={14} className="text-blue-500" />
        )}
        <span>{col.name}</span>
        <span className="text-xs text-muted-foreground ml-1">({col.type})</span>
      </div>
    ),
    cell: ({ getValue }) => {
      const value = getValue();

      if (value === null || value === undefined)
        return <span className="text-muted-foreground italic">null</span>;

      if (typeof value === "boolean")
        return <span>{value ? "true" : "false"}</span>;

      if (typeof value === "object") {
        const json = JSON.stringify(value);
        return (
          <span className="text-xs font-mono">
            {json.slice(0, 50)}
            {json.length > 50 ? "..." : ""}
          </span>
        );
      }

      const str = String(value);
      return str.length > 100 ? (
        <span title={str}>{str.slice(0, 100)}...</span>
      ) : (
        <span>{str}</span>
      );
    },
  }));

  // -----------------------------------------------------
  // ACTIONS COLUMN (Edit / Delete / View)
  // -----------------------------------------------------
  const actionsColumn: ColumnDef<TData, TValue> = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const rowData = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log("View", rowData)}
          >
            <FiEye size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log("Edit", rowData)}
          >
            <FiEdit2 size={16} />
          </Button>

          <Button
            variant="ghost"
            className="text-red-600"
            size="sm"
            onClick={() => console.log("Delete", rowData)}
          >
            <FiTrash2 size={16} />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 120,
  };

  // -----------------------------------------------------
  // FINAL ORDER: Select → Data → Actions
  // -----------------------------------------------------
  return [selectColumn, ...dataColumns, actionsColumn];
}

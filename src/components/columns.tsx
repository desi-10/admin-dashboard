"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import {
  MdMoreVert,
  MdOutlineEdit,
  MdOutlineDelete,
  MdOutlineKey,
  MdOutlineLink,
} from "react-icons/md";

type RecordData = Record<string, unknown>;

export interface ActionsColumnProps {
  onEdit?: (row: RecordData) => void;
  onDelete?: (row: RecordData) => void;
}

export interface ColumnMeta {
  name: string;
  type: string;
  primaryKey?: boolean;
  foreignKey?: boolean;
}

/* ---------------------------------------------
   SELECT COLUMN
---------------------------------------------- */
export function getSelectColumn(): ColumnDef<RecordData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

/* ---------------------------------------------
   ACTIONS COLUMN
---------------------------------------------- */
export function getActionsColumn({
  onEdit,
  onDelete,
}: ActionsColumnProps): ColumnDef<RecordData> {
  return {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MdMoreVert size={16} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <MdOutlineEdit size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
          )}

          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="text-red-600"
            >
              <MdOutlineDelete size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

/* ---------------------------------------------
   AUTO-GENERATED COLUMNS (WITH RELATIONS)
---------------------------------------------- */
export function generateColumns(
  columnsMeta: ColumnMeta[],
  opts?: ActionsColumnProps
): ColumnDef<RecordData>[] {
  const cols: ColumnDef<RecordData>[] = [];

  // Add select column
  cols.push(getSelectColumn());

  // Data columns
  for (const col of columnsMeta) {
    cols.push({
      accessorKey: col.name,

      header: () => (
        <div className="flex items-center gap-1">
          {/* {col.primaryKey && (
            <MdOutlineKey size={14} className="text-yellow-500" />
          )}

          {col.foreignKey && (
            <MdOutlineLink size={14} className="text-blue-500" />
          )} */}

          <span>{col.name}</span>
          {/* <span className="text-xs text-muted-foreground ml-1">
            ({col.type})
          </span> */}
        </div>
      ),

      cell: ({ getValue }) => {
        const value = getValue();

        // ✨ Case 1 – relational object (belongsTo)
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const obj = value as Record<string, unknown>;

          const preview =
            obj.name ||
            obj.title ||
            obj.email ||
            obj.id ||
            JSON.stringify(obj).slice(0, 24);

          return (
            <span className="text-blue-600 font-medium">
              {/* {preview}
              {JSON.stringify(obj).length > 24 && "..."} */}
            </span>
          );
        }

        // ✨ Case 2 – related list (hasMany)
        if (Array.isArray(value)) {
          return (
            <span className="text-purple-600 font-medium">
              {value.length} related
            </span>
          );
        }

        // Case 3 – null or undefined
        if (value === null || value === undefined) {
          return <span className="italic text-muted-foreground">null</span>;
        }

        // Case 4 – long strings
        const str = String(value);
        return str.length > 120 ? `${str.slice(0, 120)}...` : str;
      },
    });
  }

  // Add actions column
  cols.push(getActionsColumn(opts || {}));

  return cols;
}

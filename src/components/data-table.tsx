"use client";

// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
  // selectRowsFn,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: {
    onEdit?: (row: TData) => void;
    onDelete?: (row: TData) => void;
  };
}

type TRows = {
  [key: number]: boolean;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
}: DataTableProps<TData, TValue>) {
  const [filtering, setFiltering] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<TRows>({});
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setFiltering,
    meta,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: filtering,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  // const handleExcel = async () => {
  //   const filteredData = data?.data?.filter((_, index) => rowSelection[index]);
  //   if (filteredData.length !== 0) {
  //     console.log("", filteredData);
  //     // check emoji
  //     setIsLoading(true);

  //     await new Promise((resolve) => setTimeout(resolve, 5000));
  //     toast("✅ Data exported successfully");
  //     setIsLoading(false);
  //     setRowSelection([]);
  //     return;
  //   }

  //   toast("No row selected");
  //   // if (filteredData.length !== 0) {
  //   //   const worksheet = XLSX.utils.json_to_sheet(filteredData);
  //   //   const workbook = XLSX.utils.book_new();
  //   //   XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  //   //   // Buffer to store the generated Excel file
  //   //   const excelBuffer = XLSX.write(workbook, {
  //   //     bookType: "xlsx",
  //   //     type: "array",
  //   //   });
  //   //   const blob = new Blob([excelBuffer], {
  //   //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  //   //   });
  //   //   saveAs(blob, "data.xlsx");
  //   //  }
  // };

  return (
    <div className="text-xs">
      <div className="rounded-md">
        <div className="flex justify-between items-center mb-5">
          <Input
            type="text"
            placeholder="Filter Columns..."
            value={filtering}
            onChange={(event) => setFiltering(event.target.value)}
            className="max-w-sm"
          />
          <div className="flex space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <Button
              variant={"outline"}
              onClick={handleExcel}
              disabled={isLoading}
              className="border border-primaryColor text-primaryColor hover:bg-primaryColor/90 hover:text-white"
            > */}
            {/* {isLoading ? <Loader color="#f77f1e" /> : "Batch Update"} */}
            {/* </Button> */}
          </div>
        </div>
        <div className="">
          <Table className="">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="text-xs">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="mt-8">
        {/* <DataTablePagination table={table} data={data?.pagination} /> */}

        {/* <Pagination table={table} {...data?.pagination} /> */}
      </div>
    </div>
  );
}

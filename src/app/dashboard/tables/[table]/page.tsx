"use client";

import { useState, use } from "react";
import { useDatabase } from "@/features/database/context/DatabaseContext";
import {
  useTableRecords,
  useTableMeta,
  // useCreateRecord,
  // useUpdateRecord,
  // useDeleteRecord,
  // useBatchDeleteRecords,
} from "@/features/database/hooks/useDatabase";
import { DataTable } from "@/components/data-table";
import { generateColumns } from "@/features/tables/utils/columns";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import type { TableMeta } from "@/app/lib/types";

// type RecordData = Record<string, unknown>;

interface PageProps {
  params: Promise<{ table: string }>;
}

export default function TablePage({ params }: PageProps) {
  const { table: tableName } = use(params);
  const { dbUrl } = useDatabase();

  const [page] = useState(1);
  // const [, setIsCreateOpen] = useState(false);
  // const [isEditOpen, setIsEditOpen] = useState(false);
  // const [editingRecord, setEditingRecord] = useState<RecordData | null>(null);
  // const [formData, setFormData] = useState<RecordData>({});

  const { data: recordsData } = useTableRecords({
    dbUrl: dbUrl || "",
    tableName,
    page,
    limit: 50,
  });

  const { data: tableMeta } = useTableMeta(dbUrl, tableName);

  // const createRecord = useCreateRecord();
  // const updateRecord = useUpdateRecord();
  // const deleteRecord = useDeleteRecord();
  // const batchDelete = useBatchDeleteRecords();

  // const getPrimaryKeyColumn = () => {
  //   if (!tableMeta) return null;
  //   return tableMeta.data?.columns.find((c: ColumnMeta) => c.primaryKey);
  // };

  // const getPrimaryKeyValue = (record: RecordData): string | number | null => {
  //   const pkCol = getPrimaryKeyColumn();
  //   if (!pkCol) return null;
  //   return record[pkCol.name] as string | number;
  // };

  // const handleCreate = async () => {
  //   if (!dbUrl) return;

  //   try {
  //     await createRecord.mutateAsync({ dbUrl, tableName, data: formData });
  //     setIsCreateOpen(false);
  //     setFormData({});
  //   } catch (err) {
  //     alert(err instanceof Error ? err.message : "Failed to create record");
  //   }
  // };

  const columns = generateColumns(tableMeta?.data?.columns || []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold capitalize">{tableName}</h2>
      <DataTable columns={columns} data={recordsData?.data || []} />

      {/* <RecordDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create Record"
        tableMeta={tableMeta}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreate}
        submitLabel="Create"
        isSubmitting={createRecord.isPending}
      />

      <RecordDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Record"
        tableMeta={tableMeta}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdate}
        submitLabel="Update"
        isSubmitting={updateRecord.isPending}
      /> */}
    </div>
  );
}

// interface RecordDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   title: string;
//   tableMeta: TableMeta;
//   formData: RecordData;
//   setFormData: (data: RecordData) => void;
//   onSubmit: () => Promise<void>;
//   submitLabel: string;
//   isSubmitting: boolean;
// }

// function RecordDialog({
//   open,
//   onOpenChange,
//   title,
//   tableMeta,
//   formData,
//   setFormData,
//   onSubmit,
//   submitLabel,
//   isSubmitting,
// }: RecordDialogProps) {
//   const editableColumns = tableMeta.columns?.filter(
//     (col) => !col.primaryKey || col.defaultValue !== "autoincrement"
//   );

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await onSubmit();
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit}>
//           <div className="grid gap-4 py-4">
//             {editableColumns?.map((col) => (
//               <div
//                 key={col.name}
//                 className="grid grid-cols-4 items-center gap-4"
//               >
//                 <Label htmlFor={col.name} className="text-right">
//                   {col.name}
//                   {!col.nullable && (
//                     <span className="text-red-500 ml-1">*</span>
//                   )}
//                 </Label>
//                 <div className="col-span-3">
//                   <Input
//                     id={col.name}
//                     value={
//                       formData[col.name] != null
//                         ? String(formData[col.name])
//                         : ""
//                     }
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         [col.name]: e.target.value || null,
//                       })
//                     }
//                     placeholder={`${col.type}${
//                       col.nullable ? " (optional)" : ""
//                     }`}
//                   />
//                   <p className="text-xs text-muted-foreground mt-1">
//                     Type: {col.type}
//                     {col.foreignKey &&
//                       ` → ${col.foreignKey.table}.${col.foreignKey.column}`}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <DialogFooter>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={isSubmitting}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting ? "Saving..." : submitLabel}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

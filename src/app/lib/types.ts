export type ColumnMeta = {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue?: unknown;
  foreignKey?: {
    table: string;
    column: string;
  };
};

export type TableMeta = {
  name: string;
  columns: ColumnMeta[];
  relations: {
    type: "belongsTo" | "hasMany";
    table: string;
    localField: string;
    foreignField: string;
  }[];
};

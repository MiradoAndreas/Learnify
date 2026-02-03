import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    handleDeleteCourse: (id: string) => void;
  }
}

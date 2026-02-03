"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  PlusIcon,
  Filter,
  LayoutGrid,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

export type Course = {
  id: string;
  title: string;
  price: number; // EN ARIARY maintenant, pas en cents
  status: "draft" | "published";
  createdAt: string;
};

export const columns: ColumnDef<Course>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="data-[state=checked]:bg-[#feba45] data-[state=checked]:border-[#feba45]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="data-[state=checked]:bg-[#feba45] data-[state=checked]:border-[#feba45]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-gray-700 hover:text-[#feba45] hover:bg-[#feba45]/10"
      >
        Titre <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-linear-to-r from-[#feba45] to-[#ff9e1f] rounded-lg flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-semibold text-gray-900">
            {row.getValue("title")}
          </span>
          <p className="text-xs text-gray-500">
            ID: {row.original.id.slice(0, 8)}...
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: () => (
      <div className="text-right font-medium text-gray-700">Prix</div>
    ),
    cell: ({ row }) => {
      const priceInAriary = row.getValue("price") as number; // Déjà en Ariary
      return (
        <div className="text-right">
          <div className="font-bold text-gray-900">
            Ar {priceInAriary.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            {priceInAriary === 0 ? "Gratuit" : "Payant"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isPublished = status === "published";
      return (
        <Badge
          variant={isPublished ? "default" : "secondary"}
          className={`${
            isPublished
              ? "bg-linear-to-r from-green-500 to-emerald-600 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {isPublished ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
          {isPublished ? "PUBLIÉ" : "BROUILLON"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium text-gray-900">
          {format(new Date(row.getValue("createdAt") as string), "dd/MM/yyyy")}
        </div>
        <div className="text-xs text-gray-500">
          {format(new Date(row.getValue("createdAt") as string), "HH:mm")}
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const course = row.original as Course;
      const handleCopy = () => {
        navigator.clipboard.writeText(course.id);
        toast.success("ID copié dans le presse papier", {
          style: {
            background: "#feba45",
            color: "white",
            border: "none",
          },
        });
      };
      const handleDelete = () => {
        table.options.meta?.handleDeleteCourse(course.id);
      };
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-[#feba45]/10 hover:text-[#feba45]"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-gray-900">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCopy}
              className="cursor-pointer hover:bg-[#feba45]/10"
            >
              <span className="text-gray-700">Copier l'ID du cours</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#feba45]/10">
              <Link
                prefetch
                href={`/teacher/courses/${course.id}`}
                className="w-full text-gray-700"
              >
                Voir le cours
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#feba45]/10">
              <Link
                prefetch
                href={`/teacher/courses/${course.id}/edit`}
                className="w-full text-gray-700"
              >
                Éditer le cours
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              Supprimer le cours
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function TeacherDashboardSection() {
  return (
    <Suspense fallback={<TeacherDashboardSectionLoader />}>
      <ErrorBoundary fallback={<TeacherDashboardSectionError />}>
        <TeacherDashboardSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function TeacherDashboardSectionSuspense() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data: courses = [] } = useSuspenseQuery(
    trpc.teacher.getMyCourses.queryOptions()
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const deletedCourse = useMutation(
    trpc.teacher.deleteCourse.mutationOptions({
      onSuccess: () => {
        toast.success("Le cours a été supprimé avec succès", {
          style: {
            background: "#feba45",
            color: "white",
            border: "none",
          },
        });
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getMyCourses.queryKey(),
        });
      },
      onError: (error: any) => {
        if (error?.code === "FORBIDDEN") {
          toast.error("Vous n'avez pas la permission de supprimer ce cours");
          return;
        }
        toast.error(error.message || "Une erreur est survenue");
      },
    })
  );

  const handleDeleteCourse = (id: string) => {
    deletedCourse.mutate({ id });
  };

  const table = useReactTable({
    data: courses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    meta: {
      handleDeleteCourse,
    },
  });

  // Statistiques calculées - CORRECTION ICI
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(
    (c) => c.status === "published"
  ).length;

  // PLUS de division par 100 - les prix sont déjà en Ariary
  const totalRevenue = courses
    .filter((c) => c.status === "published")
    .reduce((acc, c) => acc + c.price, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-gray-900">Mes Cours</p>
          <p className="text-gray-600 mt-1">Gérez et suivez vos cours créés</p>
        </div>
        <Button
          asChild
          className="bg-linear-to-r from-[#feba45] to-[#ff9e1f] hover:from-[#ff9e1f] hover:to-[#feba45] text-white shadow-lg hover:shadow-xl"
        >
          <Link href="/teacher/courses/new" prefetch>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouveau Cours
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total des cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCourses}
                </p>
              </div>
              <div className="w-10 h-10 bg-linear-to-r from-[#feba45] to-[#ff9e1f] rounded-full flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cours publiés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {publishedCourses}
                </p>
              </div>
              <div className="w-10 h-10 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prix total cours</p>
                {/* PLUS de .toFixed(2) - les Ariary n'ont pas de décimales */}
                <p className="text-2xl font-bold text-gray-900">
                  Ar {totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Liste des cours</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Filtrer par titre..."
                  value={
                    (table.getColumn("title")?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table.getColumn("title")?.setFilterValue(event.target.value)
                  }
                  className="pl-10 max-w-sm"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Colonnes <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((column) => (
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
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-hidden rounded-b-lg">
            <Table>
              <TableHeader className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-gray-700"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-[#feba45]/5 transition-colors border-b border-gray-100"
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
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-linear-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          <LayoutGrid className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Aucun cours trouvé
                          </h3>
                          <p className="text-gray-600 mt-1">
                            Commencez par créer votre premier cours
                          </p>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          className="mt-2 border-[#feba45] text-[#feba45] hover:bg-[#feba45]/10"
                        >
                          <Link href="/teacher/courses/new" prefetch>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Créer un cours
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination & Selection Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-gray-600">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} cours sélectionné(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-gray-300 hover:border-[#feba45] hover:text-[#feba45]"
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-gray-300 hover:border-[#feba45] hover:text-[#feba45]"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}

const TeacherDashboardSectionLoader = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-linear-to-r from-gray-200 to-gray-300" />
          <Skeleton className="h-4 w-64 bg-linear-to-r from-gray-200 to-gray-300" />
        </div>
        <Skeleton className="h-10 w-32 bg-linear-to-r from-gray-200 to-gray-300" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-linear-to-r from-gray-200 to-gray-300" />
                  <Skeleton className="h-8 w-16 bg-linear-to-r from-gray-200 to-gray-300" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full bg-linear-to-r from-gray-200 to-gray-300" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-linear-to-r from-gray-200 to-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header Skeleton */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 flex-1 bg-linear-to-r from-gray-200 to-gray-300" />
              <Skeleton className="h-10 w-32 bg-linear-to-r from-gray-200 to-gray-300" />
              <Skeleton className="h-10 w-32 bg-linear-to-r from-gray-200 to-gray-300" />
            </div>

            {/* Table Rows Skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 flex-1 bg-linear-to-r from-gray-200 to-gray-300" />
                <Skeleton className="h-12 flex-1 bg-linear-to-r from-gray-200 to-gray-300" />
                <Skeleton className="h-12 flex-1 bg-linear-to-r from-gray-200 to-gray-300" />
                <Skeleton className="h-12 flex-1 bg-linear-to-r from-gray-200 to-gray-300" />
                <Skeleton className="h-12 w-20 bg-linear-to-r from-gray-200 to-gray-300" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TeacherDashboardSectionError = () => {
  return (
    <Card className="border-2 border-red-200 bg-red-50 ">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-4">
          Impossible de charger les cours. Veuillez réessayer.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-linear-to-r from-[#feba45] to-[#ff9e1f] hover:from-[#ff9e1f] hover:to-[#feba45] text-white"
        >
          Réessayer
        </Button>
      </CardContent>
    </Card>
  );
};

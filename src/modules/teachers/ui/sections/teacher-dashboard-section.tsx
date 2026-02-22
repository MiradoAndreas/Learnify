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
import { cn } from "@/lib/utils";

export type Course = {
  id: string;
  title: string;
  price: number;
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
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary dark:data-[state=checked]:border-primary"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary dark:data-[state=checked]:border-primary"
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
        className="text-foreground hover:text-primary hover:bg-primary/10 dark:text-gray-300 dark:hover:text-primary dark:hover:bg-primary/20"
      >
        Titre <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-semibold text-foreground dark:text-gray-100">
            {row.getValue("title")}
          </span>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            ID: {row.original.id.slice(0, 8)}...
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: () => (
      <div className="text-right font-medium text-foreground dark:text-gray-300">
        Prix
      </div>
    ),
    cell: ({ row }) => {
      const priceInAriary = row.getValue("price") as number;
      return (
        <div className="text-right">
          <div className="font-bold text-foreground dark:text-gray-100">
            Ar {priceInAriary.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground dark:text-gray-400">
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
          className={cn(
            isPublished
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white dark:from-green-600 dark:to-emerald-700"
              : "bg-muted text-muted-foreground dark:bg-gray-800 dark:text-gray-300"
          )}
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
        <div className="font-medium text-foreground dark:text-gray-100">
          {format(new Date(row.getValue("createdAt") as string), "dd/MM/yyyy")}
        </div>
        <div className="text-xs text-muted-foreground dark:text-gray-400">
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
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
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
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-popover border-border dark:bg-gray-900 dark:border-gray-800"
          >
            <DropdownMenuLabel className="text-foreground dark:text-gray-100">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border dark:bg-gray-800" />
            <DropdownMenuItem
              onClick={handleCopy}
              className="cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground dark:text-gray-200"
            >
              <span>Copier l'ID du cours</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20">
              <Link

                href={`/teacher/courses/${course.id}`}
                className="w-full text-foreground dark:text-gray-200"
              >
                Voir le cours
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20">
              <Link

                href={`/teacher/courses/${course.id}/edit`}
                className="w-full text-foreground dark:text-gray-200"
              >
                Éditer le cours
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border dark:bg-gray-800" />
            <DropdownMenuItem
              className="cursor-pointer text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 dark:text-red-400"
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
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
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

  const totalCourses = courses.length;
  const publishedCourses = courses.filter(
    (c) => c.status === "published"
  ).length;
  const totalRevenue = courses
    .filter((c) => c.status === "published")
    .reduce((acc, c) => acc + c.price, 0);

  return (
    <div className="space-y-6 bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-foreground dark:text-gray-100">
            Mes Cours
          </p>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">
            Gérez et suivez vos cours créés
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-white shadow-lg hover:shadow-xl"
        >
          <Link href="/teacher/courses/new" >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouveau Cours
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Total des cours
                </p>
                <p className="text-2xl font-bold text-foreground dark:text-gray-100">
                  {totalCourses}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Cours publiés
                </p>
                <p className="text-2xl font-bold text-foreground dark:text-gray-100">
                  {publishedCourses}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Prix total cours
                </p>
                <p className="text-2xl font-bold text-foreground dark:text-gray-100">
                  Ar {totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="border border-border bg-card shadow-lg">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg text-foreground dark:text-gray-100">
              Liste des cours
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-400" />
                <Input
                  placeholder="Filtrer par titre..."
                  value={
                    (table.getColumn("title")?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table.getColumn("title")?.setFilterValue(event.target.value)
                  }
                  className="pl-10 max-w-sm bg-background border-border text-foreground placeholder:text-muted-foreground dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    Colonnes <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border-border dark:bg-gray-900 dark:border-gray-800"
                >
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize text-foreground dark:text-gray-200 focus:bg-accent dark:focus:bg-gray-800"
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
              <TableHeader className="bg-muted/50 dark:bg-gray-900/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-foreground dark:text-gray-200"
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
                      className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border-border"
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
                        <div className="w-16 h-16 bg-gradient-to-r from-muted to-muted/50 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                          <LayoutGrid className="w-8 h-8 text-muted-foreground dark:text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground dark:text-gray-100">
                            Aucun cours trouvé
                          </h3>
                          <p className="text-muted-foreground dark:text-gray-400 mt-1">
                            Commencez par créer votre premier cours
                          </p>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          className="mt-2 border-primary text-primary hover:bg-primary/10 dark:border-primary dark:text-primary dark:hover:bg-primary/20"
                        >
                          <Link href="/teacher/courses/new" >
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
        <div className="text-sm text-muted-foreground dark:text-gray-400">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} cours sélectionné(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-border bg-background text-foreground hover:border-primary hover:text-primary disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-primary dark:hover:text-primary"
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-border bg-background text-foreground hover:border-primary hover:text-primary disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-primary dark:hover:text-primary"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}

// ✅ VERSION AMÉLIORÉE AVEC SKELETON SHADCN
const TeacherDashboardSectionLoader = () => {
  return (
    <div className="space-y-6 bg-background">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Filter Bar Skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Table Header Skeleton */}
            <div className="flex items-center space-x-4 border-b border-border pb-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>

            {/* Table Rows Skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <Skeleton className="h-4 w-8" />
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
};

const TeacherDashboardSectionError = () => {
  return (
    <Card className="border-2 border-destructive/20 bg-destructive/5 dark:border-destructive/30 dark:bg-destructive/10">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-destructive/20 to-destructive/10 dark:from-destructive/30 dark:to-destructive/20 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-destructive dark:text-destructive/80 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-destructive dark:text-destructive/90 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-destructive/80 dark:text-destructive/70 mb-4">
          Impossible de charger les cours. Veuillez réessayer.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-white"
        >
          Réessayer
        </Button>
      </CardContent>
    </Card>
  );
};
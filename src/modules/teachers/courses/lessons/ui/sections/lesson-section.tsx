"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useTRPC } from "@/trpc/client";
import {
  useQueryClient,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LessonUploadModal } from "../../../ui/components/lesson-upload-modal";
import { CreateSectionButton } from "../components/create-section-button";
import { CreateSectionModal } from "../components/create-section-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Plus,
  Video,
  FileText,
  MoreVertical,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  Zap,
  Target,
  FileVideo,
  PenTool,
  GripVertical,
  Edit,
  Trash2,
  Copy,
  BarChart,
  Hash,
  PlayCircle,
  FileQuestion,
  Settings,
  ArrowLeftIcon,
  DollarSign,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDuration } from "../utils/format-duration";
import { EditSectionModal } from "../components/edit-section-modal";
import { RichTextDisplay } from "../components/rich-text-display";

interface LessonSectionProps {
  courseId: string;
}

interface Lesson {
  id: string;
  title: string;
  position: number;
  muxStatus: string;
  duration: number;
  visibility: string;
  type?: "video" | "article" | "quiz" | "assignment";
  description?: string;
  free?: boolean;
  isPublished: boolean;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  position: number;
  lessons: Lesson[];
}

// SortableLessonRow adapté dark mode
const SortableLessonRow = ({ lesson, courseId, index }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="hover:bg-muted/50 dark:hover:bg-gray-800/50 border-border last:border-b-0 relative transition-colors"
    >
      <TableCell className="py-3 pl-4">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="w-4 h-4 text-muted-foreground cursor-move hover:text-primary transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <span className="font-medium text-muted-foreground">{index + 1}</span>
        </div>
      </TableCell>

      {/* Titre de la leçon */}
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              lesson.type === "video"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                : lesson.type === "article"
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : lesson.type === "quiz"
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
                    : "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
            )}
          >
            {lesson.type === "video" && <FileVideo className="w-4 h-4" />}
            {lesson.type === "article" && <FileText className="w-4 h-4" />}
            {lesson.type === "quiz" && <FileQuestion className="w-4 h-4" />}
            {!lesson.type && <PlayCircle className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <Link

              href={`/teacher/courses/${courseId}/lessons/${lesson.id}`}
              className="font-medium text-foreground hover:text-primary hover:underline truncate w-100 block transition-colors"
            >
              {lesson.title}
            </Link>
          </div>
        </div>
      </TableCell>

      {/* Type de leçon */}
      <TableCell className="py-3 text-center">
        <Badge
          variant="outline"
          className="capitalize text-xs border-border text-foreground bg-background"
        >
          {lesson.type || "video"}
        </Badge>
      </TableCell>

      {/* Durée */}
      <TableCell className="py-3 text-center">
        <div className="flex items-center justify-center gap-1 text-foreground">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="font-medium text-sm">
            {formatDuration(lesson.duration)}
          </span>
        </div>
      </TableCell>

      {/* Accès (Free/Paid) */}
      <TableCell className="py-3 text-center">
        {lesson.visibility === "free" || lesson.free === true ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 border-0 text-xs">
            <span className="flex items-center justify-center gap-1">
              <Globe className="w-3 h-3" />
              Gratuit
            </span>
          </Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 border-0 text-xs">
            <span className="flex items-center justify-center gap-1">
              <DollarSign className="w-3 h-3" />
              Payant
            </span>
          </Badge>
        )}
      </TableCell>

      {/* Visibilité (Published/Not Published) */}
      <TableCell className="py-3 text-center">
        {lesson.isPublished === true ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 border-0 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            Publiée
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-muted-foreground border-border text-xs bg-background"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Non publiée
          </Badge>
        )}
      </TableCell>

      {/* Statut Mux */}
      <TableCell className="py-3 text-center">
        <Badge
          variant="outline"
          className={cn(
            "text-xs border",
            lesson.muxStatus === "ready"
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
              : lesson.muxStatus === "processing"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
          )}
        >
          {lesson.muxStatus === "ready" ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : lesson.muxStatus === "processing" ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <AlertCircle className="w-3 h-3 mr-1" />
          )}
          {lesson.muxStatus}
        </Badge>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3 text-right pr-4">
        <div className="flex items-center justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
                  asChild
                >
                  <Link

                    href={`/teacher/courses/${courseId}/lessons/${lesson.id}`}
                  >
                    <Edit className="w-3 h-3" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Éditer la leçon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const LessonSection = ({ courseId }: LessonSectionProps) => {
  return (
    <Suspense fallback={<LessonSectionSkeleton />}>
      <ErrorBoundary fallback={<LessonSectionError />}>
        <LessonSectionSuspense courseId={courseId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const LessonSectionSuspense = ({ courseId }: LessonSectionProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: sections } = useSuspenseQuery(
    trpc.teacher.getAllLessonByCourseId.queryOptions({ courseId })
  );
  const [sectionToDelete, setSectionToDelete] = useState<{
    id: string;
    title: string;
    lessonCount: number;
  } | null>(null);

  const [sectionToEdit, setSectionToEdit] = useState<{
    id: string;
    title: string;
    description?: string;
  } | null>(null);

  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const deleteSectionMutation = useMutation(
    trpc.teacher.deleteSection.mutationOptions({
      onSuccess: () => {
        toast.success("Section supprimée avec succès");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getAllLessonByCourseId.queryKey({
            courseId,
          }),
        });
        setSectionToDelete(null);
      },
      onError: (error: any) => {
        if (error?.code === "FORBIDDEN") {
          toast.error(
            "Vous n'avez pas la permission de supprimer cette section"
          );
          return;
        }
        toast.error(error.message || "Une erreur est survenue");
      },
    })
  );

  const handleConfirmDelete = async () => {
    if (!sectionToDelete) return;
    try {
      await deleteSectionMutation.mutateAsync({
        sectionId: sectionToDelete.id,
      });
    } catch (error) { }
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.teacher.getAllLessonByCourseId.queryKey({ courseId }),
    });
  };

  if (!sections || sections.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-fit mx-auto"
      >
        <Card className="border border-border bg-card shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-linear-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              <Layers className="w-12 h-12 text-primary-foreground" />
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-4">
              Commencez à créer le contenu de votre cours
            </h3>

            <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">
              Créez votre première section pour organiser votre cours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Button
                onClick={() => setOpen(true)}
                className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer une section
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary hover:bg-accent"
                asChild
              >
                <Link href={`/teacher/courses/${courseId}`} >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Configurer le cours
                </Link>
              </Button>
            </div>

            {/* Guide de démarrage */}
            <Card className="border border-border bg-card/50 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground mb-3">
                      Comment structurer votre cours efficacement
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <span className="text-sm text-muted-foreground">
                          Commencez par une introduction captivante
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <span className="text-sm text-muted-foreground">
                          Limitez les sections à 3-5 modules
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <span className="text-sm text-muted-foreground">
                          Incluez des exercices pratiques
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <span className="text-sm text-muted-foreground">
                          Terminez par un projet final
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <CreateSectionModal
          courseId={courseId}
          open={open}
          onOpenChange={setOpen}
        />
      </motion.div>
    );
  }

  const totalLessons = sections.reduce(
    (sum: number, section: Section) => sum + (section.lessons?.length || 0),
    0
  );

  const totalDuration = sections.reduce((sum: number, section: Section) => {
    if (!section.lessons || section.lessons.length === 0) return sum;
    return (
      sum +
      section.lessons.reduce((lessonSum: number, lesson: Lesson) => {
        return lessonSum + (Number(lesson.duration) || 0);
      }, 0)
    );
  }, 0);

  return (
    <div className="space-y-8 w-full bg-background text-foreground">
      {sectionToEdit && (
        <EditSectionModal
          section={sectionToEdit}
          courseId={courseId}
          open={!!sectionToEdit}
          onOpenChange={(open) => !open && setSectionToEdit(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de confirmation de suppression */}
      <AlertDialog
        open={!!sectionToDelete}
        onOpenChange={(open) => !open && setSectionToDelete(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              <Trash2 className="w-5 h-5 inline mr-2" />
              Supprimer la section
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-medium text-destructive">
                Cette action est irréversible.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-foreground">
                Êtes-vous sûr de vouloir supprimer la section :
              </p>
              <div className="bg-muted p-3 rounded-lg border border-border">
                <p className="font-semibold text-foreground">
                  "{sectionToDelete?.title}"
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    {sectionToDelete?.lessonCount} leçon(s)
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Toutes les leçons de cette section seront également supprimées.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteSectionMutation.isPending}
              className="border-border bg-background hover:bg-accent"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteSectionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSectionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header avec stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div>
          <div className="mb-6">
            <Link

              href={`/teacher/courses/${courseId}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Revenir au cours information du cours
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Structure du cours
          </h2>
          <p className="text-muted-foreground">
            Gérez vos sections et leçons pour créer une expérience
            d'apprentissage engageante
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Layers className="w-4 h-4" />
              <span className="font-medium">{sections.length} sections</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-1">
              <Video className="w-4 h-4" />
              <span className="font-medium">{totalLessons} leçons</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {formatDuration(totalDuration)}
              </span>
            </div>
          </div>
          <CreateSectionButton onClick={() => setOpen(true)} />
        </div>
      </motion.div>

      <CreateSectionModal
        courseId={courseId}
        open={open}
        onOpenChange={setOpen}
      />

      {/* Table principale des sections */}
      <Card className="border border-border bg-card shadow-lg w-full rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50 dark:bg-gray-900/50">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-12 text-center py-6">
                    <Hash className="w-4 h-4 mx-auto text-muted-foreground" />
                  </TableHead>
                  <TableHead className="py-6 min-w-[300px]">
                    <span className="text-foreground font-semibold">Section</span>
                  </TableHead>
                  <TableHead className="py-6 text-center w-32">
                    <span className="text-foreground font-semibold">Leçons</span>
                  </TableHead>
                  <TableHead className="py-6 text-center w-32">
                    <span className="text-foreground font-semibold">Durée</span>
                  </TableHead>
                  <TableHead className="py-6 text-center w-32">
                    <span className="text-foreground font-semibold">Statut</span>
                  </TableHead>
                  <TableHead className="py-6 text-right w-40">
                    <span className="text-foreground font-semibold">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section: Section, index: number) => (
                  <TableSectionRow
                    key={section.id}
                    section={section}
                    index={index}
                    courseId={courseId}
                    isExpanded={expandedSections.has(section.id)}
                    onToggle={() => toggleSection(section.id)}
                    onDeleteRequest={(sectionInfo) =>
                      setSectionToDelete(sectionInfo)
                    }
                    onEditRequest={(sectionInfo) =>
                      setSectionToEdit(sectionInfo)
                    }
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer de la table */}
          <div className="px-6 py-4 bg-muted/30 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{sections.length}</span> sections
                • <span className="font-medium">{totalLessons}</span> leçons •{" "}
                <span className="font-medium">
                  {formatDuration(totalDuration)}
                </span>{" "}
                minutes totales
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// TableSectionRow adapté dark mode
const TableSectionRow = ({
  section,
  index,
  courseId,
  isExpanded,
  onDeleteRequest,
  onEditRequest,
  onToggle,
}: TableSectionRowProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localLessons, setLocalLessons] = useState(section.lessons);

  const updatePositionMutation = useMutation(
    trpc.teacher.updateLessonPosition.mutationOptions({
      onSuccess: () => {
        toast.success("Ordre mis à jour avec succès");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getAllLessonByCourseId.queryKey({
            courseId,
          }),
        });
      },
      onError: (error: any) => {
        toast.error(error.message || "Erreur lors de la mise à jour");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getAllLessonByCourseId.queryKey({
            courseId,
          }),
        });
      },
    })
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = localLessons.findIndex(
        (lesson) => lesson.id === active.id
      );
      const newIndex = localLessons.findIndex(
        (lesson) => lesson.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newLessons = arrayMove(localLessons, oldIndex, newIndex);
        setLocalLessons(newLessons);

        updatePositionMutation.mutate({
          lessonId: active.id as string,
          newPosition: newIndex + 1,
        });
      }
    }
  };

  useEffect(() => {
    setLocalLessons(section.lessons);
  }, [section.lessons]);

  return (
    <>
      <TableRow className="border-border hover:bg-muted/50 dark:hover:bg-gray-800/50 group transition-colors">
        <TableCell className="py-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <span className="font-medium text-primary">{index + 1}</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {section.title}
            </h3>
            {section.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {section.description}
              </p>
            )}
          </div>
        </TableCell>
        <TableCell className="py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
            >
              <Video className="w-3 h-3 mr-1" />
              {section.lessons.length}
            </Badge>
          </div>
        </TableCell>
        <TableCell className="py-4 text-center">
          <div className="flex items-center justify-center gap-1 text-foreground">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {formatDuration(
                section.lessons.reduce(
                  (sum: number, lesson: Lesson) =>
                    sum + (Number(lesson.duration) || 0),
                  0
                )
              )}
            </span>
          </div>
        </TableCell>
        <TableCell className="py-4 text-center">
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </TableCell>
        <TableCell className="py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
                    onClick={onToggle}
                  >
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded && "transform rotate-180"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isExpanded ? "Masquer les leçons" : "Voir les leçons"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <LessonUploadModal courseId={courseId} sectionId={section.id} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-popover border-border"
              >
                <DropdownMenuItem
                  onClick={() =>
                    onEditRequest({
                      id: section.id,
                      title: section.title,
                      description: section.description,
                    })
                  }
                  className="text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier la section
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10"
                  onClick={() => {
                    onDeleteRequest({
                      id: section.id,
                      title: section.title,
                      lessonCount: section.lessons.length,
                    });
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer la section
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      {/* Ligne pour les leçons */}
      {isExpanded && (
        <TableRow className="bg-muted/20 dark:bg-gray-900/20">
          <TableCell colSpan={6} className="p-0">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-6 pb-6 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-6 bg-linear-to-b from-primary to-primary/80 rounded-full"></div>
                      <h4 className="font-semibold text-foreground">
                        Leçons de "{section.title}"
                      </h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {section.lessons.length} leçon
                        {section.lessons.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {section.lessons.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg bg-card/50">
                      <Video className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-foreground font-medium mb-2">
                        Aucune leçon dans cette section
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ajoutez votre première leçon pour commencer
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-border rounded-lg bg-card">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={localLessons.map((l) => l.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <Table>
                            <TableHeader className="bg-muted/50 dark:bg-gray-900/50">
                              <TableRow className="border-border">
                                <TableHead className="w-12 text-center px-4 py-3">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    #
                                  </span>
                                </TableHead>
                                <TableHead className="px-4 py-3">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Titre
                                  </span>
                                </TableHead>
                                <TableHead className="w-24 text-center px-4 py-3">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Type
                                  </span>
                                </TableHead>
                                <TableHead className="w-24 text-center px-4 py-3">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Durée
                                  </span>
                                </TableHead>
                                <TableHead className="w-24 text-center px-4 py-3">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Accès
                                  </span>
                                </TableHead>
                                <TableHead className="w-24 text-center px-4 py-3">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Visibilité
                                  </span>
                                </TableHead>
                                <TableHead className="w-24 text-center px-4 py-3">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Statut
                                  </span>
                                </TableHead>
                                <TableHead className="w-24 text-center px-4 py-3">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Actions
                                  </span>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {localLessons.map((lesson, lessonIndex) => (
                                <SortableLessonRow
                                  key={lesson.id}
                                  lesson={lesson}
                                  courseId={courseId}
                                  index={lessonIndex}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </SortableContext>

                        {/* DragOverlay */}
                        <DragOverlay>
                          {activeId ? (
                            <div className="bg-card border border-primary shadow-lg rounded-lg p-4 opacity-90">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <GripVertical className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {localLessons.find((l) => l.id === activeId)
                                      ?.title || "Leçon"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

// Skeleton amélioré avec shadcn/ui
const LessonSectionSkeleton = () => {
  return (
    <div className="space-y-6 w-full bg-background">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-px" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-px" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <Card className="border border-border bg-card rounded-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="flex items-center p-4 border-b border-border bg-muted/50">
                <Skeleton className="h-4 w-8 mx-auto mr-4" />
                <Skeleton className="h-4 w-64 mr-auto" />
                <Skeleton className="h-4 w-16 mx-4" />
                <Skeleton className="h-4 w-16 mx-4" />
                <Skeleton className="h-4 w-16 mx-4" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>

              {/* Rows */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border-b border-border hover:bg-muted/20">
                  <div className="flex items-center">
                    <div className="flex items-center gap-3 w-12">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 mx-4" />
                    <Skeleton className="h-4 w-16 mx-4" />
                    <Skeleton className="h-6 w-20 mx-4" />
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <Skeleton className="h-4 w-64" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const LessonSectionError = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-fit"
    >
      <Card className="border border-destructive/20 bg-destructive/5 dark:border-destructive/30 dark:bg-destructive/10 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-destructive/10 rounded-full flex items-center justify-center shadow">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h3 className="text-xl font-bold text-destructive mb-3">
            Impossible de charger les sections
          </h3>
          <p className="text-destructive/80 mb-6 max-w-md mx-auto">
            Une erreur est survenue lors du chargement de la structure du cours.
            Veuillez vérifier votre connexion et réessayer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow"
            >
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Réessayer
            </Button>
            <Button
              variant="outline"
              className="border-border hover:bg-accent"
              asChild
            >
              <Link href="/teacher/dashboard" >
                <ArrowRight className="w-4 h-4 mr-2" />
                Tableau de bord
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Types manquants à ajouter
interface TableSectionRowProps {
  section: Section;
  index: number;
  courseId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onDeleteRequest: (section: {
    id: string;
    title: string;
    lessonCount: number;
  }) => void;
  onEditRequest: (section: {
    id: string;
    title: string;
    description?: string;
  }) => void;
}
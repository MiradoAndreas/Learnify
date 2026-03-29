"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "@/components/video-player";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { lessonUpdateSchema } from "../../types/lesson-schema";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Edit3Icon,
  Eye,
  EyeOff,
  Globe,
  Lightbulb,
  Loader2Icon,
  Lock,
  Save,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "../components/advanced-rich-text-editor";
import { formatDuration } from "../utils/format-duration";
import { LessonAttachments } from "../components/lesson-attachments";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LessonIdSectionProps {
  lessonId: string;
  courseId: string;
}

export const LessonIdSection = ({
  lessonId,
  courseId,
}: LessonIdSectionProps) => {
  return (
    <Suspense fallback={<LessonIdSectionSkeleton />}>
      <ErrorBoundary fallback={<LessonIdSectionError />}>
        <LessonFormSuspense lessonId={lessonId} courseId={courseId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Skeleton amélioré avec shadcn/ui
const LessonIdSectionSkeleton = () => {
  return (
    <div className="w-full px-4 py-8 bg-background">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-11 w-24" />
            <Skeleton className="h-11 w-56" />
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Éditeur principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Titre Skeleton */}
            <Card className="border border-border bg-card shadow-lg rounded-2xl">
              <CardHeader className="border-b border-border">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Skeleton */}
            <Card className="border border-border bg-card shadow-lg rounded-2xl">
              <CardHeader className="border-b border-border">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>
                  <Skeleton className="h-[400px] w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Paramètres */}
          <div className="space-y-8">
            {/* Vidéo Skeleton */}
            <Card className="border border-border bg-card shadow-lg rounded-2xl">
              <CardHeader className="bg-muted border-b border-border py-6">
                <Skeleton className="h-7 w-40" />
              </CardHeader>
              <CardContent className="p-0">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paramètres Skeleton */}
            <Card className="border border-border bg-card shadow-lg rounded-2xl">
              <CardHeader className="border-b border-border">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <Skeleton className="h-11 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Statistiques Skeleton */}
            <Card className="border border-border bg-card shadow-lg rounded-2xl">
              <CardHeader className="border-b border-border">
                <Skeleton className="h-7 w-32" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Attachments Skeleton */}
        <div className="mt-5 md:mt-10">
          <Card className="border border-border bg-card shadow-lg rounded-2xl">
            <CardHeader className="border-b border-border">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const LessonIdSectionError = () => {
  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-center bg-background">
      <Card className="border border-destructive/20 bg-destructive/5 dark:border-destructive/30 dark:bg-destructive/10 shadow-lg max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Erreur de chargement
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Impossible de charger la leçon. Veuillez réessayer.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const LessonFormSuspense = ({ lessonId, courseId }: LessonIdSectionProps) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: lesson } = useSuspenseQuery(
    trpc.teacher.getLesson.queryOptions({ lessonId })
  );

  const form = useForm<z.infer<typeof lessonUpdateSchema>>({
    resolver: zodResolver(lessonUpdateSchema),
    defaultValues: {
      ...lesson,
      description: lesson.description ?? "<p></p>",
      isPublished: lesson.isPublished ?? false,
    },
  });

  const remove = useMutation(
    trpc.teacher.deleteLesson.mutationOptions({
      onSuccess: () => {
        toast.success("Leçon supprimée avec succès");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getLesson.queryKey({ lessonId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getAllLessonByCourseId.queryKey({
            courseId,
          }),
        });
      },
      onError: () =>
        toast.error("Une erreur est survenue lors de la suppression"),
    })
  );

  const update = useMutation(
    trpc.teacher.updateLesson.mutationOptions({
      onSuccess: () => {
        toast.success("Leçon mise à jour avec succès", {
          style: {
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            border: "none",
          },
        });
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getLesson.queryKey({ lessonId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getAllLessonByCourseId.queryKey({
            courseId,
          }),
        });
      },
      onError: () => toast.error("Une erreur est survenue"),
    })
  );

  const revalidate = useMutation(
    trpc.course.revalidate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getLesson.queryKey({
            lessonId: lessonId
          }),
        });
        toast.success("Vidéo revalidée avec succès", {
          style: {
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            border: "none",
          },
        });
      },
      onError: () => {
        toast.error("Erreur lors de la revalidation");
      },
    })
  );

  const onSubmit = (data: z.infer<typeof lessonUpdateSchema>) => {
    console.log("HTML : ", data.description);
    update.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-background text-foreground">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Header amélioré */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-0">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Éditeur de leçon
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Créez du contenu riche et engageant pour vos étudiants
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-11 border-border bg-background hover:bg-accent hover:text-accent-foreground"
              >
                Retour
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isDirty || update.isPending}
                className="h-11 bg-linear-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-primary-foreground"
              >
                {update.isPending ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Layout principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne gauche - Éditeur principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Titre */}
              <Card className="border border-border bg-card shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-xl font-bold text-foreground">
                    Informations de base
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Les informations essentielles de votre leçon
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-lg font-semibold text-foreground">
                          Titre de la leçon *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Introduction à React - Les bases fondamentales"
                            className="h-12 text-lg border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-lg dark:border-gray-700"
                          />
                        </FormControl>
                        <div className="flex items-center justify-between">
                          <FormMessage className="text-destructive" />
                          <span className="text-sm text-muted-foreground">
                            {field.value?.length || 0}/100 caractères
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Description avec Rich Text Editor */}
              <Card className="border border-border bg-card shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-xl font-bold text-foreground">
                    Contenu détaillé
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Expliquer et résumez en format text votre vidéo pour être
                    facile au étudiant de le comprendre
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-lg font-semibold text-foreground">
                            Description du leçon
                          </FormLabel>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                          >
                            <Edit3Icon className="w-3 h-3 mr-1" />
                            Avec un éditeur complet
                          </Badge>
                        </div>

                        <FormControl>
                          <RichTextEditor
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Rédigez votre contenu ici... Vous pouvez utiliser des titres, des listes, des liens, des images et bien plus !"
                            className="min-h-[400px] border-2 rounded-xl"
                          />
                        </FormControl>

                        <div className="space-y-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950/30 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <div className="space-y-2">
                                <p className="font-medium text-blue-900 dark:text-blue-300">
                                  Conseils pour une excellente description :
                                </p>
                                <ul className="text-sm text-blue-800 dark:text-blue-300/80 space-y-1">
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    Commencez par une introduction captivante
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    Utilisez des titres pour structurer votre
                                    contenu
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    Ajoutez des listes pour les points clés
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    Insérez des liens vers des ressources
                                    complémentaires
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p>
                              💡 <strong>Astuce :</strong> Utilisez Ctrl+I pour
                              l'italique, Ctrl+K pour insérer un lien
                            </p>
                          </div>
                        </div>

                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Colonne droite - Paramètres */}
            <div className="space-y-8">
              {/* Aperçu vidéo */}
              <Card className="border border-border bg-card shadow-lg rounded-2xl overflow-hidden pt-0">
                <CardHeader className="bg-linear-to-r from-primary to-primary/80 py-6  border-b border-border/20">
                  <CardTitle className="text-xl font-bold text-primary-foreground">
                    Aperçu de la vidéo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video bg-black/5 dark:bg-black/20">
                    <VideoPlayer
                      playbackId={lesson.muxPlaybackId}
                      thumbnailUrl={lesson.thumbnailUrl}
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="w-full">
                      <Button
                        variant="outline"
                        className="w-full border-border hover:bg-accent hover:text-accent-foreground"
                        onClick={() => revalidate.mutate({
                          id: lesson.id
                        })}
                        disabled={revalidate.isPending}
                      >
                        {revalidate.isPending ? (
                          <>
                            <Spinner className="mr-2 size-4" />
                            Revalidation...
                          </>
                        ) : (
                          "Revalider la vidéo"
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Statut :</span>
                      </div>
                      <Badge
                        className={cn(
                          "border-0",
                          lesson.muxStatus === "ready"
                            ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400"
                            : lesson.muxStatus === "processing"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                              : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                        )}
                      >
                        {lesson.muxStatus === "ready" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {lesson.muxStatus === "processing" && (
                          <Spinner className="w-3 h-3 mr-1" />
                        )}
                        {lesson.muxStatus}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Durée :</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {formatDuration(lesson.duration || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Paramètres de visibilité */}
              <Card className="border border-border bg-card shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-xl font-bold text-foreground">
                    Paramètres
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Contrôlez la visibilité de votre leçon
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-foreground">
                          Visibilité de la leçon
                        </FormLabel>
                        <FormControl>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="h-12 bg-background border-border text-foreground">
                              <SelectValue placeholder="Sélectionnez une visibilité" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="free" className="py-3">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-foreground" />
                                  <div>
                                    <p className="font-medium text-foreground">Gratuit</p>
                                    <p className="text-xs text-muted-foreground">
                                      Accessible à tous les étudiants
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="paid" className="py-3">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-foreground" />
                                  <div>
                                    <p className="font-medium text-foreground">Payant</p>
                                    <p className="text-xs text-muted-foreground">
                                      Uniquement pour les étudiants payants
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />

                  {/* Statut de publication */}
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-semibold text-foreground">
                              Statut de publication
                            </FormLabel>
                            <FormDescription className="text-sm text-muted-foreground">
                              {field.value
                                ? "La leçon est visible par les étudiants"
                                : "La leçon est en brouillon, seuls vous pouvez la voir"}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={update.isPending}
                              className={cn(
                                field.value
                                  ? "data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-600"
                                  : "data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
                              )}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Badge d'état */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={form.watch("isPublished") ? "default" : "outline"}
                        className={cn(
                          form.watch("isPublished")
                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 border-0"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {form.watch("isPublished") ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Publié</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Brouillon</span>
                            </>
                          )}
                        </div>
                      </Badge>

                      {/* Indicateur de modification */}
                      {form.formState.dirtyFields.isPublished && (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                        >
                          Modification non enregistrée
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bouton de suppression */}
                  <div className="pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full h-11"
                      onClick={() => {
                        if (
                          confirm(
                            "Êtes-vous sûr de vouloir supprimer cette leçon ?"
                          )
                        ) {
                          remove.mutate({ lessonId });
                        }
                      }}
                      disabled={remove.isPending}
                    >
                      {remove.isPending ? (
                        <>
                          <Spinner className="mr-2 size-4" />
                          Suppression...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer cette leçon
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques rapides */}
              <Card className="border border-border bg-card shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-xl font-bold text-foreground">
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Date de création</span>
                      <span className="font-medium text-foreground">
                        {new Date(lesson.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Dernière modification
                      </span>
                      <span className="font-medium text-foreground">
                        {lesson.updatedAt
                          ? new Date(lesson.updatedAt).toLocaleDateString("fr-FR")
                          : "Jamais"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Position dans la section
                      </span>
                      <Badge
                        variant="outline"
                        className="font-medium border-border text-foreground"
                      >
                        #{lesson.position}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* Attachments */}
      <div className="mt-5 md:mt-10">
        <LessonAttachments lessonId={lessonId} />
      </div>
    </div>
  );
};
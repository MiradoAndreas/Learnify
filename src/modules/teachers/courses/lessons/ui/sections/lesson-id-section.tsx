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

interface LessonIdSectionProps {
  lessonId: string;
  courseId: string;
}

export const LessonIdSection = ({
  lessonId,
  courseId,
}: LessonIdSectionProps) => {
  return (
    <Suspense fallback={<LessonIdSectionLoading />}>
      <ErrorBoundary fallback={<div>Erreur, veuillez réessayer plus tard</div>}>
        <LessonFormSuspense lessonId={lessonId} courseId={courseId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const LessonIdSectionLoading = () => {
  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-center ">
      <Loader2Icon className="w-12 h-12 text-orange-400 animate-spin" />
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
        // todo: add this
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getAllLessonByCourseId.queryKey({
            courseId,
          }),
        });
        router.back();
      },
      onError: () =>
        toast.error("Une erreur est survenue lors de la suppression"),
    })
  );

  const update = useMutation(
    trpc.teacher.updateLesson.mutationOptions({
      onSuccess: () => {
        toast.success("Leçon mise à jour avec succès");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getLesson.queryKey({ lessonId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getAllLessonByCourseId.queryKey({
            courseId,
          }),
        });
        router.back();
      },
      onError: () => toast.error("Une erreur est survenue"),
    })
  );

  const onSubmit = (data: z.infer<typeof lessonUpdateSchema>) => {
    console.log("HTML : ", data.description);
    update.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Header amélioré */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-linear-to-r">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
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
                className="h-11"
              >
                Retour
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isDirty || update.isPending}
                className="h-11 bg-linear-to-r from-[#feba45] to-[#ff9e1f] hover:from-[#ff9e1f] hover:to-[#feba45]"
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
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    Informations de base
                  </CardTitle>
                  <CardDescription>
                    Les informations essentielles de votre leçon
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-lg font-semibold">
                          Titre de la leçon *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Introduction à React - Les bases fondamentales"
                            className="h-12 text-lg border-2 focus:border-blue-500"
                          />
                        </FormControl>
                        <div className="flex items-center justify-between">
                          <FormMessage />
                          <span className="text-sm text-gray-500">
                            {field.value?.length || 0}/100 caractères
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Description avec Rich Text Editor */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    Contenu détaillé
                  </CardTitle>
                  <CardDescription>
                    Expliquer et resumez en format text votre vidéo pour être
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
                          <FormLabel className="text-lg font-semibold">
                            Description du leçon
                          </FormLabel>
                          <Badge variant="outline" className="bg-blue-50">
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
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div className="space-y-2">
                                <p className="font-medium text-blue-900">
                                  Conseils pour une excellente description :
                                </p>
                                <ul className="text-sm text-blue-800 space-y-1">
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Commencez par une introduction captivante
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Utilisez des titres pour structurer votre
                                    contenu
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Ajoutez des listes pour les points clés
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Insérez des liens vers des ressources
                                    complémentaires
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <p>
                              💡 <strong>Astuce :</strong> Utilisez, Ctrl+I pour
                              l'italique, Ctrl+K pour insérer un lien
                            </p>
                          </div>
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Colonne droite - Paramètres */}
            <div className="space-y-8">
              {/* Aperçu vidéo */}
              <Card className="border-0 pt-0 shadow-lg rounded-2xl overflow-hidden gap-0">
                <CardHeader className="bg-[#f36b16] py-6">
                  <CardTitle className="text-xl font-bold text-white">
                    Aperçu de la vidéo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video">
                    <VideoPlayer
                      playbackId={lesson.muxPlaybackId}
                      thumbnailUrl={lesson.thumbnailUrl}
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Statut :</span>
                      </div>
                      <Badge
                        className={
                          lesson.muxStatus === "ready"
                            ? "bg-green-100 text-green-800"
                            : lesson.muxStatus === "processing"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {lesson.muxStatus}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Durée :</span>
                      </div>
                      <span className="font-medium">
                        {formatDuration(lesson.duration || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Paramètres de visibilité */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
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
                        <FormLabel className="font-semibold">
                          Visibilité de la leçon
                        </FormLabel>
                        <FormControl>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Sélectionnez une visibilité" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free" className="py-3">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  <div>
                                    <p className="font-medium">Gratuit</p>
                                    <p className="text-xs text-gray-500">
                                      Accessible à tous les étudiants
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="paid" className="py-3">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  <div>
                                    <p className="font-medium">Payant</p>
                                    <p className="text-xs text-gray-500">
                                      Uniquement pour les étudiants payants
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Statut de publication */}
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-semibold">
                              Statut de publication
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-600">
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
                              className={
                                field.value
                                  ? "data-[state=checked]:bg-green-600"
                                  : "data-[state=unchecked]:bg-gray-300"
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Badge d'état */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          form.watch("isPublished") ? "default" : "outline"
                        }
                        className={
                          form.watch("isPublished")
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
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
                          className="bg-amber-50 text-amber-800"
                        >
                          Modification non enregistrée
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bouton de suppression */}
                  <div className="pt-4 border-t">
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
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Date de création</span>
                      <span className="font-medium">
                        {new Date(lesson.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Dernière modification
                      </span>
                      <span className="font-medium">
                        {lesson.updatedAt
                          ? new Date(lesson.updatedAt).toLocaleDateString(
                              "fr-FR"
                            )
                          : "Jamais"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Position dans la section
                      </span>
                      <Badge variant="outline" className="font-medium">
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
      <div className="mt-5 md:mt-10">
        <LessonAttachments lessonId={lessonId} />
      </div>
    </div>
  );
};

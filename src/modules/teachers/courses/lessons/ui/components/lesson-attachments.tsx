// components/lesson-attachments.tsx
"use client";

import { useState, Suspense, useMemo } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

import {
  FileText,
  FileImage,
  File,
  Presentation,
  Archive,
  Trash2,
  Edit,
  Download,
  Eye,
  Loader2,
  Music,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Upload,
  FolderPlus,
  FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

const UploadDropzone = dynamic(
  () => import("@/lib/uploadthing").then((m) => m.UploadDropzone),
  { ssr: false }
);

interface LessonAttachmentsProps {
  lessonId: string;
  className?: string;
}

export const LessonAttachments = ({
  lessonId,
  className,
}: LessonAttachmentsProps) => {
  return (
    <Suspense fallback={<LessonAttachmentsSkeleton />}>
      <ErrorBoundary fallback={<LessonAttachmentsError />}>
        <LessonAttachmentsSuspense lessonId={lessonId} className={className} />
      </ErrorBoundary>
    </Suspense>
  );
};

const LessonAttachmentsError = () => {
  return (
    <Card className="border border-destructive/20 bg-destructive/5 dark:border-destructive/30 dark:bg-destructive/10">
      <CardContent className="p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Erreur de chargement
        </h3>
        <p className="text-sm text-muted-foreground">
          Impossible de charger les pièces jointes.
        </p>
      </CardContent>
    </Card>
  );
};

// Skeleton amélioré avec shadcn/ui
const LessonAttachmentsSkeleton = () => {
  return (
    <div className="space-y-8 w-full">
      {/* Header avec statistiques */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center space-y-1">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-8 w-20 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        </div>
      </div>

      {/* Zone d'upload skeleton */}
      <Card className="border border-border bg-card">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2 w-full max-w-md">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
              <Skeleton className="h-10 w-40 rounded-lg" />
            </div>

            {/* Types de fichiers supportés skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-3 rounded-xl border border-border"
                >
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des fichiers skeleton */}
      <Card className="border border-border bg-card">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card"
              >
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-9 w-9 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informations skeleton */}
      <Card className="border border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="w-2 h-2 rounded-full mt-1.5" />
                    <Skeleton className="h-3 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const LessonAttachmentsSuspense = ({
  lessonId,
  className,
}: LessonAttachmentsProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Récupérer les attachments de la leçon
  const { data: attachments = [] } = useSuspenseQuery(
    trpc.teacher.getLessonAttachments.queryOptions({ lessonId })
  );

  // Mutation pour supprimer un attachment de leçon
  const deleteAttachment = useMutation(
    trpc.teacher.deleteLessonAttachment.mutationOptions({
      onSuccess: () => {
        toast.success("Supprimé avec succès!", {
          style: {
            background: "hsl(var(--destructive))",
            color: "hsl(var(--destructive-foreground))",
            border: "none",
          },
          icon: <CheckCircle className="w-5 h-5" />,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getLessonAttachments.queryKey({ lessonId }),
        });
      },
      onError: (err: any) => toast.error(err.message || "Erreur"),
    })
  );

  // Mutation pour renommer un attachment de leçon
  const updateName = useMutation(
    trpc.teacher.updateLessonAttachmentName.mutationOptions({
      onSuccess: () => {
        toast.success("Nom mis à jour", {
          style: {
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            border: "none",
          },
          icon: <CheckCircle className="w-5 h-5" />,
        });
        setEditingId(null);
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getLessonAttachments.queryKey({ lessonId }),
        });
      },
      onError: (err: any) => toast.error(err.message || "Erreur"),
    })
  );

  // Icone selon le type de fichier
  const getFileIcon = (type: string, size: "sm" | "lg" = "sm") => {
    const iconSize = size === "lg" ? "h-6 w-6" : "h-5 w-5";

    const getIcon = () => {
      switch (type.toLowerCase()) {
        case "pdf":
          return <FileText className={iconSize} />;
        case "ppt":
        case "pptx":
          return <Presentation className={iconSize} />;
        case "doc":
        case "docx":
          return <File className={iconSize} />;
        case "image":
        case "jpg":
        case "png":
        case "gif":
        case "webp":
          return <FileImage className={iconSize} />;
        case "zip":
        case "rar":
        case "7z":
          return <Archive className={iconSize} />;
        case "mp3":
        case "wav":
        case "audio":
          return <Music className={iconSize} />;
        case "mp4":
        case "mov":
        case "video":
          return <Video className={iconSize} />;
        default:
          return <FileIcon className={iconSize} />;
      }
    };

    return (
      <div className={`relative group ${size === "lg" ? "p-3" : "p-2"}`}>
        <div
          className={cn(
            "rounded-lg flex items-center justify-center transition-all duration-300",
            size === "lg" ? "w-12 h-12" : "w-10 h-10",
            "bg-gradient-to-br from-card to-muted border border-border",
            "group-hover:border-primary/30 group-hover:shadow-lg"
          )}
          style={{
            boxShadow: isDragging ? "0 0 20px hsl(var(--primary) / 0.25)" : "none",
          }}
        >
          <div className="text-muted-foreground group-hover:text-primary transition-colors">
            {getIcon()}
          </div>
        </div>
        {size === "lg" && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-primary to-primary/80 rounded-full border-2 border-background shadow-md animate-pulse"></div>
        )}
      </div>
    );
  };

  // Formater la taille
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Obtenir l'extension du fichier
  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "FILE";
  };

  // Obtenir la couleur en fonction du type (adapté dark mode)
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400";
      case "doc":
      case "docx":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400";
      case "ppt":
      case "pptx":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400";
      case "image":
        return "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400";
      case "zip":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400";
      case "audio":
        return "bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-400";
      case "video":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const totalSize = useMemo(() => {
    return attachments.reduce((sum, att) => sum + att.size, 0);
  }, [attachments]);

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header avec statistiques */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70 rounded-xl blur-lg opacity-30"></div>
              <div className="relative w-12 h-12 bg-gradient-to-r from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-xl">
                <FolderPlus className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Ressources de la leçon
              </h3>
              <p className="text-muted-foreground">
                Documents, images et fichiers complémentaires
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {attachments.length}
            </div>
            <div className="text-sm text-muted-foreground">Fichiers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatFileSize(totalSize)}
            </div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>
      </div>

      {/* Zone d'upload avec effet drag and drop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative border-3 border-dashed rounded-2xl p-8 transition-all duration-300",
          isDragging
            ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl"
            : "border-border hover:border-primary hover:shadow-lg bg-gradient-to-br from-card to-muted/50"
        )}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-12 h-12 text-primary mx-auto mb-3 animate-bounce" />
              <p className="text-lg font-semibold text-primary">
                Lâchez pour télécharger
              </p>
            </div>
          </div>
        )}

        <UploadDropzone
          endpoint="lessonAttachmentUploader"
          input={{ lessonId }}
          onClientUploadComplete={(res) => {
            setIsDragging(false);
            if (res && res.length > 0) {
              toast.success(`${res.length} fichier(s) ajouté(s)`, {
                description: `"${res[0]?.name}" a été téléchargé avec succès`,
                style: {
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                  border: "none",
                },
                icon: <Sparkles className="w-5 h-5" />,
              });
              queryClient.invalidateQueries({
                queryKey: trpc.teacher.getLessonAttachments.queryKey({
                  lessonId,
                }),
              });
            }
          }}
          onUploadError={(error) => {
            setIsDragging(false);
            toast.error("Échec du téléchargement", {
              description: error.message,
              style: {
                background: "hsl(var(--destructive))",
                color: "hsl(var(--destructive-foreground))",
                border: "none",
              },
              icon: <XCircle className="w-5 h-5" />,
            });
          }}
          onUploadBegin={() => {
            toast.info("Téléchargement en cours...", {
              duration: 3000,
              style: {
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                border: "none",
              },
            });
          }}
          config={{
            mode: "auto",
            appendOnPaste: true,
          }}
          appearance={{
            container: {
              border: "none",
              background: "transparent",
              borderRadius: "1rem",
            },
            uploadIcon: {
              color: "hsl(var(--primary))",
              width: "3.5rem",
              height: "3.5rem",
            },
            label: {
              color: "hsl(var(--foreground))",
              fontSize: "1.125rem",
              fontWeight: "600",
              marginTop: "1rem",
            },
            allowedContent: {
              color: "hsl(var(--muted-foreground))",
              fontSize: "0.875rem",
              marginTop: "0.5rem",
            },
            button: {
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              fontWeight: "600",
              padding: "0.875rem 2rem",
              borderRadius: "0.75rem",
              fontSize: "0.95rem",
              marginTop: "1.5rem",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 20px hsl(var(--primary) / 0.25)",
            },
          }}
          className="cursor-pointer"
        />

        {/* Types de fichiers supportés */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <FileText className="h-4 w-4" />, label: "PDF, DOC" },
            { icon: <FileImage className="h-4 w-4" />, label: "Images" },
            { icon: <Music className="h-4 w-4" />, label: "Audio" },
            { icon: <Archive className="h-4 w-4" />, label: "Archives" },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground bg-card p-3 rounded-xl border border-border hover:border-primary transition-colors"
            >
              <div className="text-primary">{item.icon}</div>
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>
            Glissez-déposez ou cliquez pour télécharger (max 64MB par fichier)
          </p>
        </div>
      </motion.div>

      {/* Liste des fichiers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileIcon className="h-5 w-5 text-primary" />
            Toutes les ressources ({attachments.length})
          </h4>
          {attachments.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary text-primary bg-background"
              >
                {formatFileSize(totalSize)}
              </Badge>
            </div>
          )}
        </div>

        {attachments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-gradient-to-b from-card to-muted/30"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
              <FileIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">
              Aucune ressource pour le moment
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Ajoutez des documents, images ou fichiers audio pour enrichir
              votre leçon
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {(attachments as any[]).map((attachment, index) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary hover:shadow-lg bg-card transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {getFileIcon(attachment.type, "lg")}

                    <div className="flex-1 min-w-0">
                      {editingId === attachment.id ? (
                        <div className="flex items-center gap-3">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-10 flex-1 border-2 border-primary focus:ring-2 focus:ring-primary/20 bg-background"
                            placeholder="Nouveau nom"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateName.mutate({
                                  attachmentId: attachment.id,
                                  lessonId,
                                  name: editName,
                                });
                              } else if (e.key === "Escape") {
                                setEditingId(null);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-primary-foreground"
                            onClick={() => {
                              if (editName.trim() === "") {
                                toast.error("Le nom ne peut pas être vide", {
                                  icon: <AlertCircle className="w-5 h-5" />,
                                });
                                return;
                              }
                              updateName.mutate({
                                attachmentId: attachment.id,
                                lessonId,
                                name: editName.trim(),
                              });
                            }}
                            disabled={updateName.isPending}
                          >
                            {updateName.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Sauvegarder"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditName("");
                            }}
                            className="border-border hover:bg-accent"
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-foreground truncate max-w-[250px] group-hover:text-primary transition-colors">
                              {attachment.name}
                            </div>
                            <Badge
                              className={cn(
                                "text-xs ml-2",
                                getTypeColor(attachment.type)
                              )}
                            >
                              {getFileExtension(attachment.name)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                            <span>{formatFileSize(attachment.size)}</span>
                            <span>•</span>
                            <span className="capitalize">
                              {attachment.type}
                            </span>
                            <span>•</span>
                            <span className="text-xs">
                              Ajouté le{" "}
                              {new Date(
                                attachment.createdAt
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {editingId !== attachment.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                          onClick={() =>
                            window.open(attachment.attachmentUrl, "_blank")
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Tooltip>

                      <Tooltip>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
                          onClick={() => {
                            setEditingId(attachment.id);
                            setEditName(attachment.name);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Tooltip>

                      <Tooltip>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                          onClick={() => {
                            if (
                              confirm(
                                `Supprimer définitivement "${attachment.name}" ?`
                              )
                            ) {
                              deleteAttachment.mutate({
                                attachmentId: attachment.id,
                                lessonId,
                              });
                            }
                          }}
                          disabled={deleteAttachment.isPending}
                        >
                          {deleteAttachment.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Informations et limites */}
      <Card className="border border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold text-foreground">
                Informations importantes
              </h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                  <span>Maximum 10 fichiers par téléchargement</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                  <span>Taille maximale par fichier : 64MB</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                  <span>
                    Formats supportés : PDF, DOC, PPT, Images, Audio, Archives
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                  <span>
                    Les ressources sont accessibles aux étudiants inscrits à la
                    leçon
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
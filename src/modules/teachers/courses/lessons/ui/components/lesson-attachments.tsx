// components/lesson-attachments.tsx
"use client";

import { useState, Suspense, useMemo } from "react";
import {
  useMutation,
  useQuery,
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
  ExternalLink,
  Sparkles,
  Upload,
  FolderPlus,
  FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="w-full">
      <div className="space-y-6">
        <p>LessonAttachmentsError...</p>
      </div>
    </div>
  );
};

const LessonAttachmentsSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header avec statistiques */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mt-2" />
          </div>
          <div className="text-center">
            <Skeleton className="h-8 w-20 mx-auto" />
            <Skeleton className="h-3 w-16 mt-2" />
          </div>
        </div>
      </div>

      {/* Zone d'upload skeleton */}
      <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2 w-full max-w-md">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>

          {/* Types de fichiers supportés skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-xl border border-gray-200"
              >
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des fichiers skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Fichiers skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white"
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
      </div>

      {/* Informations skeleton */}
      <div className="rounded-2xl p-6 border border-gray-200">
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
      </div>
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

  // Couleurs primaires personnalisées
  const PRIMARY_COLOR = "#f36b16";
  const PRIMARY_LIGHT = "#fde8dd";
  const PRIMARY_DARK = "#d85a12";

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
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "white",
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
            background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%)`,
            color: "white",
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

  // Icone selon le type de fichier avec la couleur primaire
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
          className={`rounded-lg flex items-center justify-center transition-all duration-300
            ${size === "lg" ? "w-12 h-12" : "w-10 h-10"}
            bg-linear-to-br from-white to-gray-50 border border-gray-200
            group-hover:border-[#f36b16]/30 group-hover:shadow-lg`}
          style={{
            boxShadow: isDragging ? `0 0 20px ${PRIMARY_COLOR}40` : "none",
          }}
        >
          <div className="text-gray-600 group-hover:text-[#f36b16] transition-colors">
            {getIcon()}
          </div>
        </div>
        {size === "lg" && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-linear-to-r from-[#f36b16] to-[#ff9e1f] rounded-full border-2 border-white shadow-md animate-pulse"></div>
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

  // Obtenir la couleur en fonction du type
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "bg-red-100 text-red-800";
      case "doc":
      case "docx":
        return "bg-blue-100 text-blue-800";
      case "ppt":
      case "pptx":
        return "bg-orange-100 text-orange-800";
      case "image":
        return "bg-green-100 text-green-800";
      case "zip":
        return "bg-purple-100 text-purple-800";
      case "audio":
        return "bg-pink-100 text-pink-800";
      case "video":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              <div className="absolute inset-0 bg-linear-to-r from-[#f36b16] to-[#ff9e1f] rounded-xl blur-lg opacity-30"></div>
              <div className="relative w-12 h-12 bg-linear-to-r from-[#f36b16] to-[#ff9e1f] rounded-xl flex items-center justify-center shadow-xl">
                <FolderPlus className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-linear-to-r from-[#f36b16] to-[#ff9e1f] bg-clip-text text-transparent">
                Ressources de la leçon
              </h3>
              <p className="text-gray-600">
                Documents, images et fichiers complémentaires
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {attachments.length}
            </div>
            <div className="text-sm text-gray-500">Fichiers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatFileSize(totalSize)}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Zone d'upload avec effet drag and drop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-3 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          isDragging
            ? "border-[#f36b16] bg-linear-to-br from-[#f36b16]/5 to-[#ff9e1f]/5 shadow-xl"
            : "border-gray-300 hover:border-[#f36b16] hover:shadow-lg bg-linear-to-br from-gray-50 to-white"
        }`}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-linear-to-br from-[#f36b16]/10 to-[#ff9e1f]/10 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-12 h-12 text-[#f36b16] mx-auto mb-3 animate-bounce" />
              <p className="text-lg font-semibold text-[#f36b16]">
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
                  background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%)`,
                  color: "white",
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
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
              },
              icon: <XCircle className="w-5 h-5" />,
            });
          }}
          onUploadBegin={() => {
            toast.info("Téléchargement en cours...", {
              duration: 3000,
              style: {
                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%)`,
                color: "white",
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
              color: PRIMARY_COLOR,
              width: "3.5rem",
              height: "3.5rem",
            },
            label: {
              color: "#374151",
              fontSize: "1.125rem",
              fontWeight: "600",
              marginTop: "1rem",
            },
            allowedContent: {
              color: "#6b7280",
              fontSize: "0.875rem",
              marginTop: "0.5rem",
            },
            button: {
              background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%)`,
              color: "white",
              fontWeight: "600",
              padding: "0.875rem 2rem",
              borderRadius: "0.75rem",
              fontSize: "0.95rem",
              marginTop: "1.5rem",
              transition: "all 0.3s ease",
              boxShadow: `0 4px 20px ${PRIMARY_COLOR}40`,
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
              className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-200 hover:border-[#f36b16] transition-colors"
            >
              <div className="text-[#f36b16]">{item.icon}</div>
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>
            Glissez-déposez ou cliquez pour télécharger (max 64MB par fichier)
          </p>
        </div>
      </motion.div>

      {/* Liste des fichiers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileIcon className="h-5 w-5 text-[#f36b16]" />
            Toutes les ressources ({attachments.length})
          </h4>
          {attachments.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-[#f36b16] text-[#f36b16]"
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
            className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-linear-to-b from-white to-gray-50"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <FileIcon className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              Aucune ressource pour le moment
            </p>
            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
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
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-[#f36b16] hover:shadow-lg bg-white transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {getFileIcon(attachment.type, "lg")}

                    <div className="flex-1 min-w-0">
                      {editingId === attachment.id ? (
                        <div className="flex items-center gap-3">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-10 flex-1 border-2 border-[#f36b16] focus:ring-2 focus:ring-[#f36b16]/20"
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
                            className="bg-linear-to-r from-[#f36b16] to-[#ff9e1f] hover:from-[#ff9e1f] hover:to-[#f36b16]"
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
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-gray-900 truncate max-w-[250px] group-hover:text-[#f36b16] transition-colors">
                              {attachment.name}
                            </div>
                            <Badge
                              className={`text-xs ${getTypeColor(
                                attachment.type
                              )} ml-2`}
                            >
                              {getFileExtension(attachment.name)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
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
                          className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600"
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
                          className="h-9 w-9 hover:bg-[#f36b16]/10 hover:text-[#f36b16]"
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
                          className="h-9 w-9 hover:bg-red-50 hover:text-red-600"
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
      <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-linear-to-r from-[#f36b16]/10 to-[#ff9e1f]/10 rounded-xl flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-[#f36b16]" />
          </div>
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-900">
              Informations importantes
            </h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#f36b16] mt-1.5"></div>
                <span>Maximum 10 fichiers par téléchargement</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#f36b16] mt-1.5"></div>
                <span>Taille maximale par fichier : 64MB</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#f36b16] mt-1.5"></div>
                <span>
                  Formats supportés : PDF, DOC, PPT, Images, Audio, Archives
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#f36b16] mt-1.5"></div>
                <span>
                  Les ressources sont accessibles aux étudiants inscrits à la
                  leçon
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

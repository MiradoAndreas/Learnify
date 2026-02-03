// components/course-attachments.tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CourseAttachmentsProps {
  courseId: string;
}

export const CourseAttachments = ({ courseId }: CourseAttachmentsProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Récupérer les attachments
  const { data: attachments = [], isLoading } = useQuery(
    trpc.teacher.getCourseAttachments.queryOptions({ courseId })
  );

  // Mutation pour supprimer
  const deleteAttachment = useMutation(
    trpc.teacher.deleteCourseAttachment.mutationOptions({
      onSuccess: () => {
        toast.success("Pièce jointe supprimée");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseAttachments.queryKey({ courseId }),
        });
      },
      onError: (err) => toast.error(err.message),
    })
  );

  // Mutation pour renommer
  const updateName = useMutation(
    trpc.teacher.updateAttachmentName.mutationOptions({
      onSuccess: () => {
        toast.success("Nom mis à jour");
        setEditingId(null);
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseAttachments.queryKey({ courseId }),
        });
      },
      onError: (err) => toast.error(err.message),
    })
  );

  // Icone selon le type de fichier
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "ppt":
        return <Presentation className="h-5 w-5 text-orange-500" />;
      case "doc":
        return <File className="h-5 w-5 text-blue-500" />;
      case "image":
        return <FileImage className="h-5 w-5 text-green-500" />;
      case "zip":
        return <Archive className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Formater la taille
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return <div>Chargement des pièces jointes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Zone d'upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <UploadDropzone
          endpoint="courseAttachmentUploader"
          input={{ courseId }}
          onClientUploadComplete={(res) => {
            toast.success("Fichier téléchargé avec succès!");
            queryClient.invalidateQueries({
              queryKey: trpc.teacher.getCourseAttachments.queryKey({
                courseId,
              }),
            });
          }}
          onUploadError={(error) => {
            toast.error(`Erreur: ${error.message}`);
          }}
          config={{
            mode: "auto",
          }}
        />
      </div>

      {/* Liste des fichiers */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">
          Pièces jointes ({attachments.length})
        </h3>

        {attachments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune pièce jointe pour le moment
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(attachment.type)}

                  {editingId === attachment.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          updateName.mutate({
                            attachmentId: attachment.id,
                            courseId,
                            name: editName,
                          });
                        }}
                        disabled={updateName.isPending}
                      >
                        {updateName.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Valider"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="font-medium">{attachment.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(attachment.size)} •{" "}
                        {attachment.type.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingId !== attachment.id && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(attachment.attachmentUrl, "_blank")
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(attachment.id);
                          setEditName(attachment.name);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Supprimer cette pièce jointe ?")) {
                            deleteAttachment.mutate({
                              attachmentId: attachment.id,
                              courseId,
                            });
                          }
                        }}
                        disabled={deleteAttachment.isPending}
                      >
                        {deleteAttachment.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

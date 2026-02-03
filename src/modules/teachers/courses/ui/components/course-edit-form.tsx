"use client";

import { useState, useMemo, useEffect, memo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  X,
  Check,
  Search,
  Target,
  Users,
  Star,
  Globe,
  BookOpen,
  DollarSign,
  TrendingUp,
  CheckCircle,
  PlusCircle,
  Trash2,
  Edit,
  Save,
  Loader2,
  Sparkles,
  BookMarked,
  GraduationCap,
  Info,
  HelpCircle,
  Rocket,
  Zap,
  Trophy,
  Crown,
  Lightbulb,
  Eye,
  Video,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  FileText,
  FileImage,
  File,
  Presentation,
  Archive,
  Music,
  MessageSquare,
  ChevronDown,
  EyeOff,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";

import { z } from "zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UploadDropzone } from "@/lib/uploadthing";
import { ErrorBoundary } from "react-error-boundary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Charger dynamiquement les composants lourds
const CourseAttachments = dynamic(
  () => Promise.resolve(CourseAttachmentsComponent),
  {
    ssr: false,
    loading: () => <CourseAttachmentsSkeleton />,
  }
);

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  group?: string;
}
interface Requirement {
  id: string;
  text: string;
}
interface Objective {
  id: string;
  text: string;
}
interface Audience {
  id: string;
  text: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  level: "beginner" | "intermediate" | "advanced";
  language: "fr" | "mg" | "en";
  status: "draft" | "published";
  categories: Category[];
  requirements: Requirement[];
  objectives: Objective[];
  audiences: Audience[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  attachmentUrl: string;
}

// Validation schemas
const basicsSchema = z.object({
  title: z.string().min(5, "Titre trop court"),
  description: z.string().min(20, "Description trop courte"),
  price: z.number().min(0, "Prix invalide"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  language: z.enum(["fr", "mg", "en"]),
});

const categorySchema = z.object({
  categoryId: z.string().min(1, "Une catégorie est requise"),
});

type BasicsInput = z.infer<typeof basicsSchema>;
type CategoryInput = z.infer<typeof categorySchema>;

// Composants Skeleton optimisés
const CourseAttachmentsError = () => (
  <div className="w-full">
    <div className="space-y-6">
      <p>CourseAttachmentsError...</p>
    </div>
  </div>
);

const CourseAttachmentsSkeleton = () => (
  <Card className="border-0 pt-0 shadow-xl rounded-2xl">
    <CardHeader className="pt-6">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
        </div>
      ))}
    </CardContent>
  </Card>
);

// Composants mémoïsés
const FileIcon = memo(({ type }: { type: string }) => {
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
});
FileIcon.displayName = "FileIcon";

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Composant AttachmentItem mémoïsé
const AttachmentItem = memo(
  ({
    attachment,
    editingId,
    editName,
    courseId,
    setEditingId,
    setEditName,
    updateName,
    deleteAttachment,
  }: any) => {
    const isEditing = editingId === attachment.id;

    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-all duration-200 group">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <FileIcon type={attachment.type} />
            {attachment.type === "pdf" && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </div>

          {isEditing ? (
            <AttachmentEditForm
              editName={editName}
              setEditName={setEditName}
              updateName={updateName}
              setEditingId={setEditingId}
              attachmentId={attachment.id}
              courseId={courseId}
            />
          ) : (
            <AttachmentView
              attachment={attachment}
              onEdit={() => {
                setEditingId(attachment.id);
                setEditName(attachment.name);
              }}
              onDelete={() => {
                if (confirm(`Supprimer "${attachment.name}" ?`)) {
                  deleteAttachment.mutate({
                    attachmentId: attachment.id,
                    courseId,
                  });
                }
              }}
              deletePending={deleteAttachment.isPending}
            />
          )}
        </div>
      </div>
    );
  }
);
AttachmentItem.displayName = "AttachmentItem";

const AttachmentEditForm = memo(
  ({
    editName,
    setEditName,
    updateName,
    setEditingId,
    attachmentId,
    courseId,
  }: any) => (
    <div className="flex items-center gap-2 flex-1">
      <Input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        className="h-9 flex-1"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updateName.mutate({
              attachmentId,
              courseId,
              name: editName,
            });
          } else if (e.key === "Escape") {
            setEditingId(null);
          }
        }}
      />
      <Button
        size="sm"
        variant="default"
        className="bg-teal-500 hover:bg-teal-600"
        onClick={() => {
          updateName.mutate({
            attachmentId,
            courseId,
            name: editName,
          });
        }}
        disabled={updateName.isPending}
      >
        {updateName.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Enregistrer"
        )}
      </Button>
      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
        Annuler
      </Button>
    </div>
  )
);
AttachmentEditForm.displayName = "AttachmentEditForm";

const AttachmentView = memo(
  ({ attachment, onEdit, onDelete, deletePending }: any) => (
    <>
      <div
        className="flex-1 cursor-pointer"
        onClick={() => window.open(attachment.attachmentUrl, "_blank")}
      >
        <div className="font-medium group-hover:text-teal-700 transition-colors">
          {attachment.name}
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span>{formatFileSize(attachment.size)}</span>
          <span>•</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
            {attachment.type.toUpperCase()}
          </span>
          <span>•</span>
          <span className="text-xs">Ajouté récemment</span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <AttachmentActionButton
          icon={<Eye className="h-4 w-4" />}
          onClick={() => window.open(attachment.attachmentUrl, "_blank")}
          title="Voir le fichier"
          className="hover:bg-teal-100 hover:text-teal-700"
        />
        <AttachmentActionButton
          icon={<Edit className="h-4 w-4" />}
          onClick={onEdit}
          title="Renommer"
          className="hover:bg-blue-100 hover:text-blue-700"
        />
        <AttachmentActionButton
          icon={
            deletePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )
          }
          onClick={onDelete}
          title="Supprimer"
          className="hover:bg-red-100 hover:text-red-700"
          disabled={deletePending}
        />
      </div>
    </>
  )
);
AttachmentView.displayName = "AttachmentView";

const AttachmentActionButton = memo(
  ({ icon, onClick, title, className, disabled }: any) => (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${className}`}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {icon}
    </Button>
  )
);
AttachmentActionButton.displayName = "AttachmentActionButton";

// Composant principal des attachments
const CourseAttachmentsComponent = ({ courseId }: { courseId: string }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data: attachments = [] } = useSuspenseQuery(
    trpc.teacher.getCourseAttachments.queryOptions({ courseId })
  );

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

  return (
    <div className="space-y-6">
      <UploadZone courseId={courseId} />
      <AttachmentList
        attachments={attachments as Attachment[]}
        editingId={editingId}
        editName={editName}
        courseId={courseId}
        setEditingId={setEditingId}
        setEditName={setEditName}
        updateName={updateName}
        deleteAttachment={deleteAttachment}
      />
    </div>
  );
};

const UploadZone = memo(({ courseId }: { courseId: string }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50 transition-all duration-300 hover:border-teal-400 hover:shadow-lg">
      <UploadDropzone
        endpoint="courseAttachmentUploader"
        input={{ courseId }}
        onClientUploadComplete={() => {
          toast.success("Fichier téléchargé avec succès!");
          queryClient.invalidateQueries({
            queryKey: trpc.teacher.getCourseAttachments.queryKey({ courseId }),
          });
        }}
        onUploadError={(error) => {
          toast.error("Échec du téléchargement", {
            description: error.message,
          });
        }}
        config={{ mode: "auto", appendOnPaste: true }}
        appearance={{
          container: {
            border: "none",
            background: "transparent",
            borderRadius: "0.75rem",
          },
          uploadIcon: { color: "#14b8a6", width: "3rem", height: "3rem" },
          label: {
            color: "#0f766e",
            fontSize: "1.1rem",
            fontWeight: "600",
            marginTop: "1rem",
          },
          allowedContent: {
            color: "#64748b",
            fontSize: "0.875rem",
            marginTop: "0.5rem",
          },
          button: {
            background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
            color: "white",
            fontWeight: "600",
            padding: "0.75rem 2rem",
            borderRadius: "0.75rem",
            fontSize: "0.95rem",
            marginTop: "1.5rem",
            transition: "all 0.3s ease",
          },
        }}
        className="cursor-pointer"
      />
      <FileTypeInfo />
    </div>
  );
});
UploadZone.displayName = "UploadZone";

const FileTypeInfo = memo(() => (
  <>
    <div className="mt-6 grid grid-cols-2 gap-3">
      {[
        {
          icon: <FileText className="h-4 w-4 text-teal-500" />,
          text: "PDF, DOC, PPT",
        },
        {
          icon: <ImageIcon className="h-4 w-4 text-teal-500" />,
          text: "Images (JPG, PNG)",
        },
        {
          icon: <Music className="h-4 w-4 text-teal-500" />,
          text: "Son (MP3)",
        },
        {
          icon: <Archive className="h-4 w-4 text-teal-500" />,
          text: "ZIP, RAR",
        },
      ].map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"
        >
          {item.icon}
          <span>{item.text}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 text-xs text-gray-500 text-center">
      <p>Glissez-déposez vos fichiers ou cliquez pour parcourir</p>
    </div>
  </>
));
FileTypeInfo.displayName = "FileTypeInfo";

const AttachmentList = memo((props: any) => {
  const { attachments } = props;

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune pièce jointe pour le moment
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">
        Pièces jointes ({attachments.length})
      </h3>
      <div className="space-y-2">
        {attachments.map((attachment: Attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            {...props}
          />
        ))}
      </div>
    </div>
  );
});
AttachmentList.displayName = "AttachmentList";

// Composant principal optimisé
export const CourseDetailsForm = ({ course }: { course: Course }) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // État local minimal
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [objectivesText, setObjectivesText] = useState("");
  const [audienceText, setAudienceText] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [showTips, setShowTips] = useState(true);
  const [activeTab, setActiveTab] = useState("basics");
  const [isUploading, setIsUploading] = useState(false);

  // Formulaires
  const basicsForm = useForm<BasicsInput>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level,
      language: course.language,
    },
  });

  const categoryForm = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryId: course.categories?.[0]?.id ?? "",
    },
    mode: "onChange",
  });

  // Queries
  const { data: allCategories = [] } = useSuspenseQuery(
    trpc.teacher.getAllCategories.queryOptions()
  );

  // Valeurs dérivées avec useMemo
  const selectedCategoryId = categoryForm.watch("categoryId");
  const selectedCategory = useMemo(
    () => allCategories.find((cat: any) => cat.id === selectedCategoryId),
    [allCategories, selectedCategoryId]
  );

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return allCategories;
    const term = searchTerm.toLowerCase();
    return allCategories.filter(
      (cat: any) =>
        cat.name.toLowerCase().includes(term) ||
        cat.slug.toLowerCase().includes(term) ||
        (cat.group && cat.group.toLowerCase().includes(term))
    );
  }, [allCategories, searchTerm]);

  const groupedCategories = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredCategories.forEach((cat: any) => {
      const group = cat.group || "Autres";
      if (!groups[group]) groups[group] = [];
      groups[group].push(cat);
    });

    const groupOrder = [
      "Langues",
      "Business",
      "Technologie",
      "Éducation",
      "Santé",
      "Culture",
      "Arts",
      "Services",
      "Bâtiment",
      "Environnement",
      "Développement Personnel",
    ];

    const sortedGroups: Record<string, any[]> = {};
    groupOrder.forEach((group) => {
      if (groups[group]) sortedGroups[group] = groups[group];
    });

    Object.keys(groups).forEach((group) => {
      if (!sortedGroups[group]) sortedGroups[group] = groups[group];
    });

    return sortedGroups;
  }, [filteredCategories]);

  // Mutations avec useCallback
  const updateThumbnail = useMutation(
    trpc.teacher.updateThumbnail.mutationOptions({
      onSuccess: () => {
        toast.success("Image du cours mise à jour avec succès!");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
        setIsUploading(false);
      },
      onError: (err: any) => {
        toast.error(err.message || "Erreur lors du téléchargement");
        setIsUploading(false);
      },
    })
  );

  const addObjective = useMutation(
    trpc.teacher.addCourseObjective.mutationOptions({
      onSuccess: () => {
        toast.success("Objectif ajouté avec succès!");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
        setObjectivesText("");
      },
      onError: (err: any) => toast.error(err.message || "Erreur"),
    })
  );

  const deleteObjective = useMutation(
    trpc.teacher.deleteCourseObjective.mutationOptions({
      onSuccess: () => {
        toast.success("Objectif supprimé");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
      },
      onError: (err: any) => toast.error(err.message || "Erreur"),
    })
  );

  const addAudience = useMutation(
    trpc.teacher.addCourseAudience.mutationOptions({
      onSuccess: () => {
        toast.success("Public cible ajouté!");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
        setAudienceText("");
      },
      onError: (err: any) => toast.error(err.message || "Erreur"),
    })
  );

  const deleteAudience = useMutation(
    trpc.teacher.deleteCourseAudience.mutationOptions({
      onSuccess: () => {
        toast.success("Public cible supprimé");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
      },
      onError: (err: any) => toast.error(err.message || "Erreur"),
    })
  );

  const updateSettings = useMutation(
    trpc.teacher.updateCourseSettings.mutationOptions({
      onSuccess: () => {
        toast.success("Détails du cours mis à jour!");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
        setSearchOpen(false);
        setSearchTerm("");
      },
      onError: (err: any) => {
        console.error(err);
        toast.error("Détails non mis à jour");
      },
    })
  );

  const updateBasics = useMutation(
    trpc.teacher.updateCourseBasics.mutationOptions({
      onSuccess: () => {
        toast.success("Mis à jour avec succès");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
      },
      onError: (err: any) => toast.error(err.message || "Erreur"),
    })
  );

  const addRequirement = useMutation(
    trpc.teacher.addCourseRequirement.mutationOptions({
      onSuccess: () => {
        toast.success("Compétence ajoutée!");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
        setNewRequirement("");
      },
      onError: (err: any) => toast.error(err.message || "Erreur"),
    })
  );

  const deleteRequirement = useMutation(
    trpc.teacher.deleteCourseRequirement.mutationOptions({
      onSuccess: () => {
        toast.success("Compétence supprimée");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
      },
      onError: (err: any) => toast.error(err.message || "Erreur"),
    })
  );

  const publishCourse = useMutation(
    trpc.teacher.publishCourse.mutationOptions({
      onSuccess: () => {
        toast.success("🎉 Cours publié avec succès!");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getMyCourses.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.course.getAllPublishedCourses.queryKey(),
        });
      },
      onError: (err: any) => {
        if (err.data?.code === "PRECONDITION_FAILED" && err.cause) {
          toast.error("Impossible de publier le cours", {
            description: (
              <div className="mt-2">
                <ul className="list-disc pl-4 space-y-1">
                  {err.cause.map((error: string, index: number) => (
                    <li key={index} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            ),
            duration: 10000,
          });
        } else {
          toast.error(err.message || "Erreur lors de la publication");
        }
      },
    })
  );
  const unpublishCourse = useMutation(
    trpc.teacher.unpublishCourse.mutationOptions({
      onSuccess: (data) => {
        toast.success("📝 Cours dépublié avec succès!", {
          style: {
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "white",
            border: "none",
            fontSize: "16px",
          },
          description: "Votre cours n'est plus visible par les étudiants.",
        });
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getCourseDetails.queryKey({ id: course.id }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getMyCourses.queryKey(),
        });
      },
      onError: (err: any) => {
        toast.error(err.message || "Erreur lors de la dépublication");
      },
    })
  );
  // Ajoutez un handler pour le bouton de dépublication
  const handleUnpublish = useCallback(() => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir dépublier ce cours ?\n\nLes étudiants ne pourront plus y accéder."
      )
    ) {
      return;
    }

    unpublishCourse.mutate({ courseId: course.id });
  }, [unpublishCourse, course.id]);

  // Handlers avec useCallback
  const handleSubmitBasics = useCallback(
    async (values: BasicsInput) => {
      try {
        await updateBasics.mutateAsync({
          id: course.id,
          title: values.title,
          description: values.description,
          price: values.price,
        });

        const updateSettingsData: any = {
          id: course.id,
          level: values.level,
          language: values.language,
        };

        const categoryId = categoryForm.getValues().categoryId;
        if (categoryId?.trim()) {
          updateSettingsData.categoryId = categoryId;
        }

        await updateSettings.mutateAsync(updateSettingsData);
      } catch (error) {
        // Error is already handled by the mutation
      }
    },
    [course.id, updateBasics, updateSettings, categoryForm]
  );

  const handleSubmitCategory = useCallback(
    async (values: CategoryInput) => {
      try {
        const basicsValues = basicsForm.getValues();
        await updateSettings.mutateAsync({
          id: course.id,
          level: basicsValues.level,
          language: basicsValues.language,
          categoryId: values.categoryId,
        });
        categoryForm.reset({ categoryId: values.categoryId });
      } catch (error) {
        // Error is already handled by the mutation
      }
    },
    [course.id, basicsForm, updateSettings, categoryForm]
  );

  const selectCategory = useCallback(
    (categoryId: string) => {
      categoryForm.setValue("categoryId", categoryId, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setSearchOpen(false);
      setSearchTerm("");
    },
    [categoryForm]
  );

  const clearCategory = useCallback(() => {
    categoryForm.setValue("categoryId", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [categoryForm]);

  const handleThumbnailUpload = useCallback(
    (url: string, key: string) => {
      setIsUploading(true);
      updateThumbnail.mutate({
        courseId: course.id,
        thumbnailUrl: url,
        thumbnailKey: key,
      });
    },
    [course.id, updateThumbnail]
  );

  const canPublishCourse = useMemo(() => {
    const basicsValues = basicsForm.watch();
    const categoryValue = categoryForm.watch("categoryId");

    const hasBasics =
      basicsValues.title?.length >= 5 &&
      basicsValues.description?.length >= 20 &&
      basicsValues.price > 0 &&
      basicsValues.level &&
      basicsValues.language;

    const hasCategory = !!categoryValue;
    const hasThumbnail = !!course.thumbnailUrl;
    const hasRequirements = course.requirements.length > 0;
    const hasObjectives = course.objectives.length > 0;
    const hasAudiences = course.audiences.length > 0;

    return (
      hasBasics &&
      hasCategory &&
      hasThumbnail &&
      hasRequirements &&
      hasObjectives &&
      hasAudiences
    );
  }, [basicsForm, categoryForm, course]);

  const completionPercentage = useMemo(() => {
    const basicsValues = basicsForm.watch();
    const categoryValue = categoryForm.watch("categoryId");

    const checks = [
      basicsValues.title?.length >= 5,
      basicsValues.description?.length >= 20,
      basicsValues.price > 0,
      !!basicsValues.level,
      !!basicsValues.language,
      !!categoryValue,
      course.requirements.length > 0,
      !!course.thumbnailUrl,
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [
    basicsForm,
    categoryForm,
    course.requirements.length,
    course.thumbnailUrl,
  ]);

  // Mettre à jour les valeurs initiales
  useEffect(() => {
    basicsForm.reset({
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level,
      language: course.language,
    });

    categoryForm.reset({
      categoryId: course.categories?.[0]?.id ?? "",
    });
  }, [course, basicsForm, categoryForm]);

  const handlePublish = useCallback(() => {
    if (course.status === "published") {
      toast.info("Ce cours est déjà publié", {
        description:
          "Vous pouvez le modifier, mais il restera visible pour les étudiants.",
      });
    } else if (!canPublishCourse) {
      toast.error("Cours incomplet", {
        description: "Complétez toutes les sections avant de publier.",
      });
    } else {
      publishCourse.mutate({ courseId: course.id });
    }
  }, [course.status, canPublishCourse, publishCourse, course.id]);

  // Valeurs de formulaire pour éviter les re-renders
  const basicsIsDirty = basicsForm.formState.isDirty;
  const basicsIsValid = basicsForm.formState.isValid;
  const categoryIsDirty = categoryForm.formState.isDirty;
  const categoryIsValid = categoryForm.formState.isValid;

  return (
    <div className="bg-gray-50 p-4 md:p-6">
      <div className="mx-auto">
        <Header
          course={course}
          showTips={showTips}
          setShowTips={setShowTips}
          canPublishCourse={canPublishCourse}
          publishCourse={publishCourse}
          unpublishCourse={unpublishCourse}
          handlePublish={handlePublish}
          handleUnpublish={handleUnpublish}
        />

        <ProgressSection completionPercentage={completionPercentage} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <TipsPanel showTips={showTips} activeTab={activeTab} />

          <div className={showTips ? "lg:col-span-3" : "lg:col-span-4"}>
            <MainTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              course={course}
              basicsForm={basicsForm}
              basicsIsDirty={basicsIsDirty}
              basicsIsValid={basicsIsValid}
              handleSubmitBasics={handleSubmitBasics}
              updateBasics={updateBasics}
              updateSettings={updateSettings}
              isUploading={isUploading}
              handleThumbnailUpload={handleThumbnailUpload}
              updateThumbnail={updateThumbnail}
              selectedCategory={selectedCategory}
              categoryForm={categoryForm}
              searchOpen={searchOpen}
              setSearchOpen={setSearchOpen}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              groupedCategories={groupedCategories}
              selectCategory={selectCategory}
              clearCategory={clearCategory}
              handleSubmitCategory={handleSubmitCategory}
              categoryIsDirty={categoryIsDirty}
              categoryIsValid={categoryIsValid}
              objectivesText={objectivesText}
              setObjectivesText={setObjectivesText}
              addObjective={addObjective}
              deleteObjective={deleteObjective}
              audienceText={audienceText}
              setAudienceText={setAudienceText}
              addAudience={addAudience}
              deleteAudience={deleteAudience}
              newRequirement={newRequirement}
              setNewRequirement={setNewRequirement}
              addRequirement={addRequirement}
              deleteRequirement={deleteRequirement}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Composants décomposés pour éviter les re-renders
const Header = memo(
  ({
    course,
    showTips,
    setShowTips,
    canPublishCourse,
    publishCourse,
    unpublishCourse,
    handlePublish,
    handleUnpublish,
  }: any) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-[#feba45] to-[#ff9e1f] rounded-xl blur-lg opacity-50" />
              <div className="relative w-14 h-14 bg-linear-to-r from-[#feba45] to-[#ff9e1f] rounded-xl flex items-center justify-center shadow-xl">
                <Crown className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-[#feba45] to-[#ff9e1f] bg-clip-text text-transparent">
                Studio de Création
              </h1>
              <p className="text-gray-600 mt-2">
                Transformez vos connaissances en cours exceptionnel
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <StatusBadge status={course.status} />
          <PublishButton
            status={course.status}
            canPublishCourse={canPublishCourse}
            publishCourse={publishCourse}
            unpublishCourse={unpublishCourse}
            handlePublish={handlePublish}
            handleUnpublish={handleUnpublish}
            course={course}
          />
          <TipsToggle showTips={showTips} setShowTips={setShowTips} />
          <LessonsButton courseId={course.id} />
        </div>
      </div>
    </motion.div>
  )
);
Header.displayName = "Header";

const StatusBadge = memo(({ status }: { status: string }) => (
  <Badge
    className={cn(
      "px-4 py-2 text-sm font-semibold",
      status === "published"
        ? "bg-green-100 text-green-800 border-green-200"
        : "bg-amber-100 text-amber-800 border-amber-200"
    )}
  >
    {status === "published" ? (
      <>
        <Globe className="w-3 h-3 mr-1" />
        Publié
      </>
    ) : (
      <>
        <Edit className="w-3 h-3 mr-1" />
        Brouillon
      </>
    )}
  </Badge>
));
StatusBadge.displayName = "StatusBadge";

const PublishButton = memo(
  ({
    status,
    canPublishCourse,
    publishCourse,
    unpublishCourse,
    handlePublish,
    handleUnpublish,
    course,
  }: any) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            {status === "published" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full px-8 py-6 text-lg font-bold shadow-2xl bg-green-500 hover:bg-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Publié
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Actions de publication</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleUnpublish}
                    disabled={unpublishCourse.isPending}
                    className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                  >
                    {unpublishCourse.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <EyeOff className="w-4 h-4 mr-2" />
                    )}
                    Dépublier le cours
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs text-gray-500">
                    Publié • Visible par les étudiants
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {status === "draft" && (
              <Button
                onClick={handlePublish}
                disabled={publishCourse.isPending || !canPublishCourse}
                className={cn(
                  "rounded-full px-8 py-6 text-lg font-bold shadow-2xl",
                  !canPublishCourse
                    ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                    : "bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                )}
              >
                {publishCourse.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    Publier le cours
                  </>
                )}
              </Button>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          {status === "published" ? (
            <div className="space-y-2">
              <p className="font-semibold">Cours publié</p>
              <p className="text-sm text-gray-600">
                Votre cours est visible par les étudiants
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Globe className="w-3 h-3" />
                <span>Accessible au public</span>
              </div>
            </div>
          ) : !canPublishCourse ? (
            <div className="space-y-2">
              <p className="font-semibold">Prérequis manquants</p>
              <p className="text-sm text-gray-600">
                Complétez toutes les sections
              </p>
              <ValidationStatus course={course} />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold">Prêt à publier!</p>
              <p className="text-sm text-gray-600">
                Cliquez pour rendre votre cours visible
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span>Tous les prérequis sont remplis</span>
              </div>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
);
PublishButton.displayName = "PublishButton";

const TipsToggle = memo(({ showTips, setShowTips }: any) => (
  <Button
    variant="outline"
    className="rounded-full border-2"
    onClick={() => setShowTips(!showTips)}
  >
    {showTips ? (
      <Eye className="w-4 h-4 mr-2" />
    ) : (
      <HelpCircle className="w-4 h-4 mr-2" />
    )}
    {showTips ? "Masquer conseils" : "Afficher conseils"}
  </Button>
));
TipsToggle.displayName = "TipsToggle";

const LessonsButton = memo(({ courseId }: { courseId: string }) => (
  <Button
    asChild
    className="rounded-full bg-linear-to-r from-[#feba45] to-[#ff9e1f] hover:from-[#ff9e1f] hover:to-[#feba45] text-white shadow-lg hover:shadow-xl"
  >
    <Link href={`/teacher/courses/${courseId}/lessons`} prefetch>
      <Video className="w-4 h-4 mr-2" />
      Voir les lessons de ce cours
    </Link>
  </Button>
));
LessonsButton.displayName = "LessonsButton";

const ValidationStatus = memo(({ course }: { course: Course }) => {
  const missingItems = useMemo(() => {
    const items = [];

    if (course.title?.length < 5) items.push("Titre (5+ caractères)");
    if (course.description?.length < 20)
      items.push("Description (20+ caractères)");
    if (course.price <= 0) items.push("Prix défini");
    if (!course.level) items.push("Niveau");
    if (!course.language) items.push("Langue");
    if (course.categories.length === 0) items.push("Catégorie");
    if (!course.thumbnailUrl) items.push("Image du cours");
    if (course.requirements.length === 0) items.push("Compétences");
    if (course.objectives.length === 0) items.push("Objectifs");
    if (course.audiences.length === 0) items.push("Public cible");

    return items;
  }, [course]);

  if (missingItems.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-gray-700 mb-1">Manquant:</p>
      <ul className="text-xs text-gray-500 space-y-1 max-h-20 overflow-y-auto">
        {missingItems.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <X className="w-3 h-3 text-red-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
});
ValidationStatus.displayName = "ValidationStatus";

const ProgressSection = memo(
  ({ completionPercentage }: { completionPercentage: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-8"
    >
      <Card className="border-0 pt-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Rocket className="w-6 h-6 text-[#feba45]" />
                <h3 className="text-xl font-bold text-gray-900">
                  Progression vers la publication
                </h3>
              </div>
              <p className="text-gray-600">
                Plus vous complétez de sections, plus votre cours sera visible
                et attractif
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="relative inline-block">
                <div className="text-5xl font-bold bg-linear-to-r from-[#feba45] to-[#ff9e1f] bg-clip-text text-transparent">
                  {completionPercentage}%
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="w-5 h-5 text-[#feba45]" />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {completionPercentage < 50
                  ? "À améliorer"
                  : completionPercentage < 80
                  ? "Bien avancé"
                  : "Presque parfait!"}
              </div>
            </div>
          </div>

          <Progress
            value={completionPercentage}
            className="h-3 mt-6 bg-gray-200"
          />

          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Débutant</span>
            <span>Intermediaire</span>
            <span>Avancé</span>
            <span>Expert</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
);
ProgressSection.displayName = "ProgressSection";

const TipsPanel = memo(
  ({ showTips, activeTab }: { showTips: boolean; activeTab: string }) => (
    <AnimatePresence>
      {showTips && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="lg:col-span-1"
        >
          <Card className="border-0 pt-0 shadow-xl rounded-2xl sticky top-6 overflow-hidden bg-linear-to-br from-blue-50 to-cyan-50">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Guide du Créateur
                  </CardTitle>
                  <CardDescription>
                    Conseils pour optimiser votre cours
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#feba45]" />
                  Pourquoi c'est important ?
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Attire 3x plus d'étudiants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Augmente la satisfaction de 40%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Améliore les taux de complétion</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#feba45]" />
                  Conseils rapides
                </h4>
                <div className="space-y-2">
                  {activeTab === "basics" && (
                    <TipCard
                      icon={<BookOpen className="w-4 h-4" />}
                      title="Titre percutant"
                      description="Utilisez des mots-clés recherchés et soyez spécifique"
                    />
                  )}
                  {activeTab === "objectives" && (
                    <TipCard
                      icon={<Target className="w-4 h-4" />}
                      title="Objectifs SMART"
                      description="Spécifiques, Mesurables, Atteignables, Réalistes, Temporels"
                    />
                  )}
                  {activeTab === "audience" && (
                    <TipCard
                      icon={<Users className="w-4 h-4" />}
                      title="Cible précise"
                      description="Plus votre public est défini, mieux vous pouvez l'atteindre"
                    />
                  )}
                  {activeTab === "requirements" && (
                    <TipCard
                      icon={<GraduationCap className="w-4 h-4" />}
                      title="Compétences concrètes"
                      description="Ce que les étudiants pourront réellement faire après le cours"
                    />
                  )}
                  {activeTab === "thumbnail" && (
                    <TipCard
                      icon={<ImageIcon className="w-4 h-4" />}
                      title="Image percutante"
                      description="Une bonne image augmente les clics de 60%"
                    />
                  )}
                  {activeTab === "attachments" && (
                    <TipCard
                      icon={<FileText className="w-4 h-4" />}
                      title="Supports complémentaires"
                      description="Ajoutez des ressources pour enrichir votre cours"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
);
TipsPanel.displayName = "TipsPanel";

const MainTabs = memo((props: any) => {
  const {
    activeTab,
    setActiveTab,
    course,
    basicsForm,
    basicsIsDirty,
    basicsIsValid,
    handleSubmitBasics,
    updateBasics,
    updateSettings,
    isUploading,
    handleThumbnailUpload,
    updateThumbnail,
    selectedCategory,
    categoryForm,
    searchOpen,
    setSearchOpen,
    searchTerm,
    setSearchTerm,
    groupedCategories,
    selectCategory,
    clearCategory,
    handleSubmitCategory,
    categoryIsDirty,
    categoryIsValid,
    objectivesText,
    setObjectivesText,
    addObjective,
    deleteObjective,
    audienceText,
    setAudienceText,
    addAudience,
    deleteAudience,
    newRequirement,
    setNewRequirement,
    addRequirement,
    deleteRequirement,
  } = props;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="flex mt-5 md:mt-3 mb-25 md:mb-10 lg:mb-5 flex-wrap md:grid grid-cols-7 gap-2 bg-gray-50 p-1 rounded-2xl">
        {[
          { value: "basics", icon: BookOpen, label: "Informations" },
          { value: "thumbnail", icon: ImageIcon, label: "Image" },
          { value: "attachments", icon: FileText, label: "Supports" },
          { value: "category", icon: Star, label: "Catégorie" },
          { value: "objectives", icon: Target, label: "Objectifs" },
          { value: "audience", icon: Users, label: "Public" },
          { value: "requirements", icon: GraduationCap, label: "Compétences" },
        ].map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-xl data-[state=active]:bg-linear-to-r data-[state=active]:from-[#feba45] data-[state=active]:to-[#ff9e1f] data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="basics" className="space-y-6">
        <BasicsTab
          course={course}
          form={basicsForm}
          isDirty={basicsIsDirty}
          isValid={basicsIsValid}
          handleSubmitBasics={handleSubmitBasics}
          updateBasics={updateBasics}
          updateSettings={updateSettings}
        />
      </TabsContent>

      <TabsContent value="thumbnail">
        <ThumbnailTab
          course={course}
          isUploading={isUploading}
          onUpload={handleThumbnailUpload}
          updateThumbnail={updateThumbnail}
          selectedCategory={selectedCategory}
        />
      </TabsContent>

      <TabsContent value="attachments">
        <CourseAttachments courseId={course.id} />
      </TabsContent>

      <TabsContent value="category">
        <CategoryTab
          course={course}
          form={categoryForm}
          selectedCategory={selectedCategory}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          groupedCategories={groupedCategories}
          selectCategory={selectCategory}
          clearCategory={clearCategory}
          handleSubmitCategory={handleSubmitCategory}
          updateSettings={updateSettings}
          categoryIsDirty={categoryIsDirty}
          categoryIsValid={categoryIsValid}
        />
      </TabsContent>

      <TabsContent value="objectives">
        <ObjectivesTab
          course={course}
          objectivesText={objectivesText}
          setObjectivesText={setObjectivesText}
          addObjective={addObjective}
          deleteObjective={deleteObjective}
        />
      </TabsContent>

      <TabsContent value="audience">
        <AudienceTab
          course={course}
          audienceText={audienceText}
          setAudienceText={setAudienceText}
          addAudience={addAudience}
          deleteAudience={deleteAudience}
        />
      </TabsContent>

      <TabsContent value="requirements">
        <RequirementsTab
          course={course}
          newRequirement={newRequirement}
          setNewRequirement={setNewRequirement}
          addRequirement={addRequirement}
          deleteRequirement={deleteRequirement}
        />
      </TabsContent>
    </Tabs>
  );
});
MainTabs.displayName = "MainTabs";
// BasicsTab complet mémoïsé
const BasicsTab = memo(
  ({
    course,
    form,
    isDirty,
    isValid,
    handleSubmitBasics,
    updateBasics,
    updateSettings,
  }: any) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = useCallback(
      async (values: any) => {
        try {
          setIsSubmitting(true);
          await handleSubmitBasics(values);
        } catch (error) {
          // Error is already handled by the mutation
        } finally {
          setIsSubmitting(false);
        }
      },
      [handleSubmitBasics]
    );

    const titleValue = form.watch("title");
    const descriptionValue = form.watch("description");

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 pt-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-r pt-6 from-[#feba45]/10 to-[#ff9e1f]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-[#feba45] to-[#ff9e1f] rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Fondations du Cours
                  </CardTitle>
                  <CardDescription>
                    Les bases qui attirent vos premiers étudiants
                  </CardDescription>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-gray-400 hover:text-[#feba45] cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Un titre clair et une bonne description augmentent les
                    inscriptions de 60%
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Title Section */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-lg font-bold text-gray-900 flex items-center gap-3">
                          <BookMarked className="w-6 h-6 text-[#feba45]" />
                          Titre du cours
                          <span className="text-xs font-normal text-gray-500">
                            (Minimum 5 caractères)
                          </span>
                        </FormLabel>
                        <Badge
                          variant="outline"
                          className="border-[#feba45] text-[#feba45]"
                        >
                          {field.value?.length || 0}/5
                        </Badge>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            {...field}
                            className="h-14 text-md pl-12 pr-4 border-2 border-gray-300 focus:border-[#feba45] focus:ring-4 focus:ring-[#feba45]/20 rounded-xl transition-all duration-300 group-hover:border-[#feba45]/50"
                            placeholder="Ex: Développement Web Avancé avec React"
                          />
                          <BookMarked className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-[#feba45] transition-colors" />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                field.value?.length >= 5
                                  ? "bg-green-500 animate-pulse"
                                  : "bg-gray-300"
                              }`}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <TipBubble>
                        💡 Utilisez des mots-clés recherchés comme "Programmation", "Web", "Mobile", "Économie", "Élevage"
                        "Développement personnel", "Marketing Digital"
                      </TipBubble>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description Section */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-lg font-bold text-gray-900 flex items-center gap-3">
                          <Edit className="w-6 h-6 text-[#feba45]" />
                          Description complète
                          <span className="text-xs font-normal text-gray-500">
                            (Minimum 20 caractères)
                          </span>
                        </FormLabel>
                        <Badge
                          variant="outline"
                          className="border-[#feba45] text-[#feba45]"
                        >
                          {field.value?.length || 0}/20
                        </Badge>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Textarea
                            {...field}
                            rows={8}
                            className="text-md p-6 border-2 border-gray-300 focus:border-[#feba45] focus:ring-4 focus:ring-[#feba45]/20 rounded-xl transition-all duration-300 group-hover:border-[#feba45]/50 resize-none"
                            placeholder=""
                          />
                        </div>
                      </FormControl>
                      <TipBubble className="mt-3">
                        📝 Incluez : le problème que vous souhaitez résoudre + le contenu détaillé et répondez sur ce question que pourquoi les étudiants prend cet cours mais pas les autres ?
                      </TipBubble>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Section */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-[#feba45]" />
                        Investissement
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-[#feba45]" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Les cours gratuits attirent plus d'étudiants, les
                              cours payants génèrent du revenu
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <PriceOption
                              value={0}
                              label="Gratuit"
                              description="Parfait pour démarrer"
                              selected={field.value === 0}
                              onClick={() => field.onChange(0)}
                            />
                            <PriceOption
                              value={4900}
                              label="Ar 4 900"
                              description="Prix standard"
                              selected={field.value === 4900}
                              onClick={() => field.onChange(4900)}
                            />
                            <PriceOption
                              value={9900}
                              label="Ar 9 900"
                              description="Valeur premium"
                              selected={field.value === 9900}
                              onClick={() => field.onChange(9900)}
                            />
                          </div>
                          <div className="relative">
                            <Input
                              type="number"
                              min={0}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="h-14 text-lg pl-12 pr-4 border-2 border-gray-300 focus:border-[#feba45] focus:ring-4 focus:ring-[#feba45]/20 rounded-xl"
                              placeholder="Ou entrez un prix personnalisé..."
                            />
                            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-bold text-gray-700">
                              Ar {field.value.toLocaleString("fr-FR")}
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Level & Language Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-lg font-bold text-gray-900 flex items-center gap-3">
                          <TrendingUp className="w-6 h-6 text-[#feba45]" />
                          Niveau de difficulté
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-3">
                            <LevelOption
                              value="beginner"
                              label="Débutant"
                              icon="🌱"
                              selected={field.value === "beginner"}
                              onClick={() => field.onChange("beginner")}
                            />
                            <LevelOption
                              value="intermediate"
                              label="Intermédiaire"
                              icon="🚀"
                              selected={field.value === "intermediate"}
                              onClick={() => field.onChange("intermediate")}
                            />
                            <LevelOption
                              value="advanced"
                              label="Avancé"
                              icon="🏆"
                              selected={field.value === "advanced"}
                              onClick={() => field.onChange("advanced")}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-lg font-bold text-gray-900 flex items-center gap-3">
                          <Globe className="w-6 h-6 text-[#feba45]" />
                          Langue d'enseignement
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-3">
                            <LanguageOption
                              value="mg"
                              label="Malagasy"
                              flag="🇲🇬"
                              selected={field.value === "mg"}
                              onClick={() => field.onChange("mg")}
                            />
                            <LanguageOption
                              value="fr"
                              label="Français"
                              flag="🇫🇷"
                              selected={field.value === "fr"}
                              onClick={() => field.onChange("fr")}
                            />
                            <LanguageOption
                              value="en"
                              label="Anglais"
                              flag="🇬🇧"
                              selected={field.value === "en"}
                              onClick={() => field.onChange("en")}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-6"
                >
                  <Button
                    type="submit"
                    disabled={
                      !isDirty ||
                      !isValid ||
                      isSubmitting ||
                      updateBasics.isPending ||
                      updateSettings.isPending
                    }
                    className="w-full h-16 rounded-xl bg-linear-to-r from-[#feba45] via-[#ff9e1f] to-[#feba45] text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ||
                    updateBasics.isPending ||
                    updateSettings.isPending ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        <span className="text-lg">Mise à jour en cours...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-6 h-6 mr-3" />
                        <span className="text-lg">
                          {isDirty
                            ? "Enregistrer les modifications"
                            : "Aucune modification"}
                        </span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
BasicsTab.displayName = "BasicsTab";

// CategoryTab complet mémoïsé
const CategoryTab = memo(
  ({
    course,
    form,
    selectedCategory,
    searchOpen,
    setSearchOpen,
    searchTerm,
    setSearchTerm,
    groupedCategories,
    selectCategory,
    clearCategory,
    handleSubmitCategory,
    updateSettings,
    categoryIsDirty,
    categoryIsValid,
  }: any) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = useCallback(
      async (values: any) => {
        try {
          setIsSubmitting(true);
          await handleSubmitCategory(values);
        } catch (error) {
          // Error is already handled by the mutation
        } finally {
          setIsSubmitting(false);
        }
      },
      [handleSubmitCategory]
    );

    const categoryId = form.watch("categoryId");

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 pt-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-r pt-6 from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Catégorie du cours
                  </CardTitle>
                  <CardDescription>
                    Choisissez la catégorie qui correspond le mieux à votre
                    contenu
                  </CardDescription>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Une bonne catégorie augmente la visibilité de votre cours de
                    40%
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Tip Section */}
              <div className="bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Pourquoi la catégorie est importante
                    </h4>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">
                          Aide les étudiants à trouver votre cours
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">
                          Améliore le référencement (SEO)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">
                          Cible le bon public dès le départ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="space-y-6">
                        <div>
                          <FormLabel className="text-lg font-bold text-gray-900 flex items-center gap-3">
                            <Star className="w-6 h-6 text-blue-500" />
                            Catégorie principale
                            <span className="text-xs font-normal text-gray-500">
                              (Affecte directement la visibilité)
                            </span>
                          </FormLabel>
                          <p className="text-gray-600 mt-2">
                            Sélectionnez la catégorie qui décrit le mieux le
                            contenu de votre cours
                          </p>
                        </div>

                        <FormControl>
                          <div className="space-y-6">
                            {/* Current Selection */}
                            {field.value && selectedCategory ? (
                              <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                className="p-6 border-2 border-blue-500 rounded-2xl bg-linear-to-r from-blue-500/5 to-cyan-500/5"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                      <Check className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900 text-lg">
                                        {selectedCategory.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {selectedCategory.group || "Général"}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCategory}
                                    className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-600"
                                  >
                                    <X className="h-5 w-5" />
                                  </Button>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="p-8 border-2 border-dashed border-gray-400 rounded-2xl text-center group hover:border-blue-500 transition-colors">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-500/10">
                                  <Search className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <p className="text-gray-500 text-lg">
                                  Aucune catégorie sélectionnée
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                  Choisissez une catégorie pour mieux cibler
                                  votre audience
                                </p>
                              </div>
                            )}

                            {/* Search Categories */}
                            <Popover
                              open={searchOpen}
                              onOpenChange={setSearchOpen}
                            >
                              <PopoverTrigger asChild>
                                <div>
                                  <Button
                                    type="button"
                                    className="w-full h-14 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-500/5 text-lg font-medium group"
                                  >
                                    <Search className="mr-3 h-5 w-5 group-hover:text-blue-600 transition-colors" />
                                    {field.value
                                      ? "Changer de catégorie"
                                      : "Explorer les catégories"}
                                    <ChevronRight className="ml-auto h-5 w-5 opacity-50" />
                                  </Button>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-full p-0 rounded-2xl shadow-2xl"
                                align="start"
                              >
                                <Command className="rounded-2xl border-2">
                                  <div className="flex items-center border-b px-4 py-3">
                                    <Search className="mr-3 h-5 w-5 text-gray-400" />
                                    <CommandInput
                                      placeholder="Rechercher une catégorie..."
                                      value={searchTerm}
                                      onValueChange={setSearchTerm}
                                      className="border-none text-lg focus-visible:ring-0 h-12"
                                    />
                                  </div>
                                  <CommandList className="max-h-[400px] overflow-y-auto">
                                    <CommandEmpty className="py-8 text-center">
                                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Search className="w-6 h-6 text-gray-400" />
                                      </div>
                                      <p className="text-gray-500">
                                        Aucune catégorie trouvée
                                      </p>
                                      <p className="text-sm text-gray-400 mt-1">
                                        Essayez d'autres mots-clés
                                      </p>
                                    </CommandEmpty>
                                    {Object.entries(groupedCategories).map(
                                      ([groupName, categories]) => (
                                        <CommandGroup
                                          key={groupName}
                                          heading={
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                                              <span className="font-bold text-gray-900">
                                                {groupName}
                                              </span>
                                              <Badge className="ml-2">
                                                {(categories as any[]).length}
                                              </Badge>
                                            </div>
                                          }
                                          className="border-t py-2"
                                        >
                                          {(categories as any[]).map(
                                            (cat: any) => (
                                              <CommandItem
                                                key={cat.id}
                                                onSelect={() =>
                                                  selectCategory(cat.id)
                                                }
                                                className="py-3 px-4 rounded-lg hover:bg-blue-500/5 cursor-pointer"
                                              >
                                                <div className="flex items-center justify-between w-full">
                                                  <div className="flex items-center gap-3">
                                                    <div
                                                      className={cn(
                                                        "h-6 w-6 border-2 rounded-lg flex items-center justify-center",
                                                        field.value === cat.id
                                                          ? "bg-blue-500 border-blue-500"
                                                          : "border-gray-300"
                                                      )}
                                                    >
                                                      {field.value ===
                                                        cat.id && (
                                                        <Check className="h-4 w-4 text-white" />
                                                      )}
                                                    </div>
                                                    <span className="font-medium">
                                                      {cat.name}
                                                    </span>
                                                  </div>
                                                  {cat.group && (
                                                    <Badge
                                                      variant="outline"
                                                      className="text-xs"
                                                    >
                                                      {cat.group}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </CommandItem>
                                            )
                                          )}
                                        </CommandGroup>
                                      )
                                    )}
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-6"
                  >
                    <Button
                      type="submit"
                      disabled={
                        !categoryIsDirty ||
                        !categoryIsValid ||
                        isSubmitting ||
                        updateSettings.isPending
                      }
                      className="w-full h-14 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting || updateSettings.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          <span className="text-lg">
                            Mise à jour en cours...
                          </span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          <span className="text-lg">
                            {categoryIsDirty && categoryIsValid
                              ? "Enregistrer la catégorie"
                              : "Aucune modification"}
                          </span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
CategoryTab.displayName = "CategoryTab";

// ThumbnailTab complet mémoïsé
const ThumbnailTab = memo(
  ({
    course,
    isUploading,
    onUpload,
    updateThumbnail,
    selectedCategory,
  }: any) => {
    const handleUploadComplete = useCallback(
      (res: any) => {
        if (res && res[0]) {
          onUpload(res[0].ufsUrl, res[0].key);
        }
      },
      [onUpload]
    );

    const handleUploadError = useCallback((error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 pt-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-r pt-6 from-indigo-500/10 to-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Image du cours (Thumbnail)
                  </CardTitle>
                  <CardDescription>
                    La première impression de votre cours - choisissez
                    judicieusement
                  </CardDescription>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-gray-400 hover:text-indigo-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Une image attrayante augmente les clics de 60%
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Tip Section */}
              <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Conseils pour une image parfaite
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm">
                          Haute résolution (1280x720)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm">Contrastes prononcés</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm">Sujet clair et visible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm">
                          Texte minimal et lisible
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Thumbnail Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Aperçu actuel
                  </h3>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-gray-200">
                    {course.thumbnailUrl ? (
                      <>
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent flex items-end p-6">
                          <div className="text-white">
                            <p className="font-bold text-lg">{course.title}</p>
                            <p className="text-sm opacity-90">
                              {selectedCategory?.name || "Catégorie"}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                        <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 font-medium">
                          Aucune image définie
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Ajoutez une image pour améliorer l'attrait
                        </p>
                      </div>
                    )}
                  </div>

                  {course.thumbnailUrl && (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          window.open(course.thumbnailUrl, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir en grand
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upload Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Télécharger une nouvelle image
                  </h3>
                  <div className="space-y-4">
                    <UploadDropzone
                      input={{ courseId: course.id }}
                      endpoint="thumbnailUploader"
                      onClientUploadComplete={handleUploadComplete}
                      onUploadError={handleUploadError}
                      onUploadBegin={() => {}}
                      config={{ mode: "auto" }}
                      appearance={{
                        container: {
                          border: "2px dashed #6366f1",
                          borderRadius: "1rem",
                          background:
                            "linear-gradient(to bottom right, #f5f3ff, #f0e7fe)",
                        },
                        uploadIcon: { color: "#6366f1" },
                        label: { color: "#6366f1", fontWeight: "600" },
                        allowedContent: { color: "#6b7280" },
                        button: {
                          background:
                            "linear-gradient(to right, #6366f1, #8b5cf6)",
                          color: "white",
                          fontWeight: "600",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "0.75rem",
                        },
                      }}
                      className="mt-4"
                    />

                    {isUploading && (
                      <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-indigo-900">
                            Téléchargement en cours...
                          </p>
                          <p className="text-xs text-indigo-600">
                            Veuillez ne pas fermer cette page
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
ThumbnailTab.displayName = "ThumbnailTab";

// ObjectivesTab complet mémoïsé
const ObjectivesTab = memo(
  ({
    course,
    objectivesText,
    setObjectivesText,
    addObjective,
    deleteObjective,
  }: any) => {
    const handleAddObjective = useCallback(() => {
      if (objectivesText.trim()) {
        addObjective.mutate({
          courseId: course.id,
          text: objectivesText.trim(),
        });
      }
    }, [objectivesText, addObjective, course.id]);

    const handleDeleteObjective = useCallback(
      (id: string) => {
        deleteObjective.mutate({ id });
      },
      [deleteObjective]
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 pt-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-r pt-6 from-purple-500/10 to-pink-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Objectifs d'apprentissage
                  </CardTitle>
                  <CardDescription>
                    Ce que vos étudiants sauront faire après le cours
                  </CardDescription>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-gray-400 hover:text-purple-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Des objectifs clairs augmentent l'engagement de 75%
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Tip Section */}
              <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Conseil : Structurez vos objectifs avec la méthode SMART
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm">Spécifique</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm">Mesurable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm">Atteignable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm">Réaliste</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Objectives */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Objectifs définis ({course.objectives.length})
                </h3>
                {course.objectives.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.objectives.map((obj: Objective, index: number) => (
                      <motion.div
                        key={obj.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-xl border border-purple-100 hover:border-purple-300 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-linear-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                              <div className="text-lg">{index + 1}</div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {obj.text}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteObjective(obj.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            disabled={deleteObjective.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-2xl">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun objectif défini</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Commencez par ajouter vos objectifs
                    </p>
                  </div>
                )}
              </div>

              {/* Add Objective Form */}
              <div className="space-y-4">
              <div>
              <h3 className="text-lg font-bold text-gray-900">
                  Ajouter un nouvel objectif
                </h3>
                <p className="text-xs text-muted-foreground">
                  Votre réponse doit juste réponse à cet question ! Après ce cours votre élève a le niveau à :
                </p>
              </div>
                <div className="relative group">
                  <Textarea
                    value={objectivesText}
                    onChange={(e) => setObjectivesText(e.target.value)}
                    placeholder=""
                    className="min-h-[120px] text-lg p-6 border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl transition-all duration-300 group-hover:border-purple-400 resize-none"
                  />
                  <div className="absolute bottom-4 right-4">
                    <Badge variant="outline" className="bg-white">
                      {objectivesText.length}/100
                    </Badge>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    onClick={handleAddObjective}
                    disabled={!objectivesText.trim() || addObjective.isPending}
                    className="w-full h-14 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg shadow-lg hover:shadow-xl"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    {addObjective.isPending
                      ? "Ajout en cours..."
                      : "Ajouter l'objectif"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
ObjectivesTab.displayName = "ObjectivesTab";

// AudienceTab complet mémoïsé
const AudienceTab = memo(
  ({
    course,
    audienceText,
    setAudienceText,
    addAudience,
    deleteAudience,
  }: any) => {
    const handleAddAudience = useCallback(() => {
      if (audienceText.trim()) {
        addAudience.mutate({
          courseId: course.id,
          text: audienceText.trim(),
        });
      }
    }, [audienceText, addAudience, course.id]);

    const handleDeleteAudience = useCallback(
      (id: string) => {
        deleteAudience.mutate({ id });
      },
      [deleteAudience]
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 pt-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-r pt-6 from-emerald-500/10 to-green-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Public cible
                  </CardTitle>
                  <CardDescription>
                    À qui s'adresse précisément votre cours ?
                  </CardDescription>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-gray-400 hover:text-emerald-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Un public bien défini permet un marketing plus efficace
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Tip Section */}
              <div className="bg-linear-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Exemples de public cible précis
                    </h4>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">
                          Développeurs débutants en JavaScript
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">
                          Étudiants en marketing digital
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">
                          Professionnels souhaitant apprendre Python
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Audiences */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Publics définis ({course.audiences.length})
                </h3>
                {course.audiences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.audiences.map((aud: Audience, index: number) => (
                      <motion.div
                        key={aud.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-linear-to-r from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {aud.text}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAudience(aud.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            disabled={deleteAudience.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-2xl">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun public cible défini</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Définissez qui devrait suivre ce cours
                    </p>
                  </div>
                )}
              </div>

              {/* Add Audience Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Définir un nouveau public cible
                </h3>
                <div className="relative group">
                  <Textarea
                    value={audienceText}
                    onChange={(e) => setAudienceText(e.target.value)}
                    placeholder="Exemple: Développeurs débutants qui ont des bases sur l'informatque, Tous le monde qui veulent apprendre"
                    className="min-h-[120px] text-md"
                  />
                  <div className="absolute bottom-4 right-4">
                    <Badge variant="outline" className="bg-white">
                      {audienceText.length}/120
                    </Badge>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    onClick={handleAddAudience}
                    disabled={!audienceText.trim() || addAudience.isPending}
                    className="w-full h-14 rounded-xl bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-lg shadow-lg hover:shadow-xl"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    {addAudience.isPending
                      ? "Ajout en cours..."
                      : "Ajouter le public cible"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
AudienceTab.displayName = "AudienceTab";

// RequirementsTab complet mémoïsé
const RequirementsTab = memo(
  ({
    course,
    newRequirement,
    setNewRequirement,
    addRequirement,
    deleteRequirement,
  }: any) => {
    const handleAddRequirement = useCallback(() => {
      if (newRequirement.trim()) {
        addRequirement.mutate({
          courseId: course.id,
          text: newRequirement.trim(),
        });
      }
    }, [newRequirement, addRequirement, course.id]);

    const handleDeleteRequirement = useCallback(
      (id: string) => {
        deleteRequirement.mutate({ id });
      },
      [deleteRequirement]
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 pt-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-r pt-6 from-amber-500/10 to-orange-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Compétences acquises
                  </CardTitle>
                  <CardDescription>
                    Ce que les étudiants sauront faire concrètement
                  </CardDescription>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-gray-400 hover:text-amber-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Listez des compétences concrètes et actionnables
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Tip Section */}
              <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Formulez des compétences actionnables
                    </h4>
                    <div className="space-y-3 mt-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <span className="text-sm">
                          Citer tous les compétences, ne soit pas timides
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <span className="text-sm">
                          Citer tous le compétence même les plus profond
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <span className="text-sm">
                          Soyez spécifique et mesurable
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <span className="text-sm">
                          Mettez en avant la valeur pour l'étudiant
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Compétences définis ({course.requirements.length})
                </h3>
                {course.requirements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.requirements.map(
                      (req: Requirement, index: number) => (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white p-4 rounded-xl border border-amber-100 hover:border-amber-300 transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-linear-to-r from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {req.text}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRequirement(req.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              disabled={deleteRequirement.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-2xl">
                    <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune compétence définie</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Ajoutez les compétences que les étudiants acquerront
                    </p>
                  </div>
                )}
              </div>

              {/* Add Requirement Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Ajouter une nouvelle compétence
                </h3>
                <p className="text-xs text-muted-foreground">
                  Votre réponse doit juste réponse à cette question ! <span className="font-bold">
                  Quelles sont les compétences que votre élève peut acquérir après cet cours ?
                  </span>
                </p>
                <div className="relative group">
                  <div className="flex items-center gap-3">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder=""
                      className="h-14 text-md pl-12 pr-4 border-2 border-gray-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 rounded-xl transition-all duration-300 group-hover:border-amber-400"
                    />
                    <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-amber-500" />
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    onClick={handleAddRequirement}
                    disabled={
                      !newRequirement.trim() || addRequirement.isPending
                    }
                    className="w-full h-14 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg shadow-lg hover:shadow-xl"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    {addRequirement.isPending
                      ? "Ajout en cours..."
                      : "Ajouter la compétence"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
RequirementsTab.displayName = "RequirementsTab";

// Composants helper mémoïsés
const TipCard = memo(
  ({
    icon,
    title,
    description,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#feba45] transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-100">
          <div className="text-blue-600">{icon}</div>
        </div>
        <div>
          <h5 className="font-semibold text-gray-900">{title}</h5>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
);
TipCard.displayName = "TipCard";

const TipBubble = memo(
  ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <Info className="w-3 h-3 text-blue-600" />
        </div>
        <p className="text-sm text-gray-700">{children}</p>
      </div>
    </div>
  )
);
TipBubble.displayName = "TipBubble";

const PriceOption = memo(
  ({
    value,
    label,
    description,
    selected,
    onClick,
  }: {
    value: number;
    label: string;
    description: string;
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all ${
        selected
          ? "border-[#feba45] bg-linear-to-r from-[#feba45]/10 to-[#ff9e1f]/10"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="text-center">
        <div
          className={`text-2xl font-bold ${
            selected ? "text-[#feba45]" : "text-gray-700"
          }`}
        >
          {label}
        </div>
        <div className="text-sm text-gray-600 mt-1">{description}</div>
        {selected && (
          <div className="mt-2">
            <CheckCircle className="w-5 h-5 text-[#feba45] mx-auto" />
          </div>
        )}
      </div>
    </button>
  )
);
PriceOption.displayName = "PriceOption";

const LevelOption = memo(
  ({
    value,
    label,
    icon,
    selected,
    onClick,
  }: {
    value: string;
    label: string;
    icon: string;
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all ${
        selected
          ? "border-[#feba45] bg-linear-to-r from-[#feba45]/10 to-[#ff9e1f]/10"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="text-center space-y-2">
        <div className="text-2xl">{icon}</div>
        <div
          className={`font-semibold ${
            selected ? "text-[#feba45]" : "text-gray-700"
          }`}
        >
          {label}
        </div>
        {selected && (
          <div className="w-3 h-3 rounded-full bg-[#feba45] mx-auto" />
        )}
      </div>
    </button>
  )
);
LevelOption.displayName = "LevelOption";

const LanguageOption = memo(
  ({
    value,
    label,
    flag,
    selected,
    onClick,
  }: {
    value: string;
    label: string;
    flag: string;
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all ${
        selected
          ? "border-[#feba45] bg-linear-to-r from-[#feba45]/10 to-[#ff9e1f]/10"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="text-center space-y-2">
        <div className="text-2xl">{flag}</div>
        <div
          className={`font-semibold ${
            selected ? "text-[#feba45]" : "text-gray-700"
          }`}
        >
          {label}
        </div>
        {selected && (
          <div className="w-3 h-3 rounded-full bg-[#feba45] mx-auto" />
        )}
      </div>
    </button>
  )
);
LanguageOption.displayName = "LanguageOption";

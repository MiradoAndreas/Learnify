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
import { RichTextEditor } from "../../lessons/ui/components/advanced-rich-text-editor";

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
  <Card className="border">
    <CardHeader className="pt-6">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-12 w-full bg-muted rounded-lg animate-pulse" />
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
      return <File className="h-5 w-5 text-muted-foreground" />;
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
      <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors group">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <FileIcon type={attachment.type} />
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
        <div className="font-medium hover:text-primary transition-colors">
          {attachment.name}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>{formatFileSize(attachment.size)}</span>
          <span>•</span>
          <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
            {attachment.type.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <AttachmentActionButton
          icon={<Eye className="h-4 w-4" />}
          onClick={() => window.open(attachment.attachmentUrl, "_blank")}
          title="Voir le fichier"
        />
        <AttachmentActionButton
          icon={<Edit className="h-4 w-4" />}
          onClick={onEdit}
          title="Renommer"
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
          disabled={deletePending}
        />
      </div>
    </>
  )
);
AttachmentView.displayName = "AttachmentView";

const AttachmentActionButton = memo(
  ({ icon, onClick, title, disabled }: any) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
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
    <div className="border-2 border-dashed rounded-lg p-8 bg-muted/50 transition-colors hover:border-primary">
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
          uploadIcon: { color: "var(--primary)", width: "3rem", height: "3rem" },
          label: {
            color: "var(--primary)",
            fontSize: "1.1rem",
            fontWeight: "600",
            marginTop: "1rem",
          },
          allowedContent: {
            color: "var(--muted-foreground)",
            fontSize: "0.875rem",
            marginTop: "0.5rem",
          },
          button: {
            background: "var(--primary)",
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
          icon: <FileText className="h-4 w-4 text-muted-foreground" />,
          text: "PDF, DOC, PPT",
        },
        {
          icon: <ImageIcon className="h-4 w-4 text-muted-foreground" />,
          text: "Images (JPG, PNG)",
        },
        {
          icon: <Music className="h-4 w-4 text-muted-foreground" />,
          text: "Son (MP3)",
        },
        {
          icon: <Archive className="h-4 w-4 text-muted-foreground" />,
          text: "ZIP, RAR",
        },
      ].map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg"
        >
          {item.icon}
          <span>{item.text}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 text-xs text-muted-foreground text-center">
      <p>Glissez-déposez vos fichiers ou cliquez pour parcourir</p>
    </div>
  </>
));
FileTypeInfo.displayName = "FileTypeInfo";

const AttachmentList = memo((props: any) => {
  const { attachments } = props;

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
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
    <div className="p-4 md:p-6">
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

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Studio de Création
              </h1>
              <p className="text-muted-foreground mt-2">
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
                  <Button className="rounded-full px-8 py-6 text-lg font-bold bg-green-500 hover:bg-green-600 text-white">
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
                  <DropdownMenuItem className="text-xs text-muted-foreground">
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
                  "rounded-full  text-md font-bold",
                  !canPublishCourse
                    ? "hover:bg-muted cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90"
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
              <p className="text-sm text-muted-foreground">
                Votre cours est visible par les étudiants
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="w-3 h-3" />
                <span>Accessible au public</span>
              </div>
            </div>
          ) : !canPublishCourse ? (
            <div className="space-y-2">
              <p className="font-semibold">Prérequis manquants</p>
              <p className="text-sm text-muted-foreground">
                Complétez toutes les sections
              </p>
              <ValidationStatus course={course} />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold">Prêt à publier!</p>
              <p className="text-sm text-muted-foreground">
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
    className="rounded-full"
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
  <Button asChild className="rounded-full">
    <Link href={`/teacher/courses/${courseId}/lessons`} >
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
      <p className="text-xs font-medium text-foreground mb-1">Manquant:</p>
      <ul className="text-xs text-muted-foreground space-y-1 max-h-20 overflow-y-auto">
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
      <Card className="border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">

                <h3 className="text-xl font-bold text-foreground">
                  Progression vers la publication
                </h3>
              </div>
              <p className="text-muted-foreground">
                Plus vous complétez de sections, plus votre cours sera visible
                et attractif
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="relative inline-block">
                <div className="text-5xl font-bold text-primary">
                  {completionPercentage}%
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
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
            className="h-3 mt-6"
          />

          <div className="flex justify-between text-xs text-muted-foreground mt-2">
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
          <Card className="border sticky top-6">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
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
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Pourquoi c'est important ?
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
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
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
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
      <TabsList className="flex flex-wrap md:grid grid-cols-7 gap-2 p-1 rounded-lg">
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
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
        <Card className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Fondations du Cours
                  </CardTitle>
                  <CardDescription>
                    Les bases qui attirent vos premiers étudiants
                  </CardDescription>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" />
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
                        <FormLabel className="text-lg font-bold text-foreground flex items-center gap-3">
                          <BookMarked className="w-6 h-6 text-primary" />
                          Titre du cours
                          <span className="text-xs font-normal text-muted-foreground">
                            (Minimum 5 caractères)
                          </span>
                        </FormLabel>
                        <Badge variant="outline">
                          {field.value?.length || 0}/5
                        </Badge>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            {...field}
                            className="h-14 text-md pl-12 pr-4 border-2 focus:border-primary rounded-lg"
                            placeholder="Ex: Développement Web Avancé avec React"
                          />
                          <BookMarked className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                      </FormControl>
                      <TipBubble>
                        💡 Utilisez des mots-clés recherchés
                      </TipBubble>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => {
                    const stripHtml = (html: string) =>
                      html.replace(/<[^>]*>/g, "");

                    const plainLength = stripHtml(field.value || "").length;

                    return (
                      <FormItem className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-lg font-bold text-foreground flex items-center gap-3">
                            <Edit className="w-6 h-6 text-primary" />
                            Description complète
                            <span className="text-xs font-normal text-muted-foreground">
                              (Minimum 20 caractères)
                            </span>
                          </FormLabel>

                          <Badge variant="outline">
                            {plainLength}/20
                          </Badge>
                        </div>

                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>

                        <TipBubble className="mt-3">
                          📝 Incluez : le problème que vous souhaitez résoudre
                        </TipBubble>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Price Section */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-bold text-foreground flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-primary" />
                        Investissement
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Les cours gratuits attirent plus d'étudiants
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
                              className="h-14 text-lg pl-12 pr-4 border-2 rounded-lg"
                              placeholder="Ou entrez un prix personnalisé..."
                            />
                            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-bold">
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
                        <FormLabel className="text-lg font-bold text-foreground flex items-center gap-3">
                          <TrendingUp className="w-6 h-6 text-primary" />
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
                        <FormLabel className="text-lg font-bold text-foreground flex items-center gap-3">
                          <Globe className="w-6 h-6 text-primary" />
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
                    className="w-full h-16 rounded-lg bg-primary text-white font-bold text-lg"
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
        <Card className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
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
                  <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Une bonne catégorie augmente la visibilité de votre cours
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Tip Section */}
              <div className="bg-muted rounded-lg p-6 border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      Pourquoi la catégorie est importante
                    </h4>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          Aide les étudiants à trouver votre cours
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          Améliore le référencement (SEO)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
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
                          <FormLabel className="text-lg font-bold text-foreground flex items-center gap-3">
                            <Star className="w-6 h-6 text-primary" />
                            Catégorie principale
                            <span className="text-xs font-normal text-muted-foreground">
                              (Affecte directement la visibilité)
                            </span>
                          </FormLabel>
                          <p className="text-muted-foreground mt-2">
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
                                className="p-6 border-2 border-primary rounded-lg bg-primary/5"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                                      <Check className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-foreground text-lg">
                                        {selectedCategory.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedCategory.group || "Général"}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCategory}
                                    className="h-10 w-10 rounded-full"
                                  >
                                    <X className="h-5 w-5" />
                                  </Button>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="p-8 border-2 border-dashed rounded-lg text-center group hover:border-primary transition-colors">
                                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                                  <Search className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground text-lg">
                                  Aucune catégorie sélectionnée
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
                                    className="w-full h-14 rounded-lg border text-lg font-medium"
                                  >
                                    <Search className="mr-3 h-5 w-5" />
                                    {field.value
                                      ? "Changer de catégorie"
                                      : "Explorer les catégories"}
                                    <ChevronRight className="ml-auto h-5 w-5 opacity-50" />
                                  </Button>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-full p-0 rounded-lg"
                                align="start"
                              >
                                <Command className="rounded-lg border">
                                  <div className="flex items-center border-b px-4 py-3">
                                    <Search className="mr-3 h-5 w-5 text-muted-foreground" />
                                    <CommandInput
                                      placeholder="Rechercher une catégorie..."
                                      value={searchTerm}
                                      onValueChange={setSearchTerm}
                                      className="border-none text-lg focus-visible:ring-0 h-12"
                                    />
                                  </div>
                                  <CommandList className="max-h-[400px] overflow-y-auto">
                                    <CommandEmpty className="py-8 text-center">
                                      <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                                        <Search className="w-6 h-6 text-muted-foreground" />
                                      </div>
                                      <p className="text-muted-foreground">
                                        Aucune catégorie trouvée
                                      </p>
                                    </CommandEmpty>
                                    {Object.entries(groupedCategories).map(
                                      ([groupName, categories]) => (
                                        <CommandGroup
                                          key={groupName}
                                          heading={
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-primary" />
                                              <span className="font-bold text-foreground">
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
                                                className="py-3 px-4 rounded-lg hover:bg-muted cursor-pointer"
                                              >
                                                <div className="flex items-center justify-between w-full">
                                                  <div className="flex items-center gap-3">
                                                    <div
                                                      className={cn(
                                                        "h-6 w-6 border-2 rounded-lg flex items-center justify-center",
                                                        field.value === cat.id
                                                          ? "bg-primary border-primary"
                                                          : "border-muted-foreground/30"
                                                      )}
                                                    >
                                                      {field.value ===
                                                        cat.id && (
                                                          <Check className="h-4 w-4 text-primary-foreground" />
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
                      className="w-full h-14 rounded-lg bg-primary text-white font-bold text-lg"
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
        <Card className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
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
                  <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Une image attrayante augmente les clics
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Tip Section */}
              <div className="bg-muted rounded-lg p-6 border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      Conseils pour une image parfaite
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          Haute résolution (1280x720)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">Contrastes prononcés</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">Sujet clair et visible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
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
                  <h3 className="text-lg font-bold text-foreground">
                    Aperçu actuel
                  </h3>
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    {course.thumbnailUrl ? (
                      <>
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                          <div className="text-white">
                            <p className="font-bold text-lg">{course.title}</p>
                            <p className="text-sm opacity-90">
                              {selectedCategory?.name || "Catégorie"}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                        <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-medium">
                          Aucune image définie
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
                  <h3 className="text-lg font-bold text-foreground">
                    Télécharger une nouvelle image
                  </h3>
                  <div className="space-y-4">
                    <UploadDropzone
                      input={{ courseId: course.id }}
                      endpoint="thumbnailUploader"
                      onClientUploadComplete={handleUploadComplete}
                      onUploadError={handleUploadError}
                      onUploadBegin={() => { }}
                      config={{ mode: "auto" }}
                      appearance={{
                        container: {
                          border: "2px dashed var(--border)",
                          borderRadius: "0.75rem",
                          background: "var(--muted)",
                        },
                        uploadIcon: { color: "var(--primary)" },
                        label: { color: "var(--primary)", fontWeight: "600" },
                        allowedContent: { color: "var(--muted-foreground)" },
                        button: {
                          background: "var(--primary)",
                          color: "white",
                          fontWeight: "600",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "0.75rem",
                        },
                      }}
                      className="mt-4"
                    />

                    {isUploading && (
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Téléchargement en cours...
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
        <Card className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Objectifs d'apprentissage
                  </CardTitle>
                  <CardDescription>
                    Ce que vos étudiants sauront faire après le cours
                  </CardDescription>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Des objectifs clairs augmentent l'engagement
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Tip Section */}
              <div className="bg-muted rounded-lg p-6 border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      Conseil : Structurez vos objectifs avec la méthode SMART
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm">Spécifique</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm">Mesurable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm">Atteignable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm">Réaliste</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Objectives */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">
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
                        className="bg-card p-4 rounded-lg border hover:border-primary transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <div className="text-lg">{index + 1}</div>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {obj.text}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteObjective(obj.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            disabled={deleteObjective.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Aucun objectif défini</p>
                  </div>
                )}
              </div>

              {/* Add Objective Form */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Ajouter un nouvel objectif
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Votre réponse doit juste réponse à cet question ! <span className="font-bold">Après ce cours votre élève a le niveau à :</span>
                  </p>
                </div>
                <div className="relative group">
                  <Textarea
                    value={objectivesText}
                    onChange={(e) => setObjectivesText(e.target.value)}
                    placeholder=""
                    className="min-h-[120px] text-lg p-6 rounded-lg resize-none"
                  />
                  <div className="absolute bottom-4 right-4">
                    <Badge variant="outline" className="bg-background">
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
                    className="w-full h-14 rounded-lg bg-primary text-white font-bold text-lg"
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
        <Card className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Public cible
                  </CardTitle>
                  <CardDescription>
                    À qui s'adresse précisément votre cours ?
                  </CardDescription>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" />
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
              <div className="bg-muted rounded-lg p-6 border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      Exemples de public cible précis
                    </h4>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          Développeurs débutants en JavaScript
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          Étudiants en marketing digital
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Audiences */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">
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
                        className="bg-card p-4 rounded-lg border hover:border-primary transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {aud.text}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAudience(aud.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            disabled={deleteAudience.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Aucun public cible défini</p>
                  </div>
                )}
              </div>

              {/* Add Audience Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">
                  Définir un nouveau public cible
                </h3>
                <p className="text-xs text-muted-foreground">
                  Votre réponse doit juste réponse à cet question ! Ce cours s'adresse à :
                </p>
                <div className="relative group">
                  <Textarea
                    value={audienceText}
                    onChange={(e) => setAudienceText(e.target.value)}
                    placeholder="Public cible"
                    className="min-h-[120px] text-md"
                  />
                  <div className="absolute bottom-4 right-4">
                    <Badge variant="outline" className="bg-background">
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
                    className="w-full h-14 rounded-lg bg-primary text-white font-bold text-lg"
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
        <Card className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Compétences acquises
                  </CardTitle>
                  <CardDescription>
                    Ce que les étudiants sauront faire concrètement
                  </CardDescription>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" />
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
              <div className="bg-muted rounded-lg p-6 border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      Formulez des compétences actionnables
                    </h4>
                    <div className="space-y-3 mt-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-sm">
                          Citer tous les compétences, ne soit pas timides
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-sm">
                          Soyez spécifique et mesurable
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">
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
                          className="bg-card p-4 rounded-lg border hover:border-primary transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {req.text}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRequirement(req.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
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
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Aucune compétence définie</p>
                  </div>
                )}
              </div>

              {/* Add Requirement Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">
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
                      className="h-14 text-md pl-12 pr-4 rounded-lg"
                    />
                    <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                    className="w-full h-14 rounded-lg bg-primary text-white font-bold text-lg"
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
    <div className="bg-card rounded-lg p-4 border hover:border-primary transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <div className="text-primary">{icon}</div>
        </div>
        <div>
          <h5 className="font-semibold text-foreground">{title}</h5>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
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
      className={`bg-muted border rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
          <Info className="w-3 h-3 text-primary" />
        </div>
        <p className="text-sm text-foreground">{children}</p>
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
      className={`p-4 rounded-lg border transition-all ${selected
        ? "border-primary bg-primary/10"
        : "border hover:border-muted-foreground"
        }`}
    >
      <div className="text-center">
        <div
          className={`text-2xl font-bold ${selected ? "text-primary" : "text-foreground"
            }`}
        >
          {label}
        </div>
        <div className="text-sm text-muted-foreground mt-1">{description}</div>
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
      className={`p-4 rounded-lg border transition-all ${selected
        ? "border-primary bg-primary/10"
        : "border hover:border-muted-foreground"
        }`}
    >
      <div className="text-center space-y-2">
        <div className="text-2xl">{icon}</div>
        <div
          className={`font-semibold ${selected ? "text-primary" : "text-foreground"
            }`}
        >
          {label}
        </div>
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
      className={`p-4 rounded-lg border transition-all ${selected
        ? "border-primary bg-primary/10"
        : "border hover:border-muted-foreground"
        }`}
    >
      <div className="text-center space-y-2">
        <div className="text-2xl">{flag}</div>
        <div
          className={`font-semibold ${selected ? "text-primary" : "text-foreground"
            }`}
        >
          {label}
        </div>
      </div>
    </button>
  )
);
LanguageOption.displayName = "LanguageOption";
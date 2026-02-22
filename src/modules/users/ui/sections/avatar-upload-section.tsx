"use client";

import { useState, useCallback, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { Camera, Loader2, Upload } from "lucide-react";


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { UploadDropzone } from "@/lib/uploadthing";
import { z } from "zod";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface AvatarUploadSectionProps {

  className?: string;
  size?: "sm" | "md" | "lg";
}

const avatarSchema = z.object({
  imageUrl: z.url().optional(),
  imageKey: z.string().optional(),
});

type AvatarInput = z.infer<typeof avatarSchema>;

const AvatarUploadSectionSkeleton = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Skeleton className="w-32 h-32 rounded-full" />
        <Skeleton className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full" />
      </div>
      <div className="space-y-2 text-center">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
    </div>
  )
}

const AvatarUploadSectionError = () => {
  return (
    <div>
      AvatarUploadSectionError...
    </div>
  )
}

export const AvatarUploadSection = ({ size, className }: AvatarUploadSectionProps) => {

  return (
    <Suspense fallback={<AvatarUploadSectionSkeleton />}>
      <ErrorBoundary fallback={<AvatarUploadSectionError />}>
        <AvatarUploadSectionSuspense size={size} className={className} /></ErrorBoundary>
    </Suspense>
  )
}


function AvatarUploadSectionSuspense({

  className,
  size = "md",
}: AvatarUploadSectionProps) {

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data: profile } = useSuspenseQuery(
    trpc.user.getProfile.queryOptions(),
  )

  const form = useForm<AvatarInput>({
    resolver: zodResolver(avatarSchema),
    defaultValues: {
      imageUrl: profile?.image || "",
      imageKey: profile?.imageKey || "",
    },
  });

  // Mutation pour mettre à jour l'avatar AUTOMATIQUEMENT
  const updateAvatar = useMutation(
    trpc.user.updateAvatar.mutationOptions({
      onSuccess: (data) => {
        toast.success("Photo de profil mise à jour avec succès!", {
          description: data.deletedOldImage
            ? "L'ancienne image a été supprimée"
            : undefined,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.user.getProfile.queryKey(),
        });
        setIsDialogOpen(false);
        setIsUploading(false);
      },
      onError: (err: any) => {
        toast.error("Erreur lors de la mise à jour", {
          description: err.message,
        });
        setIsUploading(false);
      },
    })
  );

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .slice(0, 1)
      .join("")
      .toUpperCase();
  };

  const handleUploadComplete = useCallback(
    (res: any) => {
      if (res && res[0]) {
        const file = res[0];
        const url = file.url || file.ufsUrl;
        const key = file.key;



        // Mettre à jour AUTOMATIQUEMENT sans bouton "Enregistrer"
        updateAvatar.mutate({
          imageUrl: url,
          imageKey: key
        });


        setIsUploading(false);

      }
    },
    [updateAvatar]
  );

  const handleUploadError = useCallback((error: Error) => {
    toast.error("Erreur lors du téléchargement", {
      description: error.message,
    });
    setIsUploading(false);
  }, []);

  const handleUploadBegin = useCallback(() => {
    setIsUploading(true);
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "w-16 h-16",
          avatar: "w-14 h-14",
          icon: "w-4 h-4",
          text: "text-xs",
        };
      case "lg":
        return {
          container: "w-32 h-32",
          avatar: "w-28 h-28",
          icon: "w-6 h-6",
          text: "text-base",
        };
      default:
        return {
          container: "w-24 h-24",
          avatar: "w-20 h-20",
          icon: "w-5 h-5",
          text: "text-sm",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Définir la couleur personnalisée #ffa041
  const customColor = "#ffa041";
  const customColorLight = "#ffa04120"; // Version claire pour le fond
  const customColorDark = "#e68a36"; // Version plus foncée pour le hover

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar Preview */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative group cursor-pointer">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative rounded-full overflow-hidden border-4 border-white shadow-lg",
                  sizeClasses.container
                )}
                onClick={() => setIsDialogOpen(true)}
              >


                <Avatar className="w-full h-full hover:scale-105 transition-all duration-200 border-2 border-background shadow-sm">
                  <AvatarImage
                    src={profile.image || undefined}
                    alt={profile.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 font-semibold text-white text-3xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Overlay pour hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Camera className={cn("text-white", sizeClasses.icon)} />
                </div>
              </motion.div>

              {/* Badge d'édition avec couleur personnalisée */}
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                style={{ backgroundColor: customColor }}
              >
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cliquez pour changer votre photo de profil</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dialog d'upload */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Photo de profil</DialogTitle>
            <DialogDescription>
              Téléchargez une nouvelle photo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Preview section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {profile?.image ? (
                  <Image
                    src={profile.image}
                    alt="Photo actuelle"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: customColor }}
                  >
                    <span className="font-bold text-white text-2xl">
                      {profile?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm font-medium">
                  {profile?.image
                    ? "Photo actuelle"
                    : "Aucune photo définie"}
                </p>
                {profile?.imageKey && (
                  <p className="text-xs text-gray-500 mt-1">
                    {`Clé: ${profile.imageKey.substring(0, 20)}...`}
                  </p>
                )}
              </div>
            </div>

            {/* Upload section avec thème personnalisé */}
            <div className="space-y-4">
              <UploadDropzone
                endpoint="avatarUploader"
                input={{ userId: profile?.id }}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onUploadBegin={handleUploadBegin}
                config={{ mode: "auto" }}
                appearance={{
                  container: {
                    border: `2px dashed ${customColor}`,
                    borderRadius: "1rem",
                    background: `linear-gradient(to bottom right, ${customColorLight}, ${customColorLight}40)`,
                  },
                  uploadIcon: {
                    color: customColor,
                    width: "3rem",
                    height: "3rem"
                  },
                  label: {
                    color: customColorDark,
                    fontWeight: "600",
                    fontSize: "0.95rem"
                  },
                  allowedContent: {
                    color: "#6b7280",
                    fontSize: "0.85rem"
                  },
                  button: {
                    background: `linear-gradient(to right, ${customColor}, ${customColorDark})`,
                    color: "white",
                    fontWeight: "600",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.95rem",
                  },
                }}
                className="mt-2 cursor-pointer"
              />

              {isUploading && (
                <div className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: `${customColor}20` }}
                >
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: customColor }}
                  />
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: customColorDark }}
                    >
                      Téléchargement en cours...
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: customColor }}
                    >
                      La photo sera mise à jour automatiquement
                    </p>
                  </div>
                </div>
              )}

              {updateAvatar.isPending && (
                <div className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: `${customColor}20` }}
                >
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: customColor }}
                  />
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: customColorDark }}
                    >
                      Mise à jour en cours...
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: customColor }}
                    >
                      Votre photo de profil est en train d'être mise à jour
                    </p>
                  </div>
                </div>
              )}
            </div>


          </div>
        </DialogContent>
      </Dialog>

      {/* Instructions */}
      <p className={cn("text-gray-600 text-center", sizeClasses.text)}>
        Cliquez sur l'avatar pour changer votre photo
      </p>
    </div>
  );
}
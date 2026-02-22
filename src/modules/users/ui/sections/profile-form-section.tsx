"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react";
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { cn } from "@/lib/utils";

const basicInfoSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

const ProfileSectionSkeleton = () => {
  return (
    <Card className="border border-border bg-card">
      <CardHeader className="border-b border-border">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-40 mt-4" />
      </CardContent>
    </Card>
  )
}

const ProfileSectionError = () => {
  return (
    <Card className="border border-destructive/20 bg-destructive/5 dark:border-destructive/30 dark:bg-destructive/10">
      <CardContent className="p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Erreur de chargement
        </h3>
        <p className="text-sm text-muted-foreground">
          Impossible de charger le profil.
        </p>
      </CardContent>
    </Card>
  )
}

export const ProfileFormSection = () => {
  return (
    <Suspense fallback={<ProfileSectionSkeleton />}>
      <ErrorBoundary fallback={<ProfileSectionError />}>
        <ProfileSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const ProfileSectionSuspense = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient()

  const { data: profile } = useSuspenseQuery(
    trpc.user.getProfile.queryOptions()
  )

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: profile ? {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      bio: profile.bio || "",
      location: profile.location || "",
      phone: profile.phone || "",
      website: profile.website || "",
    } : {
      firstName: "",
      lastName: "",
      bio: "",
      location: "",
      phone: "",
      website: "",
    },
  });

  const { register, handleSubmit, watch } = form;
  const { errors, isSubmitting, isDirty } = form.formState;
  const bioLength = watch('bio')?.length || 0;

  const updateMutation = useMutation(
    trpc.user.updateBasicInfo.mutationOptions({
      onSuccess: () => {
        toast.success("Profil mis à jour", {
          style: {
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            border: "none",
          },
        });
        queryClient.invalidateQueries({
          queryKey: trpc.user.getProfile.queryKey()
        })
      },
      onError: (error) => {
        toast.error(error.message || "Une erreur est survenue");
      }
    })
  )

  const onSubmit = (data: BasicInfoFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-foreground">Informations personnelles</CardTitle>
        <CardDescription className="text-muted-foreground">
          Mettez à jour vos informations personnelles
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground">Prénom</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Votre prénom"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground">Nom</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Votre nom"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-foreground">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Parlez-nous un peu de vous..."
              rows={4}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {bioLength}/500 caractères
              </p>
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground">Localisation</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="Ville, Pays"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Téléphone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+261 34 00 000 00"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-foreground">Site web</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://votre-site.com"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || updateMutation.isPending || !isDirty}
            className={cn(
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting || updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Enregistrer les modifications
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
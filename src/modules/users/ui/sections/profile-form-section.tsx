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

const basicInfoSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.url().optional().or(z.literal("")),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

const ProfileSectionSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
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
    <div>
      ProfileSectionError...
    </div>
  )
}

export const ProfileFormSection = () => {
  return (
    <Suspense fallback={<ProfileSectionSkeleton />}>
      <ErrorBoundary fallback={<ProfileSectionError />}>
        <ProfileSectionSupsense />
      </ErrorBoundary>
    </Suspense>
  )
}

const ProfileSectionSupsense = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient()

  const {data: profile} = useSuspenseQuery(
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
  
  const { register, handleSubmit, formState: {
    errors,
    isSubmitting,
    isDirty,
  } } = form;

  const updateMutation = useMutation(
    trpc.user.updateBasicInfo.mutationOptions({
      onSuccess: () => {
        toast.success("Profil mis à jour")
        queryClient.invalidateQueries({
          queryKey: trpc.user.getProfile.queryKey()
        })
      },
      onError: (error) => {
        toast.error(error.message || "Une erreur est survenue")
      }
    })
  )

  const onSubmit = (data: BasicInfoFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>
          Mettez à jour vos informations personnelles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Votre prénom"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Votre nom"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Parlez-nous un peu de vous..."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              {profile?.bio?.length || 0}/500 caractères
            </p>
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="Ville, Pays"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+261 34 00 000 00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://votre-site.com"
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website.message}</p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || updateMutation.isPending || !isDirty}
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
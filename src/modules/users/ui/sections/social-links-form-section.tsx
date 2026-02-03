"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useTRPC } from '@/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Facebook, Github, Instagram, Linkedin, Loader2, Twitter } from 'lucide-react';
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const socialLinksSchema = z.object({
  facebookUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
});

type SocialLinksFormData = z.infer<typeof socialLinksSchema>;

const SocialLinksFormSectionSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-48 mt-4" />
      </CardContent>
    </Card>
  )
}


const SocialLinksFormSectionError = () => {
  return (
    <div>
      SocialLinksFormSectionError...
    </div>
  )
}

export const SocialLinksFormSection = () => {
  return (
    <Suspense fallback={<SocialLinksFormSectionSkeleton />}>
      <ErrorBoundary fallback={<SocialLinksFormSectionError />}>
        <SocialLinksFormSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const SocialLinksFormSectionSuspense = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const {data: profile} = useSuspenseQuery(
    trpc.user.getProfile.queryOptions()
  )

  const form = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: profile ? {
      facebookUrl: profile.facebookUrl ?? "",
      twitterUrl: profile.twitterUrl ?? "",
      linkedinUrl: profile.linkedinUrl ?? "",
      githubUrl: profile.githubUrl ?? "",
      instagramUrl: profile.instagramUrl ?? "",
    } : {
      facebookUrl: "",
      twitterUrl: "",
      linkedinUrl: "",
      githubUrl: "",
      instagramUrl: "",
    },
  });

  const { register, handleSubmit } = form;
  const { isDirty, errors, isSubmitting } = form.formState;
  
  const updateMutation = useMutation(
    trpc.user.updateSocialLinks.mutationOptions({
      onSuccess: () => {
        toast.success("Liens sociaux mis à jour")
        queryClient.invalidateQueries({
          queryKey: trpc.user.getProfile.queryKey()
        })
      },
      onError: (error) => {
        toast.error(error.message || "Une erreur est survenue")
      }
    })
  )

  const onSubmit = (data: SocialLinksFormData) => {
    updateMutation.mutate(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réseaux sociaux</CardTitle>
        <CardDescription>
          Ajoutez vos liens vers les réseaux sociaux
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl" className="flex items-center gap-2">
                <Facebook className="h-4 w-4"  />
                Facebook
              </Label>
              <Input
                id="facebookUrl"
                {...register("facebookUrl")}
                placeholder="https://facebook.com/votre-profil"
              />
              {errors.facebookUrl && (
                <p className="text-sm text-red-500">{errors.facebookUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterUrl" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter / X
              </Label>
              <Input
                id="twitterUrl"
                {...register("twitterUrl")}
                placeholder="https://twitter.com/votre-profil"
              />
              {errors.twitterUrl && (
                <p className="text-sm text-red-500">{errors.twitterUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedinUrl"
                {...register("linkedinUrl")}
                placeholder="https://linkedin.com/in/votre-profil"
              />
              {errors.linkedinUrl && (
                <p className="text-sm text-red-500">{errors.linkedinUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Label>
              <Input
                id="githubUrl"
                {...register("githubUrl")}
                placeholder="https://github.com/votre-profil"
              />
              {errors.githubUrl && (
                <p className="text-sm text-red-500">{errors.githubUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramUrl" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagramUrl"
                {...register("instagramUrl")}
                placeholder="https://instagram.com/votre-profil"
              />
              {errors.instagramUrl && (
                <p className="text-sm text-red-500">{errors.instagramUrl.message}</p>
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
            Mettre à jour les liens
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
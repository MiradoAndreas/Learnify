"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useTRPC } from '@/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Facebook, Github, Instagram, Linkedin, Loader2, Twitter } from 'lucide-react';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { cn } from '@/lib/utils';

// Helper pour extraire le nom d'utilisateur d'une URL existante
const extractUsernameFromUrl = (url: string | null | undefined, platform: string): string => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    switch (platform) {
      case 'facebook':
        return urlObj.pathname.replace(/^\//, '').replace(/\/$/, '');
      case 'twitter':
        return urlObj.pathname.replace(/^\//, '').replace(/\/$/, '');
      case 'linkedin':
        return urlObj.pathname.replace(/^\/(in|company)\//, '').replace(/\/$/, '');
      case 'github':
        return urlObj.pathname.replace(/^\//, '').replace(/\/$/, '');
      case 'instagram':
        return urlObj.pathname.replace(/^\//, '').replace(/\/$/, '');
      default:
        return url;
    }
  } catch {
    return url;
  }
};

// Schéma pour les noms d'utilisateur
const usernameSchema = z
  .string()
  .max(100, "Le nom d'utilisateur est trop long")
  .regex(/^[a-zA-Z0-9._-]*$/, "Caractères autorisés : lettres, chiffres, ., _, -")
  .or(z.literal(""))
  .transform(v => v === "" ? undefined : v);

// Schéma pour chaque plateforme avec construction de l'URL
const socialLinksSchema = z.object({
  facebookUsername: usernameSchema.optional(),
  twitterUsername: usernameSchema.optional(),
  linkedinUsername: usernameSchema.optional(),
  githubUsername: usernameSchema.optional(),
  instagramUsername: usernameSchema.optional(),
});

type SocialLinksFormData = z.infer<typeof socialLinksSchema>;

// Fonction pour construire l'URL complète
const buildFullUrl = (username: string | undefined, platform: string): string | undefined => {
  if (!username) return undefined;
  const baseUrls = {
    facebook: 'https://facebook.com/',
    twitter: 'https://twitter.com/',
    linkedin: 'https://linkedin.com/in/',
    github: 'https://github.com/',
    instagram: 'https://instagram.com/',
  };
  const cleanUsername = username.trim();
  return `${baseUrls[platform as keyof typeof baseUrls]}${cleanUsername}`;
};

const SocialLinksFormSectionSkeleton = () => {
  return (
    <Card className="border border-border bg-card">
      <CardHeader className="border-b border-border">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex">
              <Skeleton className="h-10 w-24 rounded-l-md" />
              <Skeleton className="h-10 flex-1 rounded-r-md" />
            </div>
          </div>
        ))}
        <Skeleton className="h-10 w-48 mt-4" />
      </CardContent>
    </Card>
  );
};

const SocialLinksFormSectionError = () => {
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
          Impossible de charger les liens sociaux.
        </p>
      </CardContent>
    </Card>
  );
};

export const SocialLinksFormSection = () => {
  return (
    <Suspense fallback={<SocialLinksFormSectionSkeleton />}>
      <ErrorBoundary fallback={<SocialLinksFormSectionError />}>
        <SocialLinksFormSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const SocialLinksFormSectionSuspense = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: profile } = useSuspenseQuery(
    trpc.user.getProfile.queryOptions()
  );

  const form = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: profile
      ? {
        facebookUsername: extractUsernameFromUrl(profile.facebookUrl, 'facebook'),
        twitterUsername: extractUsernameFromUrl(profile.twitterUrl, 'twitter'),
        linkedinUsername: extractUsernameFromUrl(profile.linkedinUrl, 'linkedin'),
        githubUsername: extractUsernameFromUrl(profile.githubUrl, 'github'),
        instagramUsername: extractUsernameFromUrl(profile.instagramUrl, 'instagram'),
      }
      : {
        facebookUsername: '',
        twitterUsername: '',
        linkedinUsername: '',
        githubUsername: '',
        instagramUsername: '',
      },
  });

  const { register, handleSubmit, watch } = form;
  const { isDirty, errors, isSubmitting } = form.formState;
  const formValues = watch();

  const updateMutation = useMutation(
    trpc.user.updateSocialLinks.mutationOptions({
      onSuccess: () => {
        toast.success('Liens sociaux mis à jour', {
          style: {
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            border: "none",
          },
        });
        queryClient.invalidateQueries({
          queryKey: trpc.user.getProfile.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getTeacherProfile.queryKey(),
        });
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.message || 'Une erreur est survenue');
      },
    })
  );

  const onSubmit = (data: SocialLinksFormData) => {
    const socialLinks = {
      facebookUrl: buildFullUrl(data.facebookUsername, 'facebook'),
      twitterUrl: buildFullUrl(data.twitterUsername, 'twitter'),
      linkedinUrl: buildFullUrl(data.linkedinUsername, 'linkedin'),
      githubUrl: buildFullUrl(data.githubUsername, 'github'),
      instagramUrl: buildFullUrl(data.instagramUsername, 'instagram'),
    };
    updateMutation.mutate(socialLinks);
  };

  const socialFields = [
    {
      id: 'facebookUsername',
      label: 'Facebook',
      icon: Facebook,
      placeholder: 'votre.nom',
      prefix: 'facebook.com/',
      platform: 'facebook',
    },
    {
      id: 'twitterUsername',
      label: 'Twitter / X',
      icon: Twitter,
      placeholder: 'votrecompte',
      prefix: 'twitter.com/',
      platform: 'twitter',
    },
    {
      id: 'linkedinUsername',
      label: 'LinkedIn',
      icon: Linkedin,
      placeholder: 'votre-nom',
      prefix: 'linkedin.com/in/',
      platform: 'linkedin',
    },
    {
      id: 'githubUsername',
      label: 'GitHub',
      icon: Github,
      placeholder: 'votrecompte',
      prefix: 'github.com/',
      platform: 'github',
    },
    {
      id: 'instagramUsername',
      label: 'Instagram',
      icon: Instagram,
      placeholder: 'votre.compte',
      prefix: 'instagram.com/',
      platform: 'instagram',
    },
  ];

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-foreground">Réseaux sociaux</CardTitle>
        <CardDescription className="text-muted-foreground">
          Ajoutez vos identifiants sur les réseaux sociaux (sans l'URL complète)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            {socialFields.map((field) => {
              const Icon = field.icon;
              const error = errors[field.id as keyof typeof errors];
              const currentValue = formValues[field.id as keyof typeof formValues];

              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="flex items-center gap-2 text-foreground">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {field.label}
                  </Label>

                  {/* Champ avec préfixe visuel */}
                  <div className="flex items-center">
                    <div className="flex items-center px-3 py-2 bg-muted border border-r-0 border-border rounded-l-md text-sm text-muted-foreground">
                      {field.prefix}
                    </div>
                    <Input
                      id={field.id}
                      {...register(field.id as keyof SocialLinksFormData)}
                      placeholder={field.placeholder}
                      className="rounded-l-none bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* Aperçu du lien complet */}
                  {currentValue && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Aperçu: https://{field.prefix}
                      <span className="font-medium text-foreground">
                        {currentValue}
                      </span>
                    </p>
                  )}

                  {error && (
                    <p className="text-sm text-destructive mt-1">
                      {error.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || updateMutation.isPending || !isDirty}
            className={cn(
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "mt-6"
            )}
          >
            {isSubmitting || updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Mettre à jour les liens
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Calendar,
  CheckCircle,
  Award,
  Linkedin,
  Twitter,
  Facebook,
  Github,
  Instagram
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpandableText } from "@/components/expanded-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion"

interface TeacherBasicInfoSectionProps {
  id: string;
}

export const TeacherBasicInfoSection = ({ id }: TeacherBasicInfoSectionProps) => {
  return (
    <Suspense fallback={<TeacherProfileSkeleton />}>
      <ErrorBoundary fallback={<TeacherProfileError />}>
        <TeacherBasicInfoSectionSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
};

const TeacherProfileError = () => {
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
          Impossible de charger le profil du formateur.
        </p>
      </CardContent>
    </Card>
  );
};

const TeacherBasicInfoSectionSuspense = ({ id }: TeacherBasicInfoSectionProps) => {
  const trpc = useTRPC();

  const { data: profile } = useSuspenseQuery(
    trpc.teacher.getTeacherProfile.queryOptions({
      teacherId: id
    })
  );

  // Fonction pour formater la date
  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Icônes pour les réseaux sociaux
  const socialIcons: Record<string, React.ReactNode> = {
    website: <Globe className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    github: <Github className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .slice(0, 1)
      .join("")
      .toUpperCase();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .6 }} className="p-6 bg-background text-foreground">
      {/* En-tête du profil */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Photo de profil */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full">
              <Avatar className="w-[112px] h-[112px] hover:scale-105 transition-all duration-200 border-2 border-background shadow-sm">
                <AvatarImage
                  src={profile.image || undefined}
                  alt={profile.fullName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 font-semibold text-primary-foreground text-3xl">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
            {profile.isVerified && (
              <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-foreground">{profile.fullName}</h1>
            <Badge
              variant={profile.isVerified ? "default" : "secondary"}
              className={cn(
                profile.isVerified
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {profile.isVerified ? "Vérifié" : "En attente"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-lg text-foreground/80 mb-4">
            <Briefcase className="w-5 h-5 text-primary" />
            <span>{profile.profession}</span>
          </div>

          <ExpandableText
            text={profile.bio}
            maxLines={3}
            className="text-muted-foreground mb-6 leading-relaxed"
          />

          {/* Compétences */}
          <div className="flex flex-wrap gap-2 mb-6">
            {profile.skills.map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-sm border-border bg-background text-foreground hover:bg-accent"
              >
                <Award className="w-3 h-3 mr-1 text-primary" />
                {skill}
              </Badge>
            ))}
          </div>

          {/* Date d'inscription */}
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Membre depuis {formatDate(profile.createdAt)}</span>
          </div>
        </div>
      </div>

      <Separator className="my-8 bg-border" />

      {/* Sections d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informations de contact */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Informations de contact</h2>

          <div className="space-y-4">
            {profile.contactInfo.email && (
              <div className="flex items-center gap-3 text-foreground/80">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span>{profile.contactInfo.email}</span>
              </div>
            )}

            {profile.contactInfo.phone && (
              <div className="flex items-center gap-3 text-foreground/80">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span>{profile.contactInfo.phone}</span>
              </div>
            )}

            {profile.contactInfo.location && (
              <div className="flex items-center gap-3 text-foreground/80">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span>{profile.contactInfo.location}</span>
              </div>
            )}
          </div>

          {/* Expérience */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-foreground mb-3">Expérience</h3>
            <ExpandableText
              text={profile.experience}
              maxLines={1}
              className="text-muted-foreground leading-relaxed"
            />
          </div>
        </div>

        {/* Réseaux sociaux et informations complémentaires */}
        <div className="space-y-6">
          {/* Réseaux sociaux */}
          {Object.keys(profile.socialLinks).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Réseaux sociaux</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(profile.socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent text-foreground rounded-lg transition-colors"
                  >
                    <span className="text-primary">{socialIcons[platform]}</span>
                    <span className="capitalize">{platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Informations utilisateur */}
          <Card className="border border-border bg-card">
            <CardContent className="p-5">
              <h3 className="font-medium text-foreground mb-3">À propos</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                {profile.userInfo.bio && (
                  <p>{profile.userInfo.bio}</p>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Membre depuis :</span>
                    <span className="text-muted-foreground">{formatDate(profile.userInfo.joinedAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Informations de l'expérience (version complète) */}
      <div className="mt-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/5 dark:to-primary/10 rounded-xl p-6 border border-primary/20">
        <h2 className="text-xl font-semibold text-foreground mb-4">Mon parcours</h2>
        <div className="prose max-w-none dark:prose-invert">
          <ExpandableText
            text={profile.experience}
            maxLines={1}
            className="text-foreground/80 leading-relaxed whitespace-pre-line"
          />
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton amélioré pour le chargement
const TeacherProfileSkeleton = () => {
  return (
    <div className="p-6 space-y-8 bg-background">
      {/* En-tête skeleton */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <Skeleton className="w-[112px] h-[112px] rounded-full" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Skeleton className="h-7 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-48" />
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-2" />
          </div>
        </div>

        <div className="space-y-6">
          <Skeleton className="h-7 w-40" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-lg" />
            ))}
          </div>
          <div className="mt-6">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Expérience complète skeleton */}
      <div className="mt-12">
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
};
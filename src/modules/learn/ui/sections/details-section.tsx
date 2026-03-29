"use client"

import { ExpandableRichText } from "@/modules/teachers/courses/lessons/ui/components/expanded-rich-text";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FileIcon, Download, FileText, FileImage, FileArchive, FileCode, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";

interface DetailsSectionProps {
  courseId: string;
  lessonId: string
}

const DetailsSectionSkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="grid gap-3">
          <div className="h-20 w-full bg-muted rounded animate-pulse" />
          <div className="h-20 w-full bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

const DetailsSectionError = () => {
  return (
    <div className="p-6 text-center">
      <p className="text-destructive">Une erreur est survenue lors du chargement des détails</p>
    </div>
  )
}

export const DetailsSection = ({
  courseId,
  lessonId
}: DetailsSectionProps) => {
  return (
    <Suspense fallback={<DetailsSectionSkeleton />}>
      <ErrorBoundary fallback={<DetailsSectionError />}>
        <DetailsSectionSuspense courseId={courseId} lessonId={lessonId} />
      </ErrorBoundary>
    </Suspense>
  )
}

// Fonction utilitaire pour obtenir l'icône selon le type de fichier
const getFileIcon = (fileType: string) => {
  const type = fileType?.toLowerCase() || '';

  if (type.includes('pdf')) return FileText;
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => type.includes(ext))) return FileImage;
  if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar')) return FileArchive;
  if (type.includes('code') || ['js', 'ts', 'html', 'css', 'py', 'java'].some(ext => type.includes(ext))) return FileCode;
  if (type.includes('excel') || ['xls', 'xlsx', 'csv'].some(ext => type.includes(ext))) return FileSpreadsheet;

  return FileIcon;
};

// Fonction pour obtenir la couleur selon le type
const getFileColor = (fileType: string) => {
  const type = fileType?.toLowerCase() || '';

  if (type.includes('pdf')) return 'text-red-500 bg-red-50 dark:bg-red-950/20';
  if (type.includes('image')) return 'text-purple-500 bg-purple-50 dark:bg-purple-950/20';
  if (type.includes('zip') || type.includes('rar')) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
  if (type.includes('code')) return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
  if (type.includes('excel') || type.includes('xls')) return 'text-green-500 bg-green-50 dark:bg-green-950/20';

  return 'text-gray-500 bg-gray-50 dark:bg-gray-800/20';
};

const DetailsSectionSuspense = ({
  courseId,
  lessonId
}: DetailsSectionProps) => {
  const trpc = useTRPC()

  const { data: lessonDetails } = useSuspenseQuery(
    trpc.course.getLessonDetails.queryOptions({
      courseId,
      lessonId
    })
  )

  console.log(lessonDetails.description)

  const hasResources = lessonDetails.resources && lessonDetails.resources.length > 0;

  return (
    <div className="  px-4 py-8 space-y-8">
      {/* Section Description */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">À propos du ce vidéo</h2>

        </div>


        {lessonDetails.description ? (
          <ExpandableRichText
            content={lessonDetails.description}
            className="prose prose-sm dark:prose-invert max-w-none tiptap-editor"
            maxLines={15}
          />
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucune description disponible pour cette leçon.
          </p>
        )}

      </section>

      <Separator className="my-6" />

      {/* Section Ressources */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Ressources</h2>
            {hasResources && (
              <Badge variant="secondary" className="text-xs">
                {lessonDetails.resources.length} fichier{lessonDetails.resources.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {hasResources && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                // Logique pour tout télécharger (optionnel)
              }}
            >
              Tout télécharger
            </Button>
          )}
        </div>

        {hasResources ? (
          <div className="grid gap-3">
            {lessonDetails.resources.map((resource) => {
              const FileIconComponent = getFileIcon(resource.type);
              const fileColorClass = getFileColor(resource.type);

              return (
                <Card
                  key={resource.id}
                  className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary/50 to-primary/30" />

                  <div className="p-4 flex items-start gap-4">
                    {/* Icône avec couleur */}
                    <div className={`shrink-0 w-12 h-12 rounded-xl ${fileColorClass} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <FileIconComponent className="w-6 h-6" />
                    </div>

                    {/* Informations du fichier */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-medium text-base truncate max-w-[300px] md:max-w-md">
                            {resource.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="uppercase px-2 py-0.5 rounded-full bg-muted">
                              {resource.type || 'fichier'}
                            </span>
                            <span>•</span>
                            <span>{formatBytes(resource.size)}</span>
                            <span>•</span>
                            <span>Ajouté le {new Date(resource.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}</span>
                          </div>
                        </div>

                        {/* Bouton de téléchargement */}
                        <a href={resource.attachmentUrl} download={resource.name}  >
                          <Button
                            size="sm"
                            className="shrink-0 gap-2"

                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Télécharger</span>
                          </Button>
                        </a>
                      </div>


                    </div>
                  </div>

                  {/* Aperçu rapide au hover (optionnel) */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary/50 via-primary/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform" />
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center bg-muted/30 border-dashed">
            <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <FileIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium text-lg">Aucune ressource</h3>
              <p className="text-sm text-muted-foreground">
                Cette leçon ne contient pas de ressources téléchargeables pour le moment.
              </p>
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
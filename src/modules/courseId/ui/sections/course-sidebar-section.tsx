"use client"

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { THUMBNAIL_FALLBACK } from '@/constants';

import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Heart, PlayCircleIcon, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Handle } from 'vaul';

interface CourseSidebarSectionProps {
  courseId: string;
  freeLessons: any[];
  onPlayPreview: () => void;
}

const CourseSidebarSectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

const CourseSidebarSectionError = () => {
  return (
    <div className="rounded-lg border border-border p-6">
      <p className="text-muted-foreground text-center">
        Informations non disponibles
      </p>
    </div>
  )
}

export const CourseSidebarSection = ({
  freeLessons,
  onPlayPreview,
  courseId
}: CourseSidebarSectionProps) => {
  return (
    <Suspense fallback={<CourseSidebarSectionSkeleton />}>
      <ErrorBoundary fallback={<CourseSidebarSectionError />}>
        <CourseSidebarSectionSuspense
          freeLessons={freeLessons}
          onPlayPreview={onPlayPreview}
          courseId={courseId}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

const CourseSidebarSectionSuspense = ({
  freeLessons,
  onPlayPreview,
  courseId
}: CourseSidebarSectionProps) => {
  const trpc = useTRPC();
  const router = useRouter()

  const queryClient = useQueryClient()

  const { data: course } = useSuspenseQuery(
    trpc.course.getCourseBasicInfo.queryOptions({
      courseId
    })
  )

  const simulatePayment = useMutation(
    trpc.paiement.simulateSuccessfulPayment.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.paiement.getMyCourses.queryOptions()
        );

        router.push(`/courses/${courseId}`);
      },
    })
  );

  const createCheckout = useMutation(
    trpc.paiement.createCheckout.mutationOptions(
      {
        onSuccess: async (data) => {

          if (data.alreadyPurchased) {
            router.push(data.redirectTo)
            return
          }

          if (data.free) {
            await simulatePayment.mutateAsync({ courseId });
            return;
          }

          router.push(data.checkoutUrl || "");

        }
      }
    )
  )

  const handleCheckout = () => {
    createCheckout.mutate({ courseId })
  }

  return (
    <div className="space-y-6">
      {/* Aperçu vidéo */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        <Image
          src={course.thumbnailUrl || THUMBNAIL_FALLBACK}
          alt={course.title}
          fill
          className="object-cover"
        />
        {freeLessons.length > 0 && (
          <button
            onClick={onPlayPreview}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
          >
            <PlayCircleIcon className="h-12 w-12 text-white" />
          </button>
        )}
        {freeLessons.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="text-xs bg-background/90 backdrop-blur-sm px-2 py-1 rounded">
              {freeLessons.length} leçon{freeLessons.length > 1 ? 's' : ''} gratuite{freeLessons.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Prix */}
      <div className="text-center">
        <div className="text-3xl font-bold">
          {course.price > 0 ? `${course.price} Ar` : "Gratuit"}
        </div>
        {course.price > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Accès permanent inclus
          </p>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={handleCheckout} disabled={createCheckout.isPending || simulatePayment.isPending}>
          {course.price > 0 ? "Acheter le cours" : "Commencer gratuitement"}
        </Button>
        {course.price > 0 && (
          <Button variant="outline" className="w-full">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter au panier
          </Button>
        )}
        <Button variant="ghost" className="w-full">
          <Heart className="h-4 w-4 mr-2" />
          Ajouter aux favoris
        </Button>
      </div>

      <Separator />

    </div>
  )
}
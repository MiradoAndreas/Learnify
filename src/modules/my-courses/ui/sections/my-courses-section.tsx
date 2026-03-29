"use client"
import { CourseCard } from '@/modules/home/ui/components/course-card'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { MyCourseCard } from '../components/my-course-card'
import { CoursesSkeleton } from '@/modules/home/ui/loading/course-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

const MyCourseSectionError = () => {
  return (
    <div className='px-4 py-10 md:py-20 md:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      <div className='col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center gap-4 bg-destructive/5 p-12 rounded-xl border border-destructive/20'>
        <div className='w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center'>
          <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className='text-center text-xl font-semibold text-destructive'>
          Oups ! Une erreur est survenue
        </p>
        <p className='text-center text-sm text-muted-foreground max-w-md'>
          Nous n'avons pas pu charger vos cours. Veuillez réessayer ultérieurement.
        </p>
      </div>
    </div>
  )
}

const MyCourseSectionSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header avec animation de gradient */}
      <div className="flex flex-col gap-y-4 items-center pt-10">
        <Skeleton className="h-10 w-48 rounded-lg   animate-pulse" />
        <Skeleton className="h-4 w-64 rounded-md   animate-pulse" />
      </div>

      {/* Grille de cartes skeleton */}
      <div className='px-4 py-6 md:py-10 md:px-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Génération de 6 cartes skeleton pour un rendu plus réaliste */}
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-pulse"
            >
              {/* Image/Thumbnail skeleton */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
              </div>

              {/* Contenu de la carte */}
              <div className="p-5 space-y-4">
                {/* Titre et description */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </div>

                {/* Séparateur */}
                <div className="h-px bg-border/50" />

                {/* Métriques du cours */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16 rounded-md" />
                      <Skeleton className="h-3 w-12 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>

                {/* Barre de progression */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16 rounded-md" />
                    <Skeleton className="h-3 w-8 rounded-md" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>

                {/* Bouton d'action */}
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const MyCourseSection = () => {
  return (
    <Suspense fallback={<MyCourseSectionSkeleton />}>
      <ErrorBoundary fallback={<MyCourseSectionError />}>
        <MyCourseSectionSuspense />
      </ErrorBoundary>
    </Suspense >
  )
}

const MyCourseSectionSuspense = () => {
  const trpc = useTRPC()

  const { data: mycourses } = useSuspenseQuery(
    trpc.paiement.getMyCourses.queryOptions()
  )

  // Si pas de cours
  if (!mycourses || mycourses.length === 0) {
    return (
      <div className="space-y-8">
        <div className='flex flex-col gap-y-3 pt-10'>
          <h1 className='font-bold text-3xl text-center'>
            Mes cours
          </h1>
          <p className='text-sm text-muted-foreground text-center'>
            Vous n'avez pas encore de cours
          </p>
        </div>
        <div className='px-4 py-10 md:py-20 md:px-10 flex justify-center'>
          <div className='text-center max-w-md p-12 bg-muted/30 rounded-xl border border-dashed'>
            <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center'>
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className='text-lg font-semibold mb-2'>Aucun cours pour le moment</h3>
            <p className='text-sm text-muted-foreground'>
              Explorez notre catalogue et commencez votre apprentissage dès aujourd'hui !
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className='flex flex-col gap-y-3 pt-10'>
        <h1 className='font-bold text-3xl text-center bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
          Mes cours
        </h1>
        <p className='text-sm text-muted-foreground text-center'>
          Mon espace de travail pour gérer mes cours
        </p>
      </div>
      <div className='px-4 py-6 md:py-10 md:px-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {mycourses.map((course) => (
            <MyCourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  )
}
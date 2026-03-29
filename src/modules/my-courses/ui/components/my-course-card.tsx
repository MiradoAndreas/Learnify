// components/my-course-card.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Globe, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RichTextDisplay } from "@/modules/teachers/courses/lessons/ui/components/rich-text-display";


// Animation easing style Apple
const appleEasing = [0.16, 1, 0.3, 1] as const;

interface MyCourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string | null;
    trainer: {
      fullName: string;
      profession: string;
      image?: string | null;
    };
    level?: "beginner" | "intermediate" | "advanced" | null;
    language?: "fr" | "mg" | "en" | null;
    progress?: number;
    totalLessons?: number;
  };
  variant?: "default" | "compact";
}

export const MyCourseCard = ({ course, variant = "default" }: MyCourseCardProps) => {
  const getLevelLabel = (level?: string) => {
    switch (level) {
      case "beginner": return "Débutant";
      case "intermediate": return "Intermédiaire";
      case "advanced": return "Avancé";
      default: return "Tous niveaux";
    }
  };

  const getLanguageLabel = (lang?: string) => {
    switch (lang) {
      case "fr": return "Français";
      case "mg": return "Malagasy";
      case "en": return "English";
      default: return "Français";
    }
  };

  // Version compacte (pour les listes ou sidebar)
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href={`/my-courses/${course.id}/learn`}>
          <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden pt-0">
            <div className="flex items-center gap-3 p-3">
              {/* Miniature */}
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-[#ffb74d]/10 shrink-0">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-[#ffb74d]/40" />
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate group-hover:text-[#ffb74d] transition-colors">
                  {course.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {course.trainer.fullName} • {course.trainer.profession}
                </p>

                {/* Barre de progression mini */}
                {course.progress !== undefined && (
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ffb74d] rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                )}
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#ffb74d] group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  // Version par défaut (grille)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: appleEasing }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/my-courses/${course.id}/learn`}>
        <Card className="group h-full pt-0 overflow-hidden border border-border/50 hover:border-[#ffb74d]/30 hover:shadow-xl transition-all duration-500">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden bg-[#ffb74d]/5">
            {course.thumbnailUrl ? (
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-[#ffb74d]/20" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 right-3 flex gap-2">
              {course.language && (
                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-xs">
                  <Globe className="mr-1 h-3 w-3" />
                  {getLanguageLabel(course.language)}
                </Badge>
              )}
              {course.level && (
                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-xs">
                  {getLevelLabel(course.level)}
                </Badge>
              )}
            </div>
          </div>

          {/* Contenu */}
          <CardContent className="p-4">
            {/* Titre */}
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#ffb74d] transition-colors">
              {course.title}
            </h3>


            <RichTextDisplay content={course.description} className="text-sm text-muted-foreground mb-3 line-clamp-2" />

            {/* Formateur */}
            <div className="flex items-center gap-2 mb-3">

              <div className="flex-1 flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {course.trainer.fullName}
                </p>
                <p>
                  {"<>"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {course.trainer.profession}
                </p>
              </div>
            </div>

            {/* Stats et progression */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {course.totalLessons !== undefined && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {course.totalLessons} leçons
                </span>
              )}


            </div>



            {/* Bouton "Continuer" */}
            <Button
              className="w-full mt-4 bg-[#ffb74d] hover:bg-[#ffb74d]/90 text-white font-semibold group/btn"
            >
              <span>Continuer</span>
              <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
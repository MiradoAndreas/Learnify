// components/course-card.tsx
"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Globe,
  ShoppingCart,
  Lock,
  Unlock,
  Award,
  User,
  ChevronRight,
  PlayCircle,
  Heart,
  TrendingUp,
  Sparkles,
  Target,
  Zap,
  Rocket,
  CheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCourseDuration } from "@/modules/teachers/courses/lessons/ui/utils/format-duration";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnailUrl?: string | null;
    trainer: {
      fullName: string;
      profession: string;
      image?: string | null;
    };

    level?: "beginner" | "intermediate" | "advanced" | null;
    duration?: number;
    totalLessons?: number;
    language?: "fr" | "mg" | "en" | null;
    progress?: number;
    isFavorite?: boolean;
  };
  variant?: "default" | "compact" | "featured";
}

export const CourseCard = ({
  course,
  variant = "default",
}: CourseCardProps) => {
  const trpc = useTRPC();
  const [hovered, setHovered] = useState(false);

  const queryClient = useQueryClient();

  const { data: courseDetails, isLoading: isDetailsLoading } = useQuery(
    trpc.course.getCourseDetailsForCard.queryOptions(
      {
        courseId: course.id,
      },
      {
        enabled: hovered,
        staleTime: 1000 * 60 * 5,
      }
    )
  );

  const handleMouseEnter = () => {
    setHovered(true);
    queryClient.prefetchQuery(
      trpc.course.getCourseDetailsForCard.queryOptions({
        courseId: course.id,
      })
    );
  };

  const isFreeCourse = course.price === 0;

  const getLevelConfig = (level?: string) => {
    switch (level) {
      case "beginner":
        return {
          label: "Débutant",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <Target className="h-3 w-3" />,
        };
      case "intermediate":
        return {
          label: "Intermédiaire",
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Zap className="h-3 w-3" />,
        };
      case "advanced":
        return {
          label: "Avancé",
          color: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <Rocket className="h-3 w-3" />,
        };
      default:
        return {
          label: "Tous niveaux",
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: <Award className="h-3 w-3" />,
        };
    }
  };

  const safeLevel = course.level || "Tous le niveaux";

  const levelConfig = getLevelConfig(safeLevel);

  const getLanguageLabel = (lang?: string) => {
    switch (lang) {
      case "fr":
        return "Français";
      case "mg":
        return "Malagasy";
      case "en":
        return "English";
      default:
        return "Français";
    }
  };

  // Fonction pour calculer le prix "avant réduction" (marketing)
  const getMarketingPrice = (price: number) => {
    if (isFreeCourse) return null;
    // Ajouter 20% au prix réel pour créer une "réduction"
    return Math.round(price * 1.2);
  };

  // Formatage du prix avec fausse réduction de 20%
  const formatPriceWithDiscount = (price: number) => {
    if (isFreeCourse) return "Gratuit";

    const originalPrice = getMarketingPrice(price); // Prix "avant réduction"

    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-[#ffb74d]">
          {price.toLocaleString()} Ar
        </span>
        {originalPrice && (
          <>
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toLocaleString()} Ar
            </span>
            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-1.5 py-0">
              -20%
            </Badge>
          </>
        )}
      </div>
    );
  };

  // Contenu compact pour mobile
  if (variant === "compact") {
    return (
      <Link href={`/home/${course.id}`} className="block">
        <Card className="group pt-0 overflow-hidden border border-border hover:border-[#ffb74d]/30 transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative sm:w-2/5 aspect-video sm:aspect-auto bg-[#ffb74d]/5">
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                  width={300}
                  height={200}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-[#ffb74d]/20" />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge
                  className={cn("text-xs font-semibold", levelConfig.color)}
                >
                  <span className="mr-1">{levelConfig.icon}</span>
                  {levelConfig.label}
                </Badge>
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#ffb74d] transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-[#ffb74d]">
                  {isFreeCourse
                    ? "Gratuit"
                    : `${course.price.toLocaleString()} Ar`}
                </div>

                <Button className="bg-[#ffb74d] hover:bg-[#ffb74d]/90 text-white">
                  {isFreeCourse ? "Commencer" : "Voir le cours"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <TooltipProvider>
      <HoverCard openDelay={300} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Link href={`/home/${course.id}`} className="block">
            <div
              className={cn("w-full cursor-pointer group")}
              onMouseEnter={handleMouseEnter}
            >
              <Card className="h-full pt-0 gap-0  overflow-hidden border border-border/50 hover:border-[#ffb74d]/30 transition-all duration-500 hover:shadow-xl group-hover:-translate-y-1">
                {/* Image avec overlay */}
                <div className="relative aspect-video overflow-hidden bg-[#ffb74d]/5">
                  {course.thumbnailUrl ? (
                    <>
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        width={400}
                        height={225}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="relative">
                        <BookOpen className="h-16 w-16 text-[#ffb74d]/20" />
                        <PlayCircle className="absolute inset-0 h-full w-full text-[#ffb74d]/40" />
                      </div>
                    </div>
                  )}

                  {/* Badges superposés */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {course.language && (
                      <Badge
                        variant="secondary"
                        className="backdrop-blur-sm bg-white/80 text-xs"
                      >
                        <Globe className="mr-1 h-3 w-3" />
                        {getLanguageLabel(course.language)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Contenu principal */}
                <CardContent className="p-5">
                  {/* Titre */}
                  <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-[#ffb74d] transition-colors">
                    {course.title}
                  </h3>

                  {/* Description courte */}
                  <p className="text-sm text-muted-foreground line-clamp-2 my-3">
                    {course.description}
                  </p>

                  {/* Formateur */}
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">
                        {course.trainer.fullName}
                      </p>
                      <p>•</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {course.trainer.profession}
                      </p>
                    </div>
                  </div>
                </CardContent>

                {/* Footer avec prix et CTA */}
                <CardFooter className="px-5 flex  pt-0 border-t">
                  <div className="w-full flex flex-col gap-10">
                    <div className="space-y-1">
                      {formatPriceWithDiscount(course.price)}
                    </div>
                    <div className="w-full flex items-center justify-between">
                      <div></div>
                      <Button className="bg-[#ffb74d] hover:bg-[#ffb74d]/90 text-white font-semibold hover:shadow-md transition-all duration-300 group/btn">
                        <span className="group-hover/btn:translate-x-1 transition-transform">
                          {isFreeCourse ? "Commencer" : "Acheter"}
                        </span>
                        <ChevronRight className="ml-2 h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-all" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </Link>
        </HoverCardTrigger>

        {/* Hover Card enrichi */}
        <HoverCardContent
          className="w-[300px] lg:w-[400px] p-0 border shadow-2xl overflow-hidden"
          align="center"
          side="right"
          sideOffset={20}
          collisionPadding={20}
        >
          <div className="relative">
            {/* Bannière supérieure */}
            <div className="h-1 bg-[#ffb74d]" />

            <ScrollArea className="h-[500px]">
              <div className="p-6 space-y-3">
                {/* En-tête avec niveau et prix */}
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    className={cn(
                      "px-3 py-1 font-semibold text-sm",
                      levelConfig.color
                    )}
                  >
                    <span className="mr-1">{levelConfig.icon}</span>
                    {levelConfig.label}
                  </Badge>
                </div>

                {/* Titre */}
                <h3 className="font-bold text-xl leading-tight">
                  {course.title}
                </h3>

                <Separator className="bg-[#ffb74d]/20" />

                {/* Description */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {course.description}
                  </p>
                </div>

                {/* Stats essentielles */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 p-3 bg-[#ffb74d]/5 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Durée</span>
                    </div>
                    <p className="font-bold text-lg">
                      {formatCourseDuration(course.duration)}
                    </p>
                  </div>

                  <div className="space-y-1 p-3 bg-[#ffb74d]/5 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>Leçons</span>
                    </div>
                    <p className="font-bold text-lg">
                      {course.totalLessons || 0}
                    </p>
                  </div>
                </div>

                {/* Objectifs d'apprentissage */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-muted-foreground  flex items-center gap-2">
                    Ce que vous allez apprendre
                  </h4>
                  {isDetailsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-3 w-full rounded-full" />
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {(courseDetails?.objectives || [])
                        .slice(0, 4)
                        .map((objective: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckIcon className="h-3.5 w-3.5  mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">
                              {objective}
                            </span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                {/* Avantages */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs p-2 bg-[#ffb74d]/5 rounded">
                    <Clock className="h-3 w-3 text-[#ffb74d]" />
                    <span className="font-medium">Accès à vie</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs p-2 bg-[#ffb74d]/5 rounded">
                    <Unlock className="h-3 w-3 text-green-500" />
                    <span className="font-medium">Garantie 30 jours</span>
                  </div>
                </div>

                {/* CTA principal */}
                <div className="space-y-3 pt-2">
                  <Button className="w-full h-12 bg-[#ffb74d] hover:bg-[#ffb74d]/90 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isFreeCourse
                      ? "Commencer gratuitement"
                      : "Acheter maintenant"}
                  </Button>

                  {!isFreeCourse && (
                    <p className="text-xs text-center text-muted-foreground">
                      ⭐ Paiement sécurisé · Support 7j/7
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </HoverCardContent>
      </HoverCard>
    </TooltipProvider>
  );
};

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
import { RichTextDisplay } from "@/modules/teachers/courses/lessons/ui/components/rich-text-display";
import { motion, AnimatePresence } from "framer-motion";

// Animation easing style Apple
const appleEasing = [0.16, 1, 0.3, 1] as const;

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
  const [imageLoaded, setImageLoaded] = useState(false);

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

  const getMarketingPrice = (price: number) => {
    if (isFreeCourse) return null;
    return Math.round(price * 1.2);
  };

  const formatPriceWithDiscount = (price: number) => {
    if (isFreeCourse) return "Gratuit";
    const originalPrice = getMarketingPrice(price);

    return (
      <div className="flex items-center gap-2">
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold text-[#ffb74d]"
        >
          {price.toLocaleString()} Ar
        </motion.span>
        {originalPrice && (
          <>
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toLocaleString()} Ar
            </span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            >
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-1.5 py-0">
                -20%
              </Badge>
            </motion.div>
          </>
        )}
      </div>
    );
  };

  // Version compacte avec animations
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, ease: appleEasing }}
        whileHover={{ y: -4 }}
      >
        <Link href={`/home/${course.id}`} className="block">
          <Card className="group pt-0 overflow-hidden border border-border hover:border-[#ffb74d]/30 transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col sm:flex-row">
              {/* Image avec animation de chargement */}
              <motion.div
                className="relative sm:w-2/5 aspect-video sm:aspect-auto bg-[#ffb74d]/5"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {course.thumbnailUrl ? (
                  <>
                    <motion.div
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{
                        scale: imageLoaded ? 1 : 1.1,
                        opacity: imageLoaded ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover"
                        width={300}
                        height={200}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </motion.div>
                  </>
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-[#ffb74d]/20" />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="absolute top-2 left-2"
                >
                  <Badge className={cn("text-xs font-semibold", levelConfig.color)}>
                    <span className="mr-1">{levelConfig.icon}</span>
                    {levelConfig.label}
                  </Badge>
                </motion.div>
              </motion.div>

              {/* Contenu */}
              <div className="flex-1 p-4">
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#ffb74d] transition-colors"
                >
                  {course.title}
                </motion.h3>

                <RichTextDisplay
                  content={course.description}
                  className="text-sm text-muted-foreground mb-3 line-clamp-2"
                />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center justify-between"
                >
                  <div className="text-lg font-bold text-[#ffb74d]">
                    {isFreeCourse ? "Gratuit" : `${course.price.toLocaleString()} Ar`}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-[#ffb74d] hover:bg-[#ffb74d]/90 text-white">
                      {isFreeCourse ? "Commencer" : "Voir le cours"}
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  // Version par défaut avec animations
  return (
    <TooltipProvider>
      <HoverCard openDelay={300} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Link href={`/home/${course.id}`} className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, ease: appleEasing }}
              whileHover={{ y: -4 }}
              className={cn("w-full cursor-pointer group")}
              onMouseEnter={handleMouseEnter}
            >
              <Card className="h-full pt-0 gap-0 overflow-hidden border border-border/50 hover:border-[#ffb74d]/30 transition-all duration-500 hover:shadow-xl">
                {/* Image avec overlay et animation */}
                <motion.div
                  className="relative aspect-video overflow-hidden bg-[#ffb74d]/5"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {course.thumbnailUrl ? (
                    <>
                      <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{
                          scale: imageLoaded ? 1 : 1.1,
                          opacity: imageLoaded ? 1 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-full w-full object-cover"
                          width={400}
                          height={225}
                          onLoad={() => setImageLoaded(true)}
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent"
                      />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="relative">
                        <BookOpen className="h-16 w-16 text-[#ffb74d]/20" />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <PlayCircle className="absolute inset-0 h-full w-full text-[#ffb74d]/40" />
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* Badges superposés avec animation */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="absolute top-3 right-3 flex flex-col gap-2"
                  >
                    {course.language && (
                      <Badge
                        variant="secondary"
                        className="backdrop-blur-sm bg-white/80 text-xs"
                      >
                        <Globe className="mr-1 h-3 w-3" />
                        {getLanguageLabel(course.language)}
                      </Badge>
                    )}
                  </motion.div>
                </motion.div>

                {/* Contenu principal */}
                <CardContent className="p-5">
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-[#ffb74d] transition-colors"
                  >
                    {course.title}
                  </motion.h3>

                  <RichTextDisplay
                    content={course.description}
                    className="text-sm text-muted-foreground my-3 line-clamp-2"
                  />

                  {/* Formateur avec animation */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">
                        {course.trainer.fullName}
                      </p>
                      <p>•</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {course.trainer.profession}
                      </p>
                    </div>
                  </motion.div>
                </CardContent>

                {/* Footer avec prix et CTA */}
                <CardFooter className="px-5 pt-0 border-t">
                  <div className="w-full flex flex-col gap-10">
                    <div className="space-y-1">
                      {formatPriceWithDiscount(course.price)}
                    </div>
                    <div className="w-full flex items-center justify-between">
                      <div></div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className="bg-[#ffb74d] hover:bg-[#ffb74d]/90 text-white font-semibold hover:shadow-md transition-all duration-300 group/btn">
                          <span className="group-hover/btn:translate-x-1 transition-transform">
                            {isFreeCourse ? "Commencer" : "Acheter"}
                          </span>
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </motion.div>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </Link>
        </HoverCardTrigger>

        {/* Hover Card enrichi avec animations */}
        <HoverCardContent
          className="w-[300px] lg:w-[400px] p-0 border shadow-2xl overflow-hidden"
          align="center"
          side="right"
          sideOffset={20}
          collisionPadding={20}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {/* Bannière supérieure animée */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
              className="h-1 bg-[#ffb74d] origin-left"
            />

            <ScrollArea className="h-[500px]">
              <div className="p-6 space-y-3">
                {/* En-tête avec niveau et prix */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-start justify-between gap-2"
                >
                  <Badge
                    className={cn(
                      "px-3 py-1 font-semibold text-sm",
                      levelConfig.color
                    )}
                  >
                    <span className="mr-1">{levelConfig.icon}</span>
                    {levelConfig.label}
                  </Badge>
                </motion.div>

                {/* Titre */}
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-bold text-xl leading-tight"
                >
                  {course.title}
                </motion.h3>

                <Separator className="bg-[#ffb74d]/20" />

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                >
                  <RichTextDisplay
                    content={course.description}
                    className="text-sm text-muted-foreground my-3 line-clamp-4"
                  />
                </motion.div>

                {/* Stats essentielles avec animations */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {[
                    { icon: Clock, label: "Durée", value: formatCourseDuration(course.duration) },
                    { icon: BookOpen, label: "Leçons", value: course.totalLessons || 0 }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="space-y-1 p-3 bg-[#ffb74d]/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <stat.icon className="h-4 w-4" />
                        <span>{stat.label}</span>
                      </div>
                      <p className="font-bold text-lg">{stat.value}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Objectifs d'apprentissage */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-3"
                >
                  <h4 className="font-semibold text-muted-foreground flex items-center gap-2">
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
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckIcon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">
                              {objective}
                            </span>
                          </motion.li>
                        ))}
                    </ul>
                  )}
                </motion.div>

                {/* Avantages */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="grid grid-cols-2 gap-2"
                >
                  {[
                    { icon: Clock, text: "Accès à vie", color: "text-[#ffb74d]" },
                    { icon: Unlock, text: "Garantie 30 jours", color: "text-green-500" }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 183, 77, 0.1)" }}
                      className="flex items-center gap-2 text-xs p-2 bg-[#ffb74d]/5 rounded transition-colors"
                    >
                      <item.icon className={cn("h-3 w-3", item.color)} />
                      <span className="font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA principal */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3 pt-2"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full h-12 bg-[#ffb74d] hover:bg-[#ffb74d]/90 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {isFreeCourse
                        ? "Commencer gratuitement"
                        : "Acheter maintenant"}
                    </Button>
                  </motion.div>

                  {!isFreeCourse && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      className="text-xs text-center text-muted-foreground"
                    >
                      ⭐ Paiement sécurisé · Support 7j/7
                    </motion.p>
                  )}
                </motion.div>
              </div>
            </ScrollArea>
          </motion.div>
        </HoverCardContent>
      </HoverCard>
    </TooltipProvider>
  );
};
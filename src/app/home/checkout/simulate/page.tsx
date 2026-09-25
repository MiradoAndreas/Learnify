"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  CreditCard,
  Lock,
  Shield,
  Clock,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  BadgeCheck,
  Calendar,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const courseId = searchParams.get("courseId");

  if (!courseId) {
    throw new Error("Missing courseId");
  }

  const { data: course } = useSuspenseQuery(
    trpc.course.getCourseBasicInfo.queryOptions({ courseId })
  );

  const simulatePayment = useMutation(
    trpc.paiement.simulateSuccessfulPayment.mutationOptions({
      onSuccess: async () => {
        toast.success("Paiement réalisé avec succès", {
          icon: <CheckCircle2 className="h-4 w-4" />,
          duration: 5000,
        });
        await queryClient.invalidateQueries(
          trpc.paiement.getMyCourses.queryOptions()
        );
        router.push(`/home/my-courses`);
      },
      onError: (error) => {
        toast.error("Une erreur est survenue lors du paiement", {
          icon: <AlertCircle className="h-4 w-4" />,
          description: "Veuillez réessayer ou contacter le support",
        });
        console.log(error);
      }
    })
  );

  // Formatage du prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' Ar';
  };

  // Calcul du prix avec promotion (simulé)
  const originalPrice = course.price * 1.2;
  const discount = 20;

  // Niveau en français
  const getLevelLabel = (level: string) => {
    const levels = {
      beginner: "Débutant",
      intermediate: "Intermédiaire",
      advanced: "Avancé"
    };
    return levels[level as keyof typeof levels] || level;
  };

  // Langue en français
  const getLanguageLabel = (lang: string | null) => {
    const languages = {
      fr: "Français",
      mg: "Malagasy",
      en: "Anglais"
    };
    return languages[lang as keyof typeof languages] || lang;
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerChildren}
      className="min-h-screen bg-background py-8 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Bouton retour */}
        <motion.div variants={fadeIn} className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="group"
          >
            <ChevronLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Retour
          </Button>
        </motion.div>

        {/* En-tête */}
        <motion.div variants={fadeIn} className="text-center mb-8">

          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Finaliser votre achat
          </h1>
          <p className="text-muted-foreground mt-2">
            Vous êtes sur le point d'acquérir une nouvelle compétence
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale - Résumé du cours */}
          <motion.div variants={fadeIn} className="lg:col-span-2 space-y-6">
            {/* Carte principale du cours */}
            <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 pt-0">
              <div className="relative h-48 bg-linear-to-r from-primary/20 to-primary/5">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                    <Award className="h-3 w-3 mr-1" />
                    {getLevelLabel(course.level || "Tous niveaux")}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.round(course.duration / 60)} min
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Métriques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: BookOpen, label: "Leçons", value: course.totalLessons },
                    { icon: Clock, label: "Durée totale", value: `${Math.round(course.duration / 60)} min` },
                    { icon: Users, label: "Langue", value: getLanguageLabel(course.language) },
                    { icon: Calendar, label: "Publié", value: format(new Date(course.publishedAt), 'MMM yyyy', { locale: fr }) }
                  ].map((item, index) => (
                    <div key={index} className="text-center p-3 bg-muted/30 rounded-lg">
                      <item.icon className="h-4 w-4 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-semibold text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Catégories */}
                {course.categories && course.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {course.categories.map((cat) => (
                      <Badge key={cat.id} variant="outline" className="bg-primary/5">
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Avantages */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {[
                    "Accès à vie",
                    "Certificat inclus",
                    "Support prioritaire",
                    "Garantie 30 jours"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Carte des informations de paiement sécurisé */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Paiement 100% sécurisé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Chiffrement SSL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4" />
                    <span>3D Secure</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vos informations de paiement sont protégées par un chiffrement de pointe.
                  Nous ne stockons aucune information sensible.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Colonne latérale - Récapitulatif et paiement */}
          <motion.div variants={fadeIn} className="lg:col-span-1">
            <Card className="sticky top-6 border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Récapitulatif
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Prix */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Prix original</span>
                    <span className="line-through text-muted-foreground">
                      {formatPrice(originalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Réduction</span>
                    <Badge variant="destructive" className="bg-red-500">-{discount}%</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <motion.span
                      key={course.price}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl text-primary"
                    >
                      {formatPrice(course.price)}
                    </motion.span>
                  </div>
                </div>


              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90  font-semibold text-lg py-6 transition-all duration-300 hover:shadow-lg"
                  onClick={() => simulatePayment.mutate({ courseId })}
                  disabled={simulatePayment.isPending}
                >
                  {simulatePayment.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Lock className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <CreditCard className="mr-2 h-5 w-5" />
                  )}
                  {simulatePayment.isPending ? "Traitement en cours..." : "Confirmer le paiement"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  En cliquant sur &quot;Confirmer&quot;, vous acceptez nos conditions générales de vente
                </p>

                {/* Garanties */}
                <div className="flex justify-center gap-4 pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Garantie 30 jours</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Message rassurant */}
            <motion.div
              variants={fadeIn}
              className="mt-4 p-4 bg-primary/5 rounded-lg text-center"
            >
              <p className="text-sm text-muted-foreground">
                💡 Ceci est une simulation de paiement. Aucun montant ne sera réellement débité.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Page;

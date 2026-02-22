"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  PlusCircle,
  BookOpen,
  DollarSign,
  Sparkles,
  CirclePlayIcon,
  WalletIcon,
  MegaphoneIcon,
  Target,
  Users,
  TrendingUp,
  Lightbulb,
  Zap,
  Crown,
  Rocket,
  Star,
  CheckCircle,
  ArrowRight,
  Award,
  Gem,
  Globe,
  Heart,
  BookText,
  GraduationCap,
} from "lucide-react";
import z from "zod";
import { motion } from "framer-motion";
import { RichTextEditor } from "../../lessons/ui/components/advanced-rich-text-editor";
import { cn } from "@/lib/utils";

const createCourseSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z
    .string()
    .min(20, "La description doit contenir au moins 20 caractères"),
  price: z.number().min(0, "Le prix doit être positif"),
});

type CourseInput = z.infer<typeof createCourseSchema>;

export const NewCourseForm = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<CourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  const createCourse = useMutation(
    trpc.teacher.createCourse.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getMyCourses.queryKey(),
        });
        toast.success("✨ Cours créé avec succès!", {
          style: {
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            border: "none",
            fontSize: "14px",
          },
          icon: "🎉",
          duration: 4000,
        });
        router.push(`/teacher/dashboard`);
      },
      onError: (error) => {
        toast.error("⚠️ " + (error.message || "Une erreur est survenue"), {
          style: {
            background: "hsl(var(--destructive))",
            color: "hsl(var(--destructive-foreground))",
            border: "none",
          },
        });
      },
    })
  );

  const onSubmit = (data: CourseInput) => {
    createCourse.mutate(data);
  };

  const titleLength = form.watch("title")?.length || 0;
  const descriptionLength = form.watch("description")?.length || 0;

  return (
    <div className="min-h-screen p-0 md:p-8 bg-background text-foreground">
      <div className="max-w-full mx-auto">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-card p-4 rounded-xl shadow-sm border border-border text-center">
            <div className="text-2xl font-bold text-primary">85%</div>
            <div className="text-sm text-muted-foreground">Taux de satisfaction</div>
          </div>
          <div className="bg-card p-4 rounded-xl shadow-sm border border-border text-center">
            <div className="text-2xl font-bold text-primary">3x</div>
            <div className="text-sm text-muted-foreground">Plus de visibilité</div>
          </div>
          <div className="bg-card p-4 rounded-xl shadow-sm border border-border text-center">
            <div className="text-2xl font-bold text-primary">24h</div>
            <div className="text-sm text-muted-foreground">Support premium</div>
          </div>
        </motion.div>

        <Card className="border border-border bg-card shadow-2xl rounded-2xl overflow-hidden pt-0">
          <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-fit mx-auto">
              <div className="flex items-center gap-4">

                <div>
                  <CardTitle className="text-3xl font-bold text-primary-foreground">
                    Créer Votre cours éducatif
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/90 text-base mt-2">
                    Démarrez votre voyage vers l'impact et le succès
                  </CardDescription>
                </div>
              </div>

            </div>
          </CardHeader>

          <CardContent className="p-8 bg-card">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Title Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full"></div>
                      <FormLabel className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Titre Perçant
                      </FormLabel>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-primary",
                        titleLength >= 5
                          ? "text-success dark:text-green-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {titleLength}/5
                    </Badge>
                  </div>

                  <div className="relative group">
                    <FormControl>
                      <Input
                        type="text"
                        className="h-14 text-lg pl-12 pr-4 border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 group-hover:border-primary/50 dark:border-gray-700 dark:focus:border-primary"
                        {...form.register("title")}
                        placeholder="Titre du cours"
                      />
                    </FormControl>
                    <BookText className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />

                    {/* Validation Indicator */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          titleLength >= 5
                            ? "bg-success dark:bg-green-500 animate-pulse"
                            : "bg-muted dark:bg-gray-600"
                        )}
                      />
                    </div>
                  </div>

                  {/* Guide Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800/50">
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                          💡 Pourquoi c'est crucial ?
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300/80">
                          Un bon titre augmente les inscriptions de{" "}
                          <span className="font-bold">60%</span>. Il doit être
                          clair, attractif et contenir des mots-clés recherchés.
                          Pensez au problème que vous résolvez pour vos
                          étudiants.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Description Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full"></div>
                      <FormLabel className="text-lg font-bold text-foreground flex items-center gap-2">
                        <BookText className="w-5 h-5 text-primary" />
                        Histoire Captivante
                      </FormLabel>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-primary",
                        descriptionLength >= 20
                          ? "text-success dark:text-green-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {descriptionLength}/20
                    </Badge>
                  </div>

                  <div className="relative group">
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </FormControl>

                    {/* Word Count */}
                    <div className="absolute bottom-4 right-4">
                      <Badge
                        variant="secondary"
                        className="bg-card border-border text-foreground shadow-sm dark:bg-gray-800 dark:text-gray-200"
                      >
                        {descriptionLength} caractères
                      </Badge>
                    </div>
                  </div>

                  {/* Success Story */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                          🏆 Histoire de réussite
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300/80">
                          Les cours avec des descriptions détaillées ont un taux
                          de complétion
                          <span className="font-bold"> 40% plus élevé</span>.
                          Soyez spécifique sur les résultats concrets que vos
                          étudiants obtiendront.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Price Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full"></div>
                      <FormLabel className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Gem className="w-5 h-5 text-primary" />
                        Valorisez Votre Expertise
                      </FormLabel>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary text-primary"
                    >
                      Prix flexible
                    </Badge>
                  </div>

                  {/* Quick Price Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => form.setValue("price", 0)}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all bg-card",
                        form.watch("price") === 0
                          ? "border-success bg-success/5 dark:border-green-600 dark:bg-green-950/30"
                          : "border-border hover:border-primary/50 dark:border-gray-700 dark:hover:border-primary"
                      )}
                    >
                      <div className="text-center">
                        <div
                          className={cn(
                            "text-2xl font-bold",
                            form.watch("price") === 0
                              ? "text-success dark:text-green-400"
                              : "text-foreground"
                          )}
                        >
                          Gratuit
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Parfait pour démarrer
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          • Atteignez plus d'étudiants
                          <br />
                          • Construisez votre réputation
                          <br />• Générez des avis
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => form.setValue("price", 19900)}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all bg-card",
                        form.watch("price") === 19900
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "border-border hover:border-primary/50 dark:border-gray-700 dark:hover:border-primary"
                      )}
                    >
                      <div className="text-center">
                        <div
                          className={cn(
                            "text-2xl font-bold",
                            form.watch("price") === 19900
                              ? "text-primary"
                              : "text-foreground"
                          )}
                        >
                          Ar 19,900
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Prix populaire
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          • Équilibre parfait
                          <br />
                          • Qualité reconnue
                          <br />• Meilleure valeur
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => form.setValue("price", 49900)}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all bg-card",
                        form.watch("price") === 49900
                          ? "border-purple-500 bg-purple-50 dark:border-purple-600 dark:bg-purple-950/30"
                          : "border-border hover:border-primary/50 dark:border-gray-700 dark:hover:border-primary"
                      )}
                    >
                      <div className="text-center">
                        <div
                          className={cn(
                            "text-2xl font-bold",
                            form.watch("price") === 49900
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-foreground"
                          )}
                        >
                          Ar 49,900
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Valeur premium
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          • Expertise avancée
                          <br />
                          • Contenu exclusif
                          <br />• Support prioritaire
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Custom Price Input */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-2xl font-bold text-muted-foreground">
                        Ar
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-14 text-2xl pl-12 pr-4 border-2 border-input bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 dark:border-gray-700"
                        {...form.register("price", { valueAsNumber: true })}
                        placeholder="0"
                        min="0"
                        step="100"
                      />
                    </FormControl>
                    <div className="absolute inset-y-0 right-4 flex items-center">
                      <WalletIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      Valeur actuelle :{" "}
                      <span className="text-2xl font-bold text-primary">
                        Ar {form.watch("price").toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {form.watch("price") === 0
                        ? "📢 Cours gratuit - Excellent pour la visibilité !"
                        : form.watch("price") < 10000
                          ? "💰 Prix accessible - Parfait pour commencer"
                          : "💎 Prix premium - Votre expertise vaut chaque Ariary"}
                    </div>
                  </div>

                  {/* Revenue Calculator */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                          📈 Calculateur de Revenu Potentiel
                        </p>
                        <div className="text-sm text-amber-700 dark:text-amber-300/80 space-y-1">
                          <div className="flex justify-between">
                            <span>Étudiants potentiels (mois 1) :</span>
                            <span className="font-bold">50</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Revenu potentiel :</span>
                            <span className="font-bold text-primary">
                              Ar {(form.watch("price") * 50).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-amber-600 dark:text-amber-400/70 mt-2">
                            Basé sur la moyenne des nouveaux cours sur notre
                            plateforme
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    className="w-full h-16 rounded-xl bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50"
                    disabled={
                      createCourse.isPending ||
                      titleLength < 5 ||
                      descriptionLength < 20
                    }
                  >
                    {createCourse.isPending ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin"></div>
                        <span className="text-lg">Création en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Rocket className="w-6 h-6" />
                        <span className="text-lg">
                          Lancer Mon Cours Maintenant !
                        </span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    )}
                  </Button>

                  {/* Requirements Check */}
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    <div className="flex flex-wrap justify-center gap-4">
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          titleLength >= 5
                            ? "text-success dark:text-green-400"
                            : "text-muted-foreground"
                        )}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Titre valide ({titleLength}/5)</span>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          descriptionLength >= 20
                            ? "text-success dark:text-green-400"
                            : "text-muted-foreground"
                        )}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Description valide ({descriptionLength}/20)</span>
                      </div>
                      <div className="flex items-center gap-1 text-success dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Prix défini</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Success Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="mt-8"
                >
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white rounded-2xl p-6">
                    <div className="flex items-start gap-4">

                      <div>
                        <h3 className="text-xl font-bold mb-3">
                          Votre Prochaine Étape Vers le Succès
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <span className="text-sm text-gray-200">
                              Ajoutez des leçons engageantes (vidéos, articles,
                              quiz)
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <span className="text-sm text-gray-200">
                              Créez des exercices pratiques pour renforcer
                              l'apprentissage
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <span className="text-sm text-gray-200">
                              Partagez votre cours sur les réseaux sociaux
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <span className="text-sm text-gray-200">
                              Répondez aux questions des étudiants rapidement
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-sm text-gray-300">
                            <Heart className="w-4 h-4 inline mr-1 text-primary" />
                            <span className="font-semibold">
                              Fait avec passion :
                            </span>{" "}
                            Les meilleurs cours viennent du cœur. Partagez ce
                            que vous aimez et inspirez les autres à apprendre.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Final Inspiration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Globe className="w-5 h-5" />
            <span className="text-sm">
              Votre cours sera disponible partout{" "}
              <span className="font-semibold text-primary">à Madagascar</span>{" "}
              et touchera des milliers d'apprenants passionnés.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
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
import { useForm } from "react-hook-form";
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
            background: "linear-gradient(135deg, #feba45 0%, #ff9e1f 100%)",
            color: "white",
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
            background: "#ef4444",
            color: "white",
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
    <div className="min-h-screen  p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
            <div className="text-2xl font-bold text-[#feba45]">85%</div>
            <div className="text-sm text-gray-600">Taux de satisfaction</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
            <div className="text-2xl font-bold text-[#feba45]">3x</div>
            <div className="text-sm text-gray-600">Plus de visibilité</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
            <div className="text-2xl font-bold text-[#feba45]">24h</div>
            <div className="text-sm text-gray-600">Support premium</div>
          </div>
        </motion.div>

        <Card className="border-0 pt-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-r pt-6 from-[#feba45] via-[#ff9e1f] to-[#feba45] text-white py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    🌟 Créer Votre Chef-d'Œuvre Éducatif
                  </CardTitle>
                  <CardDescription className="text-white/90 text-base mt-2">
                    Démarrez votre voyage vers l'impact et le succès
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-none text-sm py-2 px-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Édition Premium</span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8">
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
                      <div className="w-3 h-8 bg-linear-to-r from-[#feba45] to-[#ff9e1f] rounded-full"></div>
                      <FormLabel className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#feba45]" />
                        Titre Perçant
                      </FormLabel>
                    </div>
                    <Badge
                      variant="outline"
                      className={`border-[#feba45] ${
                        titleLength >= 5 ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {titleLength}/5
                    </Badge>
                  </div>

                  <div className="relative group">
                    <FormControl>
                      <Input
                        type="text"
                        className="h-14 text-lg pl-12 pr-4 border-2 border-gray-300 focus:border-[#feba45] focus:ring-4 focus:ring-[#feba45]/20 transition-all duration-300 group-hover:border-[#feba45]/50"
                        {...form.register("title")}
                        placeholder="Ex: Maîtriser React en 30 jours - De Zéro à Héros"
                      />
                    </FormControl>
                    <BookText className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-[#feba45] transition-colors" />

                    {/* Validation Indicator */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          titleLength >= 5
                            ? "bg-green-500 animate-pulse"
                            : "bg-gray-300"
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Guide Card */}
                  <div className="bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="font-semibold text-blue-800 mb-1">
                          💡 Pourquoi c'est crucial ?
                        </p>
                        <p className="text-sm text-blue-700">
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
                      <div className="w-3 h-8 bg-linear-to-r from-[#feba45] to-[#ff9e1f] rounded-full"></div>
                      <FormLabel className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BookText className="w-5 h-5 text-[#feba45]" />
                        Histoire Captivante
                      </FormLabel>
                    </div>
                    <Badge
                      variant="outline"
                      className={`border-[#feba45] ${
                        descriptionLength >= 20
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {descriptionLength}/20
                    </Badge>
                  </div>

                  <div className="relative group">
                    <FormControl>
                      <Textarea
                        className="min-h-[180px] text-lg p-6 border-2 border-gray-300 focus:border-[#feba45] focus:ring-4 focus:ring-[#feba45]/20 transition-all duration-300 group-hover:border-[#feba45]/50 resize-none"
                        {...form.register("description")}
                        placeholder={`🎯 Ce que vos étudiants vont accomplir :
• Acquérir des compétences pratiques et mesurables
• Résoudre des problèmes concrets de l'industrie
• Construire un portfolio impressionnant
• Gagner en confiance et autonomie

🌟 Votre valeur unique :
Quelle expérience ou expertise exclusive apportez-vous ?
Comment votre approche diffère-t-elle des autres cours ?`}
                      />
                    </FormControl>

                    {/* Word Count */}
                    <div className="absolute bottom-4 right-4">
                      <Badge variant="secondary" className="bg-white shadow-sm">
                        {descriptionLength} caractères
                      </Badge>
                    </div>
                  </div>

                  {/* Success Story */}
                  <div className="bg-linear-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-800 mb-1">
                          🏆 Histoire de réussite
                        </p>
                        <p className="text-sm text-emerald-700">
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
                      <div className="w-3 h-8 bg-linear-to-r from-[#feba45] to-[#ff9e1f] rounded-full"></div>
                      <FormLabel className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Gem className="w-5 h-5 text-[#feba45]" />
                        Valorisez Votre Expertise
                      </FormLabel>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-[#feba45] text-[#feba45]"
                    >
                      Prix flexible
                    </Badge>
                  </div>

                  {/* Quick Price Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => form.setValue("price", 0)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        form.watch("price") === 0
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${
                            form.watch("price") === 0
                              ? "text-green-600"
                              : "text-gray-700"
                          }`}
                        >
                          Gratuit
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Parfait pour démarrer
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
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
                      className={`p-6 rounded-xl border-2 transition-all ${
                        form.watch("price") === 19900
                          ? "border-[#feba45] bg-linear-to-r from-[#feba45]/5 to-[#ff9e1f]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${
                            form.watch("price") === 19900
                              ? "text-[#feba45]"
                              : "text-gray-700"
                          }`}
                        >
                          Ar 19,900
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Prix populaire
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
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
                      className={`p-6 rounded-xl border-2 transition-all ${
                        form.watch("price") === 49900
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${
                            form.watch("price") === 49900
                              ? "text-purple-600"
                              : "text-gray-700"
                          }`}
                        >
                          Ar 49,900
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Valeur premium
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
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
                      <span className="text-2xl font-bold text-gray-500">
                        Ar
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-14 text-2xl pl-12 pr-4 border-2 border-gray-300 focus:border-[#feba45] focus:ring-4 focus:ring-[#feba45]/20 transition-all duration-300"
                        {...form.register("price", { valueAsNumber: true })}
                        placeholder="0"
                        min="0"
                        step="100"
                      />
                    </FormControl>
                    <div className="absolute inset-y-0 right-4 flex items-center">
                      <WalletIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-700">
                      Valeur actuelle :{" "}
                      <span className="text-2xl font-bold text-[#feba45]">
                        Ar {form.watch("price").toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {form.watch("price") === 0
                        ? "📢 Cours gratuit - Excellent pour la visibilité !"
                        : form.watch("price") < 10000
                        ? "💰 Prix accessible - Parfait pour commencer"
                        : "💎 Prix premium - Votre expertise vaut chaque Ariary"}
                    </div>
                  </div>

                  {/* Revenue Calculator */}
                  <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800 mb-2">
                          📈 Calculateur de Revenu Potentiel
                        </p>
                        <div className="text-sm text-amber-700 space-y-1">
                          <div className="flex justify-between">
                            <span>Étudiants potentiels (mois 1) :</span>
                            <span className="font-bold">50</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Revenu potentiel :</span>
                            <span className="font-bold text-[#feba45]">
                              Ar {(form.watch("price") * 50).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-amber-600 mt-2">
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
                    className="w-full h-16 rounded-xl bg-linear-to-r from-[#feba45] via-[#ff9e1f] to-[#feba45] text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50"
                    disabled={
                      createCourse.isPending ||
                      titleLength < 5 ||
                      descriptionLength < 20
                    }
                  >
                    {createCourse.isPending ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
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
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <div className="flex flex-wrap justify-center gap-4">
                      <div
                        className={`flex items-center gap-1 ${
                          titleLength >= 5 ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Titre valide ({titleLength}/5)</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          descriptionLength >= 20
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Description valide ({descriptionLength}/20)</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
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
                  <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-linear-to-r from-[#feba45] to-[#ff9e1f] rounded-xl flex items-center justify-center shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-3">
                          🎯 Votre Prochaine Étape Vers le Succès
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-[#feba45] rounded-full mt-2"></div>
                            <span className="text-sm">
                              Ajoutez des leçons engageantes (vidéos, articles,
                              quiz)
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-[#feba45] rounded-full mt-2"></div>
                            <span className="text-sm">
                              Créez des exercices pratiques pour renforcer
                              l'apprentissage
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-[#feba45] rounded-full mt-2"></div>
                            <span className="text-sm">
                              Partagez votre cours sur les réseaux sociaux
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-[#feba45] rounded-full mt-2"></div>
                            <span className="text-sm">
                              Répondez aux questions des étudiants rapidement
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-sm text-gray-300">
                            <Heart className="w-4 h-4 inline mr-1 text-[#feba45]" />
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
          <div className="inline-flex items-center gap-2 text-gray-600">
            <Globe className="w-5 h-5" />
            <span className="text-sm">
              Votre cours sera disponible partout{" "}
              <span className="font-semibold text-[#feba45]">à Madagascar</span>{" "}
              et touchera des milliers d'apprenants passionnés.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

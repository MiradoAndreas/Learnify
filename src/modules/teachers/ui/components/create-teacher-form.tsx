"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  Star,
  User,
  Briefcase,
  Award,
  Mail,
  Clock,
  Shield,
  School2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { TrainerApplicationInput, trainerApplicationSchema } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import Logo from "@/modules/landing/ui/components/navbar/Logo";
import Image from "next/image";

const steps = [
  {
    title: "Informations",
    description: "Vos coordonnées",
    icon: User,
    color: "#feba45",
  },
  {
    title: "Expérience",
    description: "Votre parcours",
    icon: Briefcase,
    color: "#ff9a3c",
  },
  {
    title: "Expertise",
    description: "Vos compétences",
    icon: Award,
    color: "#ff7b2c",
  },
];

const ORANGE_PRIMARY = "#feba45";
const ORANGE_SECONDARY = "#ff9a3c";
const ORANGE_TERTIARY = "#ff7b2c";
const ORANGE_LIGHT = "#fff5e6";
const ORANGE_DARK = "#e6a93d";

export function CreateTeacherForm() {
  const router = useRouter();
  const trpc = useTRPC();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TrainerApplicationInput>({
    resolver: zodResolver(trainerApplicationSchema),
    defaultValues: {
      skills: [],
    },
  });

  const createAccount = useMutation(
    trpc.teacher.createAccount.mutationOptions({
      onSuccess: () => {
        toast.success(" Candidature envoyée !", {
          style: {
            background: "#feba45",
            color: "white",
            border: "none",
          },
          duration: 5000,
        });
        router.push("/teacher/pending");
      },
      onError: (err: any) => {
        toast.error(" Erreur", {
          description:
            err?.message || "Impossible de soumettre la candidature.",
        });
        setIsSubmitting(false);
      },
    })
  );

  const onSubmit = async (data: TrainerApplicationInput) => {
    setIsSubmitting(true);
    createAccount.mutate(data);
  };

  const nextStep = async () => {
    const fields =
      steps[step].title === "Informations"
        ? ["fullName", "profession"]
        : steps[step].title === "Expérience"
        ? ["experience", "bio"]
        : ["skills"];

    const isValid = await form.trigger(fields as any);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50 via-white to-amber-50 py-4 md:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header avec animation - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8 px-2"
        >
          <div className="w-full flex justify-center">
            <Image
              src="/logos/logo-miranga.png"
              width={200}
              height={60}
              alt="logo"
              className="w-40 sm:w-48 md:w-56 object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-[#feba45] to-[#ff7b2c] bg-clip-text text-transparent mb-2 px-2">
            Devenir Professeur
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto px-2">
            Rejoignez notre communauté d&apos;experts et partagez votre savoir
            avec passion
          </p>
        </motion.div>

        {/* Steps indicator - Mobile friendly */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 md:mb-8 px-2"
        >
          <Card className="border-0 pt-0 shadow-lg rounded-2xl overflow-hidden bg-white/95">
            <CardContent className="p-4 sm:p-6">
              {/* Steps pour desktop */}
              <div className="hidden md:flex justify-between items-center mb-6">
                {steps.map((s, index) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.title} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className="flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 relative"
                          style={{
                            backgroundColor:
                              index <= step ? s.color : "transparent",
                            borderColor: index <= step ? s.color : "#d1d5db",
                            color: index <= step ? "white" : "#9ca3af",
                            transform:
                              index === step ? "scale(1.1)" : "scale(1)",
                            boxShadow:
                              index === step
                                ? `0 0 0 4px ${s.color}20`
                                : "none",
                          }}
                        >
                          {index < step ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <span
                          className="text-xs mt-2 font-medium text-center"
                          style={{
                            color: index <= step ? "#111827" : "#6b7280",
                          }}
                        >
                          {s.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className="h-1 w-12 mx-2 transition-all duration-300"
                          style={{
                            background:
                              index < step
                                ? `linear-gradient(to right, ${
                                    steps[index].color
                                  }, ${steps[index + 1].color})`
                                : "#e5e7eb",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Steps pour mobile */}
              <div className="md:hidden mb-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: ORANGE_PRIMARY,
                        color: "white",
                        transform: step === 0 ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {step === 0 ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Étape {step + 1} sur {steps.length}
                      </p>
                      <p className="text-xs text-gray-600">
                        {steps[step].title}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className="px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: `${ORANGE_PRIMARY}20`,
                      color: ORANGE_DARK,
                      borderColor: `${ORANGE_PRIMARY}40`,
                    }}
                  >
                    {Math.round(progress)}%
                  </Badge>
                </div>
              </div>

              <Progress
                value={progress}
                className="h-2 bg-red-500"
                style={{
                  background: `linear-gradient(90deg, ${ORANGE_PRIMARY}20, ${ORANGE_SECONDARY}20)`,
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Form content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white/95 mx-2 sm:mx-0">
              <CardHeader
                className="border-b p-4 sm:p-6"
                style={{
                  background: `linear-gradient(135deg, ${ORANGE_LIGHT}, white)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: `${ORANGE_PRIMARY}15`,
                    }}
                  >
                    {(() => {
                      const Icon = steps[step].icon;
                      return (
                        <Icon
                          className="h-5 w-5 sm:h-6 sm:w-6"
                          style={{ color: steps[step].color }}
                        />
                      );
                    })()}
                  </div>
                  <div>
                    <CardTitle
                      className="text-xl sm:text-2xl"
                      style={{ color: ORANGE_DARK }}
                    >
                      {steps[step].title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm sm:text-base">
                      {steps[step].description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Étape 1 - Informations */}
                  {step === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div className="space-y-3">
                        <Label className="text-gray-800 font-medium flex items-center gap-2 text-sm sm:text-base">
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: `${ORANGE_PRIMARY}20` }}
                          >
                            <User
                              className="h-3 w-3 sm:h-4 sm:w-4"
                              style={{ color: ORANGE_PRIMARY }}
                            />
                          </div>
                          Nom complet
                        </Label>
                        <Input
                          placeholder="Ex: John Doe"
                          {...form.register("fullName")}
                          className="h-11 sm:h-12 border-gray-300 focus:border-orange-400 focus:ring-orange-400 transition-all text-sm sm:text-base"
                          style={{
                            borderColor: form.formState.errors.fullName
                              ? "#ef4444"
                              : undefined,
                          }}
                        />
                        {form.formState.errors.fullName && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs sm:text-sm flex items-center gap-1"
                          >
                            ⚠️ {form.formState.errors.fullName.message}
                          </motion.p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-gray-800 font-medium flex items-center gap-2 text-sm sm:text-base">
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: `${ORANGE_PRIMARY}20` }}
                          >
                            <Briefcase
                              className="h-3 w-3 sm:h-4 sm:w-4"
                              style={{ color: ORANGE_PRIMARY }}
                            />
                          </div>
                          Profession
                        </Label>
                        <Input
                          placeholder="Ex: Développeur Full-Stack Senior"
                          {...form.register("profession")}
                          className="h-11 sm:h-12 border-gray-300 focus:border-orange-400 focus:ring-orange-400 transition-all text-sm sm:text-base"
                          style={{
                            borderColor: form.formState.errors.profession
                              ? "#ef4444"
                              : undefined,
                          }}
                        />
                        {form.formState.errors.profession && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs sm:text-sm flex items-center gap-1"
                          >
                            ⚠️ {form.formState.errors.profession.message}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Étape 2 - Expérience */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div className="space-y-3">
                        <Label className="text-gray-800 font-medium flex items-center gap-2 text-sm sm:text-base">
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: `${ORANGE_SECONDARY}20` }}
                          >
                            <Award
                              className="h-3 w-3 sm:h-4 sm:w-4"
                              style={{ color: ORANGE_SECONDARY }}
                            />
                          </div>
                          Expérience professionnelle
                        </Label>
                        <Textarea
                          placeholder="Décrivez votre parcours, vos réalisations, votre expérience dans l'enseignement..."
                          {...form.register("experience")}
                          className="min-h-[100px] sm:min-h-[120px] border-gray-300 focus:border-orange-400 focus:ring-orange-400 transition-all resize-none text-sm sm:text-base"
                          style={{
                            borderColor: form.formState.errors.experience
                              ? "#ef4444"
                              : undefined,
                          }}
                        />
                        {form.formState.errors.experience && (
                          <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                            ⚠️ {form.formState.errors.experience.message}
                          </p>
                        )}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Conseillé : 200-500 caractères</span>
                          <span>
                            {form.watch("experience")?.length || 0} caractères
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-gray-800 font-medium flex items-center gap-2 text-sm sm:text-base">
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: `${ORANGE_SECONDARY}20` }}
                          >
                            <Mail
                              className="h-3 w-3 sm:h-4 sm:w-4"
                              style={{ color: ORANGE_SECONDARY }}
                            />
                          </div>
                          Bio courte
                        </Label>
                        <Textarea
                          placeholder="Présentez-vous en quelques mots, votre passion, votre approche pédagogique..."
                          {...form.register("bio")}
                          className="min-h-[80px] sm:min-h-[100px] border-gray-300 focus:border-orange-400 focus:ring-orange-400 transition-all resize-none text-sm sm:text-base"
                          style={{
                            borderColor: form.formState.errors.bio
                              ? "#ef4444"
                              : undefined,
                          }}
                        />
                        {form.formState.errors.bio && (
                          <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                            ⚠️ {form.formState.errors.bio.message}
                          </p>
                        )}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Maximum 300 caractères</span>
                          <span>{form.watch("bio")?.length || 0}/300</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Étape 3 - Expertise */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div className="space-y-3">
                        <Label className="text-gray-800 font-medium flex items-center gap-2 text-sm sm:text-base">
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: `${ORANGE_TERTIARY}20` }}
                          >
                            <Award
                              className="h-3 w-3 sm:h-4 sm:w-4"
                              style={{ color: ORANGE_TERTIARY }}
                            />
                          </div>
                          Compétences
                        </Label>
                        <Input
                          placeholder="Ex: React, TypeScript, DevOps, UX Design, Python"
                          onChange={(e) =>
                            form.setValue(
                              "skills",
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                                .slice(0, 5)
                            )
                          }
                          className="h-11 sm:h-12 border-gray-300 focus:border-orange-400 focus:ring-orange-400 transition-all text-sm sm:text-base"
                          style={{
                            borderColor: form.formState.errors.skills
                              ? "#ef4444"
                              : undefined,
                          }}
                        />
                        {form.formState.errors.skills && (
                          <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                            ⚠️ {form.formState.errors.skills.message}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-600">
                          Séparez par des virgules • Max 5 compétences
                        </p>
                      </div>

                      {/* Skills preview */}
                      {form.watch("skills")?.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          <p className="text-sm text-gray-600 font-medium">
                            Vos compétences :
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {form.watch("skills").map((skill, index) => (
                              <Badge
                                key={index}
                                className="px-3 py-1.5 rounded-full font-medium text-xs sm:text-sm transition-all hover:scale-105"
                                style={{
                                  background: `linear-gradient(135deg, ${ORANGE_PRIMARY}, ${ORANGE_SECONDARY})`,
                                  color: "white",
                                  border: "none",
                                }}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            {form.watch("skills").length}/5 compétences
                            sélectionnées
                          </p>
                        </motion.div>
                      )}

                      {/* Info box */}
                      <div
                        className="p-3 sm:p-4 rounded-xl border text-sm"
                        style={{
                          backgroundColor: `${ORANGE_PRIMARY}08`,
                          borderColor: `${ORANGE_PRIMARY}30`,
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            <Shield
                              className="h-4 w-4"
                              style={{ color: ORANGE_PRIMARY }}
                            />
                          </div>
                          <div className="space-y-1">
                            <p
                              className="font-medium"
                              style={{ color: ORANGE_DARK }}
                            >
                              Processus de vérification
                            </p>
                            <p className="text-gray-700 text-xs sm:text-sm">
                              Notre équipe examine chaque candidature avec
                              attention pour maintenir la qualité de notre
                              communauté d&apos;experts.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock
                            className="h-4 w-4"
                            style={{ color: ORANGE_PRIMARY }}
                          />
                          <span className="font-medium">
                            À quoi s'attendre ?
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm">
                          <div className="flex-1 p-3 rounded-lg bg-orange-50">
                            <div
                              className="font-medium mb-1"
                              style={{ color: ORANGE_DARK }}
                            >
                              1. Soumission
                            </div>
                            <div className="text-gray-600">
                              Candidature envoyée instantanément
                            </div>
                          </div>
                          <div className="flex-1 p-3 rounded-lg bg-orange-50">
                            <div
                              className="font-medium mb-1"
                              style={{ color: ORANGE_DARK }}
                            >
                              2. Revue
                            </div>
                            <div className="text-gray-600">
                              Examen sous 1h maximum
                            </div>
                          </div>
                          <div className="flex-1 p-3 rounded-lg bg-orange-50">
                            <div
                              className="font-medium mb-1"
                              style={{ color: ORANGE_DARK }}
                            >
                              3. Démarrage
                            </div>
                            <div className="text-gray-600">
                              Accès à la plateforme si accepté
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation buttons - Responsive */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between gap-3 pt-4 sm:pt-6 border-t mt-6 sm:mt-8"
                  >
                    <div className="flex flex-col sm:flex-row gap-3">
                      {step > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={createAccount.isPending}
                          className="h-11 sm:h-12 border-gray-300 hover:border-orange-400 hover:text-orange-600 transition-all flex-1 sm:flex-none"
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          <span className="text-sm sm:text-base">Retour</span>
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {step < steps.length - 1 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={createAccount.isPending}
                          className="h-11 sm:h-12 transition-all flex-1 group"
                          style={{
                            background: `linear-gradient(135deg, ${ORANGE_PRIMARY}, ${ORANGE_SECONDARY})`,
                            color: "white",
                          }}
                        >
                          <span className="text-sm sm:text-base">
                            Continuer
                          </span>
                          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={createAccount.isPending || isSubmitting}
                          className="h-11 sm:h-12 transition-all flex-1 group"
                          style={{
                            background: `linear-gradient(135deg, ${ORANGE_SECONDARY}, ${ORANGE_TERTIARY})`,
                            color: "white",
                            boxShadow: "0 4px 14px 0 rgba(254, 186, 69, 0.4)",
                          }}
                        >
                          {createAccount.isPending || isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              <span className="text-sm sm:text-base">
                                Envoi en cours...
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              <span className="text-sm sm:text-base">
                                Soumettre ma candidature
                              </span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Footer responsive */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 sm:mt-8 px-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-orange-100">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="h-4 w-4" style={{ color: ORANGE_PRIMARY }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: ORANGE_DARK }}
                >
                  Sécurisé
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Vos données sont protégées
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-orange-100">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4" style={{ color: ORANGE_PRIMARY }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: ORANGE_DARK }}
                >
                  Rapide
                </span>
              </div>
              <p className="text-xs text-gray-600">Réponse sous 1h max</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-orange-100">
              <div className="flex items-center justify-center gap-2 mb-1">
                <School2Icon
                  className="h-4 w-4"
                  style={{ color: ORANGE_PRIMARY }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: ORANGE_DARK }}
                >
                  Formation gratuit
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Accès aux formations professeur
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-500">
            En soumettant cette candidature, vous acceptez nos{" "}
            <a
              href="/terms"
              className="font-medium hover:underline"
              style={{ color: ORANGE_PRIMARY }}
            >
              conditions d&apos;utilisation
            </a>{" "}
            et notre{" "}
            <a
              href="/privacy"
              className="font-medium hover:underline"
              style={{ color: ORANGE_PRIMARY }}
            >
              politique de confidentialité
            </a>
            .
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © {new Date().getFullYear()} Professeurs Premium • Tous droits
            réservés
          </p>
        </motion.div>
      </div>
    </div>
  );
}

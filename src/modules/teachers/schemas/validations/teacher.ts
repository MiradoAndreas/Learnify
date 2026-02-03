import { z } from "zod";

// Schéma de base pour les dates
export const dateStringSchema = z.string().refine((date) => {
  return !isNaN(Date.parse(date));
}, "Date invalide");

// Éducation
export const educationSchema = z.object({
  institution: z.string().min(2, "Le nom de l'institution est requis"),
  degree: z.string().optional(),
  fieldOfStudy: z.string().min(2, "Le domaine d'étude est requis"),
  startDate: dateStringSchema,
  endDate: dateStringSchema.optional().or(z.literal("")),
});

// Expérience professionnelle
export const workExperienceSchema = z.object({
  company: z.string().min(2, "Le nom de l'entreprise est requis"),
  position: z.string().min(2, "Le poste est requis"),
  description: z.string().optional(),
  startDate: dateStringSchema,
  endDate: dateStringSchema.optional().or(z.literal("")),
  currentJob: z.boolean().default(false),
});

// Schéma principal d'application
export const teacherApplicationSchema = z.object({
  // Informations de base
  professionalTitle: z.string().min(2, "Le titre professionnel est requis"),
  yearsExperience: z.coerce.number().min(0).max(60),
  hourlyRate: z.coerce.number().min(0).optional().nullish(),

  // Profil
  headline: z.string().min(10, "Le titre doit faire au moins 10 caractères"),
  bio: z.string().min(100, "La biographie doit faire au moins 100 caractères"),
  teachingPhilosophy: z.string().optional().nullish(),

  // Parcours
  professionalBackground: z
    .string()
    .min(200, "Décrivez votre parcours en détail"),
  teachingExperience: z
    .string()
    .min(100, "Décrivez votre expérience pédagogique"),

  // Compétences
  expertiseAreas: z
    .array(z.string())
    .min(1, "Sélectionnez au moins un domaine d'expertise"),
  skills: z.array(z.string()).min(3, "Indiquez au moins 3 compétences"),
  certifications: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).default(["French"]),

  // Préférences
  availability: z.enum(["full_time", "part_time", "flexible"]),
  maxStudents: z.coerce.number().min(1).optional().nullish(),

  // Liens
  websiteUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),

  // Formations et expériences
  education: z.array(educationSchema).optional().default([]),
  workExperience: z.array(workExperienceSchema).optional().default([]),

  // Conditions
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions",
  }),
});

export type TeacherApplicationInput = z.infer<typeof teacherApplicationSchema>;

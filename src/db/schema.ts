import { group } from "console";
import { ca, te } from "date-fns/locale";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";
import { tsvector } from "@/db/index";
import {
  pgTable,
  text,
  
  timestamp,
  boolean,
  index,
  uuid,
  integer,
  jsonb,
  pgEnum,
  decimal,
  varchar,
  serial,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  imageKey: text("image_key"),
  isAdmin: boolean("is_admin"),

   // Ajoutez ces champs pour les informations supplémentaires
   firstName: text("first_name"),
   lastName: text("last_name"),
   phone: text("phone"),
   bio: text("bio"),
   location: text("location"),
   website: text("website"),

    // Réseaux sociaux
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  instagramUrl: text("instagram_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
export const userInsertSchema = createInsertSchema(user);
export const userUpdateSchema = createUpdateSchema(user);
export const userSelectSchema = createSelectSchema(user);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  trainerProfile: many(trainerProfiles),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
export const trainerStatusEnum = pgEnum("trainer_status", [
  "pending",
  "error",
  "success",
]);

export const trainerProfiles = pgTable(
  "trainer_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    profession: text("profession").notNull(),
    experience: text("experience").notNull(),
    bio: text("bio").notNull(),
    skills: text("skills").array().notNull(),
    status: trainerStatusEnum("status").notNull().default("pending"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => ({
    userIdx: index("trainer_profiles_user_id_idx").on(table.userId),
    statusIdx: index("trainer_profiles_status_idx").on(table.status),
  })
);

export const trainerProfilesRelations = relations(
  trainerProfiles,
  ({ one }) => ({
    user: one(user, {
      fields: [trainerProfiles.userId],
      references: [user.id],
    }),
  })
);

export const trainerApplicationSchema = z.object({
  fullName: z.string().min(3).max(100),
  profession: z.string().min(2).max(100),
  experience: z.string().min(10).max(300),
  bio: z.string().min(20).max(500),
  skills: z.array(z.string().min(2).max(30)).min(1).max(5),
});
export const trainerProfileInsertSchema = createInsertSchema(
  trainerProfiles
).omit({
  id: true,
  status: true,
  createdAt: true,
  reviewedAt: true,
});

export type TrainerApplicationInput = z.infer<typeof trainerApplicationSchema>;

export const courseLevelEnum = pgEnum("course_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const courseCategories = pgTable("course_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  group: text("group").default("Other"),
});



export const courseStatusEnum = pgEnum("course_status", ["draft", "published"]);
export const courseLanguageEnum = pgEnum("course_language", ["fr", "mg", "en"]);

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: uuid("trainer_id")
    .notNull()
    .references(() => trainerProfiles.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  description: text("description").notNull(),
  level: courseLevelEnum("level").default("beginner"),
  language: courseLanguageEnum("language").default("mg"),

  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),

  price: integer("price").default(0).notNull(), // en cents
  status: courseStatusEnum("status").default("draft").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  unpublishedAt: timestamp("unpublished_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

   
    
});

export const courseInsertSchema = createInsertSchema(courses);
export const courseUpdateSchema = createUpdateSchema(courses);
export const courseSelectSchema = createSelectSchema(courses);

export const lessonVisibilityEnum = pgEnum("lesson_visibility", [
  "free",
  "paid",
]);

export const courseSections = pgTable("course_sections", {
  id: uuid("id").primaryKey().defaultRandom(),

  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  position: integer("position").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseLessons = pgTable("course_lessons", {
  id: uuid("id").primaryKey().defaultRandom(),

  sectionId: uuid("section_id")
    .notNull()
    .references(() => courseSections.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  description: text("description").notNull(),

  muxStatus: text("mux_status"),
  muxAssetId: text("mux_asset_id").unique(),
  muxUploadId: text("mux_upload_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  previewUrl: text("preview_url"),
  previewKey: text("preview_key"),

  duration: integer("duration").default(0).notNull(),

  visibility: lessonVisibilityEnum("visibility").default("paid").notNull(),

  isPublished: boolean("is_published").default(false).notNull(),

  position: integer("position").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseRelations = relations(courses, ({ many, one }) => ({
  trainer: one(trainerProfiles, {
    fields: [courses.trainerId],
    references: [trainerProfiles.id],
  }),
  sections: many(courseSections),
  categories: many(courseCategories),
  requirements: many(courseREquirements),
  objectives: many(courseLearningObjectives),
}));

export const courseSectionRelations = relations(
  courseSections,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [courseSections.courseId],
      references: [courses.id],
    }),
    lessons: many(courseLessons),
  })
);

export const courseLessonRelations = relations(
  courseLessons,
  ({ one, many }) => ({
    section: one(courseSections, {
      fields: [courseLessons.sectionId],
      references: [courseSections.id],
    }),
    attachments: many(lessonAttachments),
  })
);

export const createCourseSchema = z.object({
  title: z.string().min(5, "Title is required"),
  description: z.string().min(20, "Description is required"),
  price: z.number().min(0, "Price is required"),
});

export const createSectionSchema = z.object({
  courseId: z.uuid(),
  title: z.string().min(3),
});

export const createLessonSchema = z.object({
  sectionId: z.uuid(),
  title: z.string().min(3),
  visibility: z.enum(["free", "paid"]),
});

export const courseCategoryRelations = pgTable(
  "course_category_relations",
  {
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => courseCategories.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.courseId, t.categoryId] }),
  })
);

export const courseREquirements = pgTable("course_requirements", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
});

export const updateCourseDetailsSchema = z.object({
  id: z.uuid(),

  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  language: z.enum(["fr", "mg", "en"]).optional(),
  categoryId: z.uuid().optional(),
});

export const updateCourseSettingsSchema = z.object({
  id: z.uuid(),

  // Infos principales
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  price: z.number().min(0).optional(),

  // Métadonnées pédagogiques
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  language: z.enum(["fr", "mg", "en"]).optional(),
  categoryId: z.uuid().optional(),
});
export const courseLearningObjectives = pgTable(
  "course_learning_objectives",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    position: integer("position"),
  },
  (t) => ({
    uniquePosition: unique().on(t.courseId, t.position),
  })
);

export const courseTargetAudiences = pgTable("course_target_audiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
});

export const courseAttachments = pgTable("course_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),

  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),

  name: text("name").notNull(), // Nom original
  attachmentUrl: text("attachment_url").notNull(), // url UploadThing
  attachmentKey: text("attachment_key").notNull(), // key UploadThing (CRUCIAL)
  type: text("type").notNull(), // pdf, zip, docx...
  size: integer("size").notNull(), // en bytes

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lessonAttachments = pgTable("lesson_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),

  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => courseLessons.id, { onDelete: "cascade" }),

  name: text("name").notNull(), // Nom original du fichier
  attachmentUrl: text("attachment_url").notNull(), // URL UploadThing
  attachmentKey: text("attachment_key").notNull(), // Clé UploadThing (unique)
  type: text("type").notNull(), // pdf, docx, pptx, zip, image, etc.
  size: integer("size").notNull(), // Taille en bytes

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Schémas de validation
export const lessonAttachmentInsertSchema =
  createInsertSchema(lessonAttachments);
export const lessonAttachmentUpdateSchema =
  createUpdateSchema(lessonAttachments);
export const lessonAttachmentSelectSchema =
  createSelectSchema(lessonAttachments);

export const lessonAttachmentRelations = relations(
  lessonAttachments,
  ({ one }) => ({
    lesson: one(courseLessons, {
      fields: [lessonAttachments.lessonId],
      references: [courseLessons.id],
    }),
  })
);

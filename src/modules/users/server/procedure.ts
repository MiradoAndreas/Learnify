// trpc/routers/user-router.ts
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "@/db";
import { 
  user, 
  trainerProfiles,
  courses,
  userUpdateSchema,
} from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { UTApi } from "uploadthing/server";


export const userRouter = createTRPCRouter({
  // Récuperer le profile utilisateur
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;
    
    const [userProfile] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        bio: user.bio,
        imageKey: user.imageKey,
        location: user.location,
        website: user.website,
        facebookUrl: user.facebookUrl,
        twitterUrl: user.twitterUrl,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        instagramUrl: user.instagramUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur non trouvé",
      });
    }

    console.log("📋 Profil récupéré:", { 
      id: userProfile?.id, 
      image: userProfile?.image,
      imageKey: userProfile?.imageKey 
    });

    return userProfile;
  }),

   // Mettre à jour les informations de base
   updateBasicInfo: protectedProcedure
   .input(
     userUpdateSchema.pick({
       firstName: true,
       lastName: true,
       bio: true,
       location: true,
       phone: true,
       website: true,
     })
   )
   .mutation(async ({ ctx, input }) => {
     const userId = ctx.auth.user.id;

     // Mettre à jour l'utilisateur
     const [updatedUser] = await db
       .update(user)
       .set({
         ...input,
         updatedAt: new Date(),
       })
       .where(eq(user.id, userId))
       .returning({
         id: user.id,
         firstName: user.firstName,
         lastName: user.lastName,
         bio: user.bio,
         location: user.location,
         phone: user.phone,
         website: user.website,
       });

    

     return {
       success: true,
       user: updatedUser,
     };
   }),
   // Mettre à jour les réseaux sociaux
  updateSocialLinks: protectedProcedure
  .input(
    z.object({
      facebookUrl: z.string().url().optional().nullable(),
      twitterUrl: z.string().url().optional().nullable(),
      linkedinUrl: z.string().url().optional().nullable(),
      githubUrl: z.string().url().optional().nullable(),
      instagramUrl: z.string().url().optional().nullable(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.auth.user.id;

    const [updatedUser] = await db
      .update(user)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        facebookUrl: user.facebookUrl,
        twitterUrl: user.twitterUrl,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        instagramUrl: user.instagramUrl,
      });



    return {
      success: true,
      user: updatedUser,
    };
  }),

   
   deleteAccount: protectedProcedure
   .input(
     z.object({
       confirmation: z.string().refine(
         (val) => val === "SUPPRIMER MON COMPTE",
         "Vous devez taper 'SUPPRIMER MON COMPTE' pour confirmer"
       ),
     })
   )
   .mutation(async ({ ctx }) => {
     const userId = ctx.auth.user.id;

     // Supprimer l'utilisateur (les relations seront supprimées via cascade)
     await db.delete(user).where(eq(user.id, userId));

     // Note: La déconnexion sera gérée par le frontend après suppression

     return {
       success: true,
       message: "Compte supprimé avec succès",
     };
   }),
   updateAvatar: protectedProcedure
  .input(
    z.object({
      imageUrl: z.string().url("URL d'image invalide"),
      imageKey: z.string(), // Maintenant obligatoire puisque vous stockez la clé
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.auth.user.id;
    const { imageUrl, imageKey } = input;

    // Récupérer l'utilisateur avec sa clé d'image actuelle
    const [currentUser] = await db
      .select({
        id: user.id,
        image: user.image,
        imageKey: user.imageKey,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

      console.log("📋 Utilisateur actuel:", {
        id: currentUser?.id,
        image: currentUser?.image,
        imageKey: currentUser?.imageKey,
      });

    if (!currentUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur non trouvé",
      });
    }

    // Supprimer l'ancienne image d'UploadThing si elle existe
    if (currentUser.imageKey) {
      console.log("🗑️ Tentative de suppression de l'ancienne image:", currentUser.imageKey);
      try {
        const utapi = new UTApi();
        const result = await utapi.deleteFiles(currentUser.imageKey);
        console.log("✅ Résultat suppression:", result);
        console.log(`🗑️ Ancienne image d'avatar supprimée: ${currentUser.imageKey}`);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la suppression de l'ancienne image d'avatar:",
          error
        );
        // Ajoutez plus de détails sur l'erreur
        if (error instanceof Error) {
          console.error("Message d'erreur:", error.message);
          console.error("Stack trace:", error.stack);
        }
        // Ne pas throw, on continue quand même
      }
    } else {
      console.log("ℹ️ Aucune imageKey trouvée, rien à supprimer");
    }

    // Mettre à jour l'avatar dans la base de données
    const [updatedUser] = await db
      .update(user)
      .set({
        image: imageUrl,
        imageKey: imageKey,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        image: user.image,
        imageKey: user.imageKey,
      });

    return {
      success: true,
      user: updatedUser,
      deletedOldImage: !!currentUser.imageKey,
    };
  }),

  // Supprimer l'avatar
  deleteAvatar: protectedProcedure
  .mutation(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    // Récupérer l'utilisateur avec sa clé d'image
    const [currentUser] = await db
      .select({
        id: user.id,
        image: user.image,
        imageKey: user.imageKey,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!currentUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur non trouvé",
      });
    }

    // Supprimer l'image d'UploadThing si elle existe
    if (currentUser.imageKey) {
      try {
        const utapi = new UTApi();
        await utapi.deleteFiles(currentUser.imageKey);
        console.log(`🗑️ Image d'avatar supprimée d'UploadThing: ${currentUser.imageKey}`);
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de l'image d'avatar:",
          error
        );
        // Ne pas throw, on continue quand même
      }
    }

    // Mettre à jour la base de données
    const [updatedUser] = await db
      .update(user)
      .set({
        image: null,
        imageKey: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        image: user.image,
        imageKey: user.imageKey,
      });

    return {
      success: true,
      user: updatedUser,
      deletedOldImage: !!currentUser.imageKey,
    };
  }),

  
});

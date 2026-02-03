import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { courseCategories } from "@/db/schema";
import { db } from "@/db";

dotenv.config({ path: ".env.local" });

// ==========================
// --- HELPER FUNCTIONS -----
// ==========================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function mask(value?: string) {
  if (!value) return "undefined";
  return value.slice(0, 20) + "...(hidden)";
}

async function testNeonConnection(url: string) {
  try {
    const sql = neon(url);
    await sql`SELECT NOW()`;
    console.log("✅ Neon connection successful!");
  } catch (err) {
    console.error("❌ Neon connection FAILED:", err);
  }
}

// ==========================
// --- MAIN SEED SCRIPT -----
// ==========================

async function main() {
  console.log("========== SEED CATEGORIES START ==========\n");

  // 1. Check ENV
  console.log("🔍 Checking environment variables...");
  console.log("DATABASE_URL:", mask(process.env.DATABASE_URL));

  if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL is missing in .env");
    process.exit(1);
  }

  // 2. Test raw neon connection
  console.log("\n🔍 Testing Neon connection...");
  await testNeonConnection(process.env.DATABASE_URL);

  // 3. Categories data with groups
  const categoriesWithGroups = [
    // Langues et communication
    { name: "Apprentissage du Malgache", group: "Langues" },
    { name: "Français pour Malgaches", group: "Langues" },
    { name: "Anglais des Affaires", group: "Langues" },
    { name: "Communication Professionnelle", group: "Langues" },
    { name: "Traduction et Interprétation", group: "Langues" },

    // Culture et traditions
    { name: "Culture Malgache", group: "Culture" },
    { name: "Histoire de Madagascar", group: "Culture" },
    { name: "Artisanat Traditionnel", group: "Culture" },
    { name: "Patrimoine Culturel", group: "Culture" },
    { name: "Coutumes et Traditions", group: "Culture" },

    // Économie et entrepreneuriat
    { name: "Entrepreneuriat Local", group: "Business" },
    { name: "Agriculture et Élevage", group: "Business" },
    { name: "Tourisme et Écotourisme", group: "Business" },
    { name: "Commerce International", group: "Business" },
    { name: "Gestion de Micro-entreprise", group: "Business" },
    { name: "Marketing Digital Local", group: "Business" },
    { name: "Finance et Comptabilité", group: "Business" },
    { name: "Management d'Équipe", group: "Business" },

    // Technologies numériques
    { name: "Informatique de Base", group: "Technologie" },
    { name: "Développement Web", group: "Technologie" },
    { name: "Développement Mobile", group: "Technologie" },
    { name: "Programmation Python", group: "Technologie" },
    { name: "Graphisme et Design", group: "Technologie" },
    { name: "Montage Vidéo", group: "Technologie" },
    { name: "Infographie", group: "Technologie" },
    { name: "Bureautique Avancée", group: "Technologie" },
    { name: "Sécurité Informatique", group: "Technologie" },

    // Éducation et formation
    { name: "Pédagogie Moderne", group: "Éducation" },
    { name: "Formation des Formateurs", group: "Éducation" },
    { name: "Éducation en Ligne", group: "Éducation" },
    { name: "Coaching Scolaire", group: "Éducation" },
    { name: "Préparation aux Examens", group: "Éducation" },
    { name: "Alphabétisation Numérique", group: "Éducation" },

    // Santé et bien-être
    { name: "Santé Communautaire", group: "Santé" },
    { name: "Médecine Traditionnelle", group: "Santé" },
    { name: "Nutrition et Diététique", group: "Santé" },
    { name: "Premiers Secours", group: "Santé" },
    { name: "Santé Maternelle", group: "Santé" },
    { name: "Bien-être et Relaxation", group: "Santé" },

    // Arts et créativité
    { name: "Musique Malgache", group: "Arts" },
    { name: "Danse Traditionnelle", group: "Arts" },
    { name: "Arts Plastiques", group: "Arts" },
    { name: "Photographie", group: "Arts" },
    { name: "Création Littéraire", group: "Arts" },
    { name: "Théâtre et Expression", group: "Arts" },

    // Environnement et développement durable
    { name: "Protection de l'Environnement", group: "Environnement" },
    { name: "Énergies Renouvelables", group: "Environnement" },
    { name: "Gestion des Déchets", group: "Environnement" },
    { name: "Agriculture Biologique", group: "Environnement" },
    { name: "Conservation de la Biodiversité", group: "Environnement" },

    // Bâtiment et construction
    { name: "Construction Traditionnelle", group: "Bâtiment" },
    { name: "Architecture Tropicale", group: "Bâtiment" },
    { name: "Électricité Bâtiment", group: "Bâtiment" },
    { name: "Plomberie et Sanitaire", group: "Bâtiment" },
    { name: "Maçonnerie", group: "Bâtiment" },

    // Services et métiers
    { name: "Cuisine Malgache", group: "Services" },
    { name: "Pâtisserie et Boulangerie", group: "Services" },
    { name: "Coiffure et Esthétique", group: "Services" },
    { name: "Couture et Mode", group: "Services" },
    { name: "Mécanique Automobile", group: "Services" },
    { name: "Électronique Réparation", group: "Services" },

    // Développement personnel
    { name: "Leadership Communautaire", group: "Développement Personnel" },
    { name: "Gestion du Stress", group: "Développement Personnel" },
    { name: "Développement Personnel", group: "Développement Personnel" },
    { name: "Femmes Entrepreneures", group: "Développement Personnel" },
    { name: "Jeunesse et Emploi", group: "Développement Personnel" },
  ];

  // Générer les données avec slugs
  const values = categoriesWithGroups.map(({ name, group }) => ({
    name,
    slug: generateSlug(name),
    group,
  }));

  console.log("\n🔍 Categories grouped by:");
  const groups = [...new Set(values.map((v) => v.group))];
  console.log("Groups:", groups);

  groups.forEach((group) => {
    const count = values.filter((v) => v.group === group).length;
    console.log(`  ${group}: ${count} catégories`);
  });

  console.log("\n🔍 First few values to insert:");
  console.table(values.slice(0, 5));

  // 4. Vérifier les slugs uniques
  const slugs = values.map((v) => v.slug);
  const uniqueSlugs = new Set(slugs);

  if (slugs.length !== uniqueSlugs.size) {
    console.error("\n❌ ERROR: Duplicate slugs detected!");
    const duplicates = slugs.filter(
      (slug, index) => slugs.indexOf(slug) !== index
    );
    console.error("Duplicates:", duplicates);
    process.exit(1);
  }

  // 5. Insertion des données
  console.log("\n🔍 Running INSERT query...");
  try {
    // Option: Nettoyer la table d'abord (décommenter si nécessaire)
    // console.log("🗑️  Clearing existing categories...");
    // await db.delete(courseCategories);

    await db.insert(courseCategories).values(values);

    console.log("\n✅ Categories seeded successfully!");

    // 6. Vérification par groupe
    console.log("\n🔍 Verifying inserted data by group...");
    const insertedCategories = await db.select().from(courseCategories);

    // Compter par groupe
    const groupCounts: Record<string, number> = {};
    insertedCategories.forEach((cat) => {
      groupCounts[cat.group || "Other"] =
        (groupCounts[cat.group || "Other"] || 0) + 1;
    });

    console.log("\n📊 Summary by group:");
    Object.entries(groupCounts).forEach(([group, count]) => {
      console.log(`  ${group}: ${count} catégories`);
    });
    console.log(`\n✅ Total categories: ${insertedCategories.length}`);
  } catch (error) {
    console.error("\n❌ ERROR DURING SEEDING:");
    if ((error as any).code === "23505") {
      console.error("❌ DUPLICATE KEY ERROR:");
      console.error(
        "This usually means a category name or slug already exists."
      );
      console.error("\nSuggested solutions:");
      console.error("1. Delete existing categories first");
      console.error("2. Update existing categories instead of inserting");
      console.error("3. Use 'ON CONFLICT' clause to handle duplicates");
    }
    console.error("\nFull error:", error);
  }

  console.log("\n========== SEED CATEGORIES END ==========\n");
}

// Script de nettoyage
export async function clearCategories() {
  try {
    console.log("🗑️  Clearing course_categories table...");
    await db.delete(courseCategories);
    console.log("✅ Table cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing table:", error);
  }
}

// Script pour afficher les groupes existants
export async function showCategoryGroups() {
  try {
    const categories = await db.select().from(courseCategories);
    const groups = [...new Set(categories.map((c) => c.group).filter(Boolean))];

    console.log("\n📊 Existing groups in database:");
    groups.forEach((group) => {
      const count = categories.filter((c) => c.group === group).length;
      console.log(`  ${group}: ${count} categories`);
    });

    console.log(`\nTotal categories: ${categories.length}`);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

// Exécution principale
main().catch(console.error);

import { db } from "@/db";
import { courses } from "@/db/schema";
import { writeFileSync } from "node:fs";




async function exportCourses() {

  console.log("Export de courses en JSON");
  
  const allCourses = await db.select().from(courses);

  // Format Algolia : objectID requis
  const records = allCourses.map((c) => ({
    objectID: c.id,
    title: c.title,
    description: c.description,
    level: c.level,
    language: c.language,
    price: c.price,
    publishedAt: c.publishedAt?.toISOString(),
  }));

  writeFileSync(
    "./courses_algolia_export.json",
    JSON.stringify(records, null, 2)
  );

  console.log("Export terminé : courses_algolia_export.json");
}

exportCourses();

/**
 * Seed script for FDC Foundation Foods
 *
 * This script:
 * 1. Loads FDC foundation foods from JSON
 * 2. Creates Food records with source tracking
 * 3. Maps and creates FoodNutrition records
 * 4. Skips unmapped nutrients with logging
 * 5. Skips existing foods (in future runs)
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

interface FDCNutrient {
  id: number;
  number: string;
  name: string;
  rank: number;
  unitName: string;
}

interface FDCFoodNutrient {
  type: string;
  id: number;
  nutrient: FDCNutrient;
  amount: number;
}

interface FDCFoodCategory {
  id: number;
  code: string;
  description: string;
}

interface FDCFood {
  fdcId: number;
  foodClass: string;
  description: string;
  foodCategory?: FDCFoodCategory;
  foodNutrients: FDCFoodNutrient[];
  ndbNumber?: number;
  publicationDate?: string;
}

interface FDCData {
  FoundationFoods: FDCFood[];
}

// Load FDC to database nutrient ID mapping
function loadFdcMapping(): Record<number, string> {
  const mappingPath = join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "apps",
    "vault",
    "src",
    "lib",
    "domain",
    "cookbook",
    "foods",
    "integrations",
    "fdc",
    "fdc-nutrient-mapping.ts",
  );
  const content = readFileSync(mappingPath, "utf-8");

  const mapMatch = content.match(
    /export const FDC_TO_INFOODS: Record<number, string> = \{([^}]+)\}/s,
  );
  if (!mapMatch) {
    throw new Error("Could not parse FDC_TO_INFOODS mapping from file");
  }

  const mapContent = mapMatch[1];
  const mapping: Record<number, string> = {};

  const lines = mapContent.split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*(\d+):\s*['"]([^'"]+)['"]/);
    if (match) {
      const fdcId = parseInt(match[1], 10);
      const dbNutrientId = match[2];
      mapping[fdcId] = dbNutrientId;
    }
  }

  return mapping;
}

// Load Polish translations for FDC foods
function loadTranslations(): Record<number, string> {
  try {
    const translationsPath = join(__dirname, "fdc-foods-translations.json");
    const content = readFileSync(translationsPath, "utf-8");
    const data = JSON.parse(content);
    return data.translations || {};
  } catch (error) {
    console.warn(
      "⚠️  Could not load translations file, will use English names only",
    );
    return {};
  }
}

interface SeedStats {
  totalFoods: number;
  foodsCreated: number;
  foodsSkipped: number;
  totalNutrients: number;
  nutrientsMapped: number;
  nutrientsSkipped: number;
  unmappedNutrientIds: Set<number>;
  errors: Array<{ foodId: number; description: string; error: string }>;
}

async function seedFdcFoods() {
  const stats: SeedStats = {
    totalFoods: 0,
    foodsCreated: 0,
    foodsSkipped: 0,
    totalNutrients: 0,
    nutrientsMapped: 0,
    nutrientsSkipped: 0,
    unmappedNutrientIds: new Set(),
    errors: [],
  };

  try {
    console.log("🌱 FDC Foundation Foods Seeding\n");
    console.log("=".repeat(80));

    // Load FDC foundation foods
    console.log("\n📁 Loading FDC foundation foods...");
    const fdcPath = join(__dirname, "fd-foundation.json");
    const fdcData: FDCData = JSON.parse(readFileSync(fdcPath, "utf-8"));
    stats.totalFoods = fdcData.FoundationFoods.length;
    console.log(`   ✓ Loaded ${stats.totalFoods} foods`);

    // Load FDC mapping
    console.log("\n📋 Loading FDC → Database mapping...");
    const fdcMapping = loadFdcMapping();
    console.log(
      `   ✓ Loaded ${Object.keys(fdcMapping).length} mapped nutrients`,
    );

    // Load Polish translations
    console.log("\n🇵🇱 Loading Polish translations...");
    const translations = loadTranslations();
    console.log(`   ✓ Loaded ${Object.keys(translations).length} translations`);

    // Connect to database
    console.log("\n💾 Connecting to database...");
    await prisma.$connect();
    console.log("   ✓ Connected");

    // Get existing FDC foods (for future runs)
    console.log("\n🔍 Checking for existing FDC foods...");
    const existingFoods = await prisma.food.findMany({
      where: {
        sourceProvider: "fdc",
      },
      select: {
        sourceExternalId: true,
      },
    });
    const existingFdcIds = new Set(
      existingFoods.map((f) => f.sourceExternalId),
    );
    console.log(`   ✓ Found ${existingFoods.length} existing FDC foods`);

    // Seed foods
    console.log("\n🌾 Seeding foods...\n");
    let processedCount = 0;

    for (const fdcFood of fdcData.FoundationFoods) {
      processedCount++;

      try {
        // Check if food already exists
        const fdcIdStr = fdcFood.fdcId.toString();
        if (existingFdcIds.has(fdcIdStr)) {
          stats.foodsSkipped++;
          console.log(
            `   [${processedCount}/${stats.totalFoods}] ⏭️  Skipped: ${fdcFood.description} (already exists)`,
          );
          continue;
        }

        // Create food record
        const polishName = translations[fdcFood.fdcId] || null;
        const food = await prisma.food.create({
          data: {
            nameEn: fdcFood.description,
            namePl: polishName,
            scientificName: null,
            category: fdcFood.foodCategory?.description || null,
            brand: null,
            userId: null,
            sourceProvider: "fdc",
            sourceExternalId: fdcIdStr,
            sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${fdcFood.fdcId}/nutrients`,
          },
        });

        // Process nutrients
        let nutrientsMappedForFood = 0;
        let nutrientsSkippedForFood = 0;

        for (const foodNutrient of fdcFood.foodNutrients) {
          stats.totalNutrients++;

          const fdcNutrientId = foodNutrient.nutrient.id;
          const dbNutrientId = fdcMapping[fdcNutrientId];

          if (!dbNutrientId) {
            stats.nutrientsSkipped++;
            stats.unmappedNutrientIds.add(fdcNutrientId);
            nutrientsSkippedForFood++;
            continue;
          }

          // Create food nutrition record
          try {
            await prisma.foodNutrition.create({
              data: {
                foodId: food.id,
                nutritionId: dbNutrientId,
                amount: foodNutrient.amount || 0.01,
              },
            });

            stats.nutrientsMapped++;
            nutrientsMappedForFood++;
          } catch (error) {
            console.log(dbNutrientId);
            // Skip if nutrient doesn't exist in database
            if (
              error instanceof Error &&
              error.message.includes("Foreign key")
            ) {
              stats.nutrientsSkipped++;
              stats.unmappedNutrientIds.add(fdcNutrientId);
              nutrientsSkippedForFood++;
            } else {
              throw error;
            }
          }
        }

        stats.foodsCreated++;
        console.log(
          `   [${processedCount}/${stats.totalFoods}] ✅ ${fdcFood.description}`,
        );
        console.log(
          `      → ${nutrientsMappedForFood} nutrients mapped, ${nutrientsSkippedForFood} skipped`,
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        stats.errors.push({
          foodId: fdcFood.fdcId,
          description: fdcFood.description,
          error: errorMsg,
        });
        console.error(
          `   [${processedCount}/${stats.totalFoods}] ❌ Error: ${fdcFood.description}`,
        );
        console.error(`      → ${errorMsg}`);
      }
    }

    // Print summary
    console.log("\n" + "=".repeat(80));
    console.log("📊 SEEDING SUMMARY");
    console.log("=".repeat(80));

    console.log(`\n📦 Foods:`);
    console.log(`   Total:         ${stats.totalFoods}`);
    console.log(`   Created:       ${stats.foodsCreated}`);
    console.log(`   Skipped:       ${stats.foodsSkipped}`);
    console.log(`   Errors:        ${stats.errors.length}`);

    console.log(`\n🔬 Nutrients:`);
    console.log(`   Total:         ${stats.totalNutrients}`);
    console.log(`   Mapped:        ${stats.nutrientsMapped}`);
    console.log(`   Skipped:       ${stats.nutrientsSkipped}`);
    console.log(`   Unique unmapped: ${stats.unmappedNutrientIds.size}`);

    if (stats.unmappedNutrientIds.size > 0) {
      console.log(`\n⚠️  Unmapped FDC nutrient IDs (top 20):`);
      const unmappedArray = Array.from(stats.unmappedNutrientIds).slice(0, 20);
      console.log(`   ${unmappedArray.join(", ")}`);
      console.log(`   (Run verify-fdc-mapping.ts for full list)`);
    }

    if (stats.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      stats.errors.slice(0, 10).forEach((err) => {
        console.log(`   - FDC ${err.foodId}: ${err.description}`);
        console.log(`     Error: ${err.error}`);
      });
      if (stats.errors.length > 10) {
        console.log(`   ... and ${stats.errors.length - 10} more`);
      }
    }

    console.log("\n" + "=".repeat(80));

    if (stats.errors.length === 0 && stats.foodsCreated > 0) {
      console.log("✅ Seeding completed successfully!");
      return { success: true, stats };
    } else if (stats.foodsCreated > 0) {
      console.log("⚠️  Seeding completed with some errors.");
      return { success: false, stats };
    } else {
      console.log("❌ No foods were created.");
      return { success: false, stats };
    }
  } catch (error) {
    console.error("❌ Fatal error during seeding:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
const scriptPath = fileURLToPath(import.meta.url).replace(/\\/g, "/");
const entryPath = process.argv[1]?.replace(/\\/g, "/") || "";
const isMainModule = scriptPath === entryPath;

if (isMainModule) {
  seedFdcFoods()
    .then((result) => {
      if (result.success) {
        console.log("\n✨ Seeding completed!");
        process.exit(0);
      } else {
        console.log("\n⚠️  Seeding completed with issues.");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedFdcFoods };

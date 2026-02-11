/**
 * Verification script for FDC nutrient mapping
 *
 * This script:
 * 1. Loads all FDC foundation foods
 * 2. Extracts all unique FDC nutrient IDs
 * 3. Checks mapping coverage (FDC ID -> INFOODS code)
 * 4. Verifies that mapped INFOODS codes exist in database
 * 5. Generates a detailed report
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Import the existing FDC mapping from the frontend integration
// We need to read it as a file since we can't import TS from this location
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

interface FDCFood {
  foodClass: string;
  description: string;
  foodNutrients: FDCFoodNutrient[];
}

interface FDCData {
  FoundationFoods: FDCFood[];
}

// Load FDC to INFOODS mapping from the existing file
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

  // Parse the FDC_TO_INFOODS object from the TypeScript file
  const mapMatch = content.match(
    /export const FDC_TO_INFOODS: Record<number, string> = \{([^}]+)\}/s,
  );
  if (!mapMatch) {
    throw new Error("Could not parse FDC_TO_INFOODS mapping from file");
  }

  const mapContent = mapMatch[1];
  const mapping: Record<number, string> = {};

  // Parse each line like: 1008: 'ENERC_KCAL', // Energy (kcal)
  const lines = mapContent.split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*(\d+):\s*['"]([^'"]+)['"]/);
    if (match) {
      const fdcId = parseInt(match[1], 10);
      const infoodsCode = match[2];
      mapping[fdcId] = infoodsCode;
    }
  }

  return mapping;
}

async function verifyMapping() {
  try {
    console.log("🔍 FDC Nutrient Mapping Verification\n");
    console.log("=".repeat(80));

    // Load FDC foundation foods
    console.log("\n📁 Loading FDC foundation foods...");
    const fdcPath = join(__dirname, "fd-foundation.json");
    const fdcData: FDCData = JSON.parse(readFileSync(fdcPath, "utf-8"));
    console.log(`   ✓ Loaded ${fdcData.FoundationFoods.length} foods`);

    // Load FDC mapping
    console.log("\n📋 Loading FDC → INFOODS mapping...");
    const fdcMapping = loadFdcMapping();
    console.log(
      `   ✓ Loaded ${Object.keys(fdcMapping).length} mapped nutrients`,
    );

    // Extract all unique FDC nutrient IDs and their details
    console.log("\n🔬 Analyzing nutrients in FDC foods...");
    const uniqueNutrients = new Map<number, FDCNutrient>();
    const nutrientOccurrences = new Map<number, number>();

    for (const food of fdcData.FoundationFoods) {
      for (const foodNutrient of food.foodNutrients) {
        const nutrientId = foodNutrient.nutrient.id;

        if (!uniqueNutrients.has(nutrientId)) {
          uniqueNutrients.set(nutrientId, foodNutrient.nutrient);
        }

        nutrientOccurrences.set(
          nutrientId,
          (nutrientOccurrences.get(nutrientId) || 0) + 1,
        );
      }
    }

    console.log(`   ✓ Found ${uniqueNutrients.size} unique nutrients`);

    // Load database nutrients
    console.log("\n💾 Loading nutrients from database...");
    await prisma.$connect();
    const dbNutrients = await prisma.nutrition.findMany({
      select: { id: true },
    });
    const dbNutrientIds = new Set(dbNutrients.map((n) => n.id));
    console.log(`   ✓ Database has ${dbNutrients.length} nutrients`);

    // Verify each nutrient
    console.log("\n✨ Verifying mapping...");
    const mapped: Array<{
      fdcId: number;
      nutrient: FDCNutrient;
      infoodsCode: string;
    }> = [];
    const unmapped: Array<{
      fdcId: number;
      nutrient: FDCNutrient;
      occurrences: number;
    }> = [];
    const mappedButMissingInDb: Array<{
      fdcId: number;
      nutrient: FDCNutrient;
      infoodsCode: string;
    }> = [];

    for (const [fdcId, nutrient] of uniqueNutrients) {
      const infoodsCode = fdcMapping[fdcId];

      if (!infoodsCode) {
        unmapped.push({
          fdcId,
          nutrient,
          occurrences: nutrientOccurrences.get(fdcId) || 0,
        });
      } else {
        if (dbNutrientIds.has(infoodsCode)) {
          mapped.push({ fdcId, nutrient, infoodsCode });
        } else {
          mappedButMissingInDb.push({ fdcId, nutrient, infoodsCode });
        }
      }
    }

    // Calculate statistics
    const totalNutrients = uniqueNutrients.size;
    const mappedCount = mapped.length;
    const unmappedCount = unmapped.length;
    const missingInDbCount = mappedButMissingInDb.length;
    const usableCount = mappedCount; // Only fully mapped nutrients are usable
    const coveragePercent = ((usableCount / totalNutrients) * 100).toFixed(1);

    // Print results
    console.log("\n" + "=".repeat(80));
    console.log("📊 VERIFICATION RESULTS");
    console.log("=".repeat(80));

    console.log(
      `\n✅ Mapped & Available: ${mappedCount} nutrients (${coveragePercent}% coverage)`,
    );
    console.log(`⚠️  Unmapped: ${unmappedCount} nutrients`);
    console.log(`❌ Mapped but Missing in DB: ${missingInDbCount} nutrients`);
    console.log(`📈 Total unique nutrients: ${totalNutrients}`);

    // Show unmapped nutrients
    if (unmapped.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  UNMAPPED NUTRIENTS (missing from mapping)");
      console.log("=".repeat(80));
      console.log("\nFDC ID | Number | Name | Unit | Occurrences");
      console.log("-".repeat(80));

      // Sort by occurrences (most common first)
      unmapped.sort((a, b) => b.occurrences - a.occurrences);

      for (const { fdcId, nutrient, occurrences } of unmapped) {
        console.log(
          `${fdcId.toString().padEnd(7)}| ${nutrient.number.padEnd(7)}| ${nutrient.name.padEnd(40).substring(0, 40)}| ${nutrient.unitName.padEnd(5)}| ${occurrences}`,
        );
      }

      console.log(`\nTotal: ${unmapped.length} unmapped nutrients`);
    }

    // Show mapped but missing in DB
    if (mappedButMissingInDb.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("❌ MAPPED BUT MISSING IN DATABASE");
      console.log("=".repeat(80));
      console.log("\nFDC ID | Number | Name | INFOODS Code");
      console.log("-".repeat(80));

      for (const { fdcId, nutrient, infoodsCode } of mappedButMissingInDb) {
        console.log(
          `${fdcId.toString().padEnd(7)}| ${nutrient.number.padEnd(7)}| ${nutrient.name.padEnd(40).substring(0, 40)}| ${infoodsCode}`,
        );
      }

      console.log(`\nTotal: ${mappedButMissingInDb.length} nutrients`);
    }

    // Summary recommendations
    console.log("\n" + "=".repeat(80));
    console.log("💡 RECOMMENDATIONS");
    console.log("=".repeat(80));

    if (unmapped.length > 0) {
      console.log(
        `\n1. Add ${unmapped.length} missing nutrients to FDC_TO_INFOODS mapping`,
      );
      console.log(
        "   Location: apps/vault/src/lib/dto/cookbook/foods/integrations/fdc/fdc-nutrient-mapping.ts",
      );
    }

    if (mappedButMissingInDb.length > 0) {
      console.log(
        `\n2. Add ${mappedButMissingInDb.length} missing INFOODS nutrients to database`,
      );
      console.log(
        "   Location: packages/db/seeds/nutrients/nutrients-definition.csv",
      );
    }

    if (unmapped.length === 0 && mappedButMissingInDb.length === 0) {
      console.log(
        "\n✅ All FDC nutrients are properly mapped and available in database!",
      );
      console.log("   You can proceed with seeding FDC foods.");
    }

    console.log("\n" + "=".repeat(80));

    // Return status for programmatic use
    return {
      success: unmapped.length === 0 && mappedButMissingInDb.length === 0,
      stats: {
        total: totalNutrients,
        mapped: mappedCount,
        unmapped: unmappedCount,
        missingInDb: missingInDbCount,
        usable: usableCount,
        coverage: parseFloat(coveragePercent),
      },
      unmappedNutrients: unmapped,
      missingInDbNutrients: mappedButMissingInDb,
    };
  } catch (error) {
    console.error("❌ Error during verification:", error);
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
  verifyMapping()
    .then((result) => {
      if (result.success) {
        console.log("\n✅ Verification passed!");
        process.exit(0);
      } else {
        console.log("\n⚠️  Verification completed with issues.");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("💥 Verification failed:", error);
      process.exit(1);
    });
}

export { verifyMapping };

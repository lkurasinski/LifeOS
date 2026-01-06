import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

// Load comprehensive translations
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const translationsPath = join(__dirname, "translations-comprehensive.json");
const translationsData = JSON.parse(readFileSync(translationsPath, "utf-8"));

// Flatten all translations into a single lookup map
const translationMap = new Map<string, string>();
Object.values(translationsData.translations).forEach((category: any) => {
  Object.entries(category).forEach(([en, pl]) => {
    translationMap.set(en.toLowerCase(), pl as string);
  });
});

interface NutrientCSVRow {
  id: string;
  name: string;
  unit: string;
  comment: string;
  category: string;
}

interface NutrientData {
  id: string;
  nameEn: string;
  namePl: string;
  unit: "kJ" | "kcal" | "mcg" | "mg" | "g" | "IU" | "none";
  descriptionEn: string | null;
  descriptionPl: string | null;
  commentEn: string | null;
  commentPl: string | null;
  categoryId: string | null;
}

// Transform CSV ID to database ID format
function transformId(csvId: string): string {
  if (!csvId || csvId.trim() === "") {
    throw new Error("CSV ID cannot be empty");
  }

  let id = csvId.trim();

  // Check if this is an "unknown/variable method" entry (e.g., "PROT-(g)")
  const unknownMatch = id.match(/^(.+)-\(([^)]+)\)$/);
  if (unknownMatch) {
    const baseCode = unknownMatch[1];
    const unit = unknownMatch[2];
    return `${baseCode}_${unit}_UNK`;
  }

  // Extract unit from parentheses and additional qualifiers
  const unitMatch = id.match(/\(([^)]+)\)/);
  const hasOriginal = id.includes("(original)");

  if (unitMatch) {
    const baseCode = id.substring(0, id.indexOf("("));
    const unit = unitMatch[1];

    if (unit === "internal use") {
      return baseCode;
    }

    id = `${baseCode}_${unit}`;

    if (hasOriginal) {
      id += "_original";
    }
  }

  return id;
}

// Map CSV unit to NutritionUnit enum
function mapUnit(
  csvUnit: string,
): "kJ" | "kcal" | "mcg" | "mg" | "g" | "IU" | "none" {
  const unit = csvUnit.trim().toLowerCase();

  switch (unit) {
    case "kj":
      return "kJ";
    case "kcal":
      return "kcal";
    case "mcg":
    case "µg":
      return "mcg";
    case "mg":
      return "mg";
    case "g":
      return "g";
    case "iu":
      return "IU";
    case "":
    case "none":
      return "none";
    default:
      console.warn(`Unknown unit: ${csvUnit}, defaulting to 'none'`);
      return "none";
  }
}

// Generate short descriptive name from CSV name field
function generateShortName(csvName: string): string {
  if (!csvName || csvName.trim() === "") {
    return "";
  }

  // Capitalize first letter
  const name = csvName.trim();
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Translate nutrient name to Polish using comprehensive translations
function translateName(csvName: string): string {
  if (!csvName || csvName.trim() === "") {
    return "";
  }

  const nameEn = csvName.trim();
  const nameLower = nameEn.toLowerCase();

  // Try direct lookup first (most accurate)
  const directTranslation = translationMap.get(nameLower);
  if (directTranslation) {
    return directTranslation;
  }

  // If no direct match, return empty to flag for manual review
  return "";
}

// Parse CSV and transform to database format
function parseNutrientCSV(filePath: string): NutrientData[] {
  const fileContent = readFileSync(filePath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as NutrientCSVRow[];

  const nutrients: NutrientData[] = [];
  const untranslatedNames: Array<{ id: string; name: string }> = [];

  for (const row of records) {
    // Skip rows with empty ID
    if (!row.id || row.id.trim() === "") {
      continue;
    }

    const id = transformId(row.id);
    const unit = mapUnit(row.unit);
    const nameEn = generateShortName(row.name);
    const namePl = translateName(row.name);

    if (!namePl) {
      untranslatedNames.push({ id, name: nameEn });
    }

    const nutrient: NutrientData = {
      id,
      nameEn,
      namePl: namePl || nameEn, // Fallback to English if no translation
      unit,
      descriptionEn: null,
      descriptionPl: null,
      commentEn: row.comment || null,
      commentPl: null, // Leave comments untranslated for now
      categoryId: row.category || null,
    };

    nutrients.push(nutrient);
  }

  // Report untranslated names
  if (untranslatedNames.length > 0) {
    console.warn("\n⚠️  The following nutrient names need manual translation:");
    console.warn("ID | Name");
    console.warn("---|-----");
    untranslatedNames.forEach(({ id, name }) => {
      console.warn(`${id} | ${name}`);
    });
    console.warn(`\nTotal: ${untranslatedNames.length} items\n`);
  }

  return nutrients;
}

// Seed the database
async function seedNutrients() {
  try {
    console.log("🌱 Starting nutrient seeding...");

    // Get the directory where this script is located (ES module compatible, Windows-safe)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const csvPath = join(__dirname, "nutrients-definition.csv");

    console.log(`📁 Looking for CSV at: ${csvPath}`);

    const nutrients = parseNutrientCSV(csvPath);

    console.log(`📊 Parsed ${nutrients.length} nutrients from CSV`);

    // Test database connection
    console.log("🔌 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected!");

    // Clear existing data
    console.log("🗑️  Clearing existing nutrition data...");
    await prisma.nutrition.deleteMany();

    // Insert nutrients
    console.log("💾 Inserting nutrients...");
    let inserted = 0;

    for (const nutrient of nutrients) {
      try {
        await prisma.nutrition.create({
          data: nutrient,
        });
        inserted++;

        if (inserted % 50 === 0) {
          console.log(`   Inserted ${inserted}/${nutrients.length}...`);
        }
      } catch (err) {
        console.error(`❌ Error inserting nutrient ${nutrient.id}:`, err);
        throw err;
      }
    }

    console.log(`✅ Successfully seeded ${inserted} nutrients!`);
  } catch (error) {
    console.error("❌ Error seeding nutrients:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly (ES module check)
// Normalize paths for comparison (handle Windows backslashes)
const scriptPath = fileURLToPath(import.meta.url).replace(/\\/g, "/");
const entryPath = process.argv[1]?.replace(/\\/g, "/") || "";
const isMainModule = scriptPath === entryPath;

if (isMainModule) {
  seedNutrients()
    .then(() => {
      console.log("✨ Nutrient seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedNutrients };

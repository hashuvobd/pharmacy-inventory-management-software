const fs = require('fs');
const path = require('path');

function cleanHtml(rawHtml) {
  if (!rawHtml) return "";
  // Strip HTML tags
  let text = rawHtml.replace(/<[^>]*>/g, ' ');
  // Replace entity references
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"');
  // Normalize spaces
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  const len = content.length;
  
  while (i < len) {
    const char = content[i];
    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        currentField += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
      i++;
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      if (char === '\r' && content[i + 1] === '\n') {
        i += 2;
      } else {
        i++;
      }
    } else {
      currentField += char;
      i++;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

function extractPrice(packageContainer, packageSize) {
  const text = `${packageContainer} ${packageSize}`;
  const match = text.match(/৳\s*([\d,.]+)/);
  if (match) {
    try {
      const val = parseFloat(match[1].replace(/,/g, ''));
      // If there's a unit price specifically, try to fetch it
      const unitMatch = text.match(/Unit Price:\s*৳\s*([\d,.]+)/);
      if (unitMatch) {
        return parseFloat(unitMatch[1].replace(/,/g, ''));
      }
      return val;
    } catch (e) {}
  }
  return null;
}

function process() {
  const medsDir = path.join(__dirname, '..', 'meds');
  const genericPath = path.join(medsDir, 'generic.csv');
  const medicinePath = path.join(medsDir, 'medicine.csv');

  console.log("Reading CSV files...");
  const genericContent = fs.readFileSync(genericPath, 'utf8');
  const medicineContent = fs.readFileSync(medicinePath, 'utf8');

  console.log("Parsing generic.csv...");
  const genericRows = parseCSV(genericContent);
  const genericHeaders = genericRows[0];
  const genericData = genericRows.slice(1);

  // Map header index
  const genNameIdx = genericHeaders.indexOf("generic name");
  const drugClassIdx = genericHeaders.indexOf("drug class");
  const indicationIdx = genericHeaders.indexOf("indication description");
  const indicationAltIdx = genericHeaders.indexOf("indication");
  const pharmacologyIdx = genericHeaders.indexOf("pharmacology description");
  const dosageIdx = genericHeaders.indexOf("dosage description");
  const adminIdx = genericHeaders.indexOf("administration description");
  const contraIdx = genericHeaders.indexOf("contraindications description");
  const sideEffectsIdx = genericHeaders.indexOf("side effects description");
  const pregnancyIdx = genericHeaders.indexOf("pregnancy and lactation description");

  console.log("Indexing generics...");
  const genericsDb = {};
  for (const row of genericData) {
    if (row.length < 2) continue;
    const name = row[genNameIdx]?.trim();
    if (!name) continue;
    
    const indications = cleanHtml(row[indicationIdx] || row[indicationAltIdx]);
    const pharmacology = cleanHtml(row[pharmacologyIdx]);
    const dosageAdmin = cleanHtml((row[dosageIdx] || "") + " " + (row[adminIdx] || "")).trim();
    const sideEffects = cleanHtml(row[sideEffectsIdx]);
    const contraindications = cleanHtml(row[contraIdx]);
    const pregnancyCategory = cleanHtml(row[pregnancyIdx]);
    const drugClass = cleanHtml(row[drugClassIdx]);

    genericsDb[name.toLowerCase()] = {
      drugClass,
      indications,
      pharmacology,
      dosageAdministration: dosageAdmin,
      sideEffects,
      contraindications,
      pregnancyCategory
    };
  }
  console.log(`Indexed ${Object.keys(genericsDb).length} generics.`);

  console.log("Parsing medicine.csv...");
  const medicineRows = parseCSV(medicineContent);
  const medHeaders = medicineRows[0];
  const medData = medicineRows.slice(1);

  const brandIdIdx = medHeaders.indexOf("brand id");
  const brandNameIdx = medHeaders.indexOf("brand name");
  const dosageFormIdx = medHeaders.indexOf("dosage form");
  const genericIdx = medHeaders.indexOf("generic");
  const strengthIdx = medHeaders.indexOf("strength");
  const manufacturerIdx = medHeaders.indexOf("manufacturer");
  const packageContainerIdx = medHeaders.indexOf("package container");
  const packageSizeIdx = medHeaders.indexOf("Package Size");
  const typeIdx = medHeaders.indexOf("type");

  const popularManufacturers = new Set([
    "Square Pharmaceuticals Ltd.",
    "Beximco Pharmaceuticals Ltd.",
    "Incepta Pharmaceuticals Ltd.",
    "Opsonin Pharma Ltd.",
    "Healthcare Pharmaceuticals Ltd.",
    "Renata Limited",
    "Aristopharma Ltd.",
    "Drug International Ltd.",
    "Ibn Sina Pharmaceuticals Ltd.",
    "ACME Laboratories Ltd.",
    "Radiant Pharmaceuticals Ltd.",
    "Beacon Pharmaceuticals Ltd.",
    "UniMed UniHealth Ltd.",
    "Popular Pharmaceuticals Ltd.",
    "Beximco Pharma",
    "Square Pharmaceuticals"
  ]);

  const categoryMapping = {
    "tablet": "Gastrointestinal",
    "capsule": "Antibiotics",
    "syrup": "OTC",
    "injection": "Cardiac",
    "gel": "Dermatology",
    "ointment": "Dermatology",
    "cream": "Dermatology"
  };

  console.log("Matching and formatting B2B medicine inventory...");
  const medicinesList = [];

  for (const row of medData) {
    if (row.length < 2) continue;
    const brandId = row[brandIdIdx]?.trim();
    const brandName = row[brandNameIdx]?.trim();
    const generic = row[genericIdx]?.trim();
    const manufacturer = row[manufacturerIdx]?.trim();
    if (!brandName || !generic) continue;

    // Filter by popular manufacturers to sample ~1,000 highly recognizable products
    if (!popularManufacturers.has(manufacturer)) continue;

    const dosageForm = row[dosageFormIdx]?.trim() || "Tablet";
    const strength = row[strengthIdx]?.trim() || "";
    const packageContainer = row[packageContainerIdx]?.trim() || "";
    const packageSize = row[packageSizeIdx]?.trim() || "";
    const medType = row[typeIdx]?.trim() || "allopathic";

    // Match generic monograph
    const genericKey = generic.toLowerCase();
    const genericKeyClean = genericKey.replace(/\s*\([^)]*\)/g, '').trim();

    let monograph = genericsDb[genericKey] || genericsDb[genericKeyClean];
    if (!monograph) {
      for (const [k, v] of Object.entries(genericsDb)) {
        if (k.startsWith(genericKeyClean) || genericKeyClean.startsWith(k)) {
          monograph = v;
          break;
        }
      }
    }

    if (!monograph) {
      monograph = {
        drugClass: medType === "herbal" ? "Herbal" : "General Medicine",
        indications: `Indicated for conditions corresponding to therapeutic generic action of ${generic}.`,
        pharmacology: `Pharmacological details for ${generic}.`,
        dosageAdministration: "As directed by a registered physician.",
        sideEffects: "Mild gastrointestinal upset, nausea, headache, or allergic skin reactions.",
        contraindications: "Hypersensitivity to the active substance.",
        pregnancyCategory: "Pregnancy Category C. Consult a physician before use."
      };
    }

    let mrp = extractPrice(packageContainer, packageSize);
    if (!mrp || mrp <= 0) {
      // Generate standard fallback price
      const fallbacks = [8.50, 12.00, 18.00, 35.00, 50.00, 75.00, 110.00, 220.00];
      mrp = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    const wholesalePrice = parseFloat((mrp * 0.82).toFixed(2)); // 18% margin

    // Map Category
    let category = "Other";
    const drugClassLower = (monograph.drugClass || "").toLowerCase();
    if (drugClassLower.includes("antibiotic") || drugClassLower.includes("antibacterial") || drugClassLower.includes("penicillin")) {
      category = "Antibiotics";
    } else if (drugClassLower.includes("ulcer") || drugClassLower.includes("gastro") || drugClassLower.includes("proton pump") || drugClassLower.includes("acid") || drugClassLower.includes("laxative") || drugClassLower.includes("antacid")) {
      category = "Gastrointestinal";
    } else if (drugClassLower.includes("cardiac") || drugClassLower.includes("hypertension") || drugClassLower.includes("beta-blocker") || drugClassLower.includes("calcium channel") || drugClassLower.includes("blood pressure")) {
      category = "Cardiac";
    } else if (drugClassLower.includes("antihistamine") || drugClassLower.includes("cough") || drugClassLower.includes("respiratory") || drugClassLower.includes("bronchodilator") || drugClassLower.includes("asthma")) {
      category = "Respiratory";
    } else if (drugClassLower.includes("nsaid") || drugClassLower.includes("pain") || drugClassLower.includes("rheumatoid") || drugClassLower.includes("osteoarthritis") || drugClassLower.includes("analgesic")) {
      category = "Pain Relief";
    } else if (drugClassLower.includes("vitamins") || drugClassLower.includes("multivitamin") || drugClassLower.includes("calcium") || drugClassLower.includes("mineral")) {
      category = "Vitamins";
    } else if (drugClassLower.includes("herbal") || drugClassLower.includes("nutraceutical") || drugClassLower.includes("unani") || drugClassLower.includes("ayurvedic")) {
      category = "Herbal";
    } else if (drugClassLower.includes("antiviral") || drugClassLower.includes("herpes")) {
      category = "Antivirals";
    } else {
      const formLower = dosageForm.toLowerCase();
      for (const [k, v] of Object.entries(categoryMapping)) {
        if (formLower.includes(k)) {
          category = v;
          break;
        }
      }
    }

    if (medType === "herbal") {
      category = "Herbal";
    }

    const fullName = strength ? `${brandName} ${strength}` : brandName;

    // Estimate expiration
    const expMonths = Math.floor(Math.random() * 21) + 4; // 4 to 24 months
    const dateObj = new Date();
    dateObj.setMonth(dateObj.getMonth() + expMonths);
    const expiryDate = dateObj.toISOString().split('T')[0];

    const item = {
      id: `MED-B${brandId}`,
      name: fullName,
      generic: generic,
      manufacturer: manufacturer,
      category: category,
      dosageForm: dosageForm,
      batch: `BT-${brandId}-${Math.floor(Math.random() * 90) + 10}`,
      packSize: packageContainer || "10 x 10 Box",
      wholesalePrice: wholesalePrice,
      mrp: mrp,
      stock: Math.floor(Math.random() * 1400) + 100, // 100 to 1500
      expiryDate: expiryDate,
      expiryMonths: expMonths,
      moq: [5, 10, 15, 20, 30, 50][Math.floor(Math.random() * 6)],
      indications: monograph.indications,
      pharmacology: monograph.pharmacology,
      dosageAdministration: monograph.dosageAdministration,
      sideEffects: monograph.sideEffects,
      contraindications: monograph.contraindications,
      pregnancyCategory: monograph.pregnancyCategory,
      image: "" // Empty image URL
    };

    medicinesList.push(item);
  }

  // Shuffle and limit to 1200 items to guarantee optimal load times and browser smoothness
  const shuffled = medicinesList.sort(() => 0.5 - Math.random());
  const finalSample = shuffled.slice(0, 1200);

  const outputPath = path.join(__dirname, 'medicinesData.js');
  fs.writeFileSync(outputPath, `// Dynamic Medex Medicine Database
export const INITIAL_MEDICINES = ${JSON.stringify(finalSample, null, 2)};
`, 'utf8');

  console.log(`Successfully generated B2B Medicine database in ${outputPath} with ${finalSample.length} products.`);
}

process();

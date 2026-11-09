const fs = require('fs');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ciwkdaupgkccmtlppifx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpd2tkYXVwZ2tjY210bHBwaWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDM1MDAsImV4cCI6MjA5NzcxOTUwMH0.7lBQkBshTidWAmN1LnvYE3L_GCR0_v7y-J--_3W1bXM';
const supabase = createClient(supabaseUrl, supabaseKey);

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function cleanBrandName(raw) {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, ' ')      // remove (60's), (30's), (10's), etc.
    .replace(/mrp\s*[-:=]?\s*[\d.]+\s*(tk)?/gi, ' ') // remove mrp-660 TK
    .replace(/\b\d+(\.\d+)?\s*(mg|ml|mcg|gm|g|iu|%)\b/gi, ' ') // remove strengths like 20mg, 500mg, 100ml
    .replace(/[^a-z0-9]/g, ' ')         // remove special chars
    .replace(/\s+/g, ' ')
    .trim();
}

async function populateGenerics() {
  console.log('1. Reading CSV reference...');
  const csvFile = 'meds/medicine.csv';
  const fileStream = fs.createReadStream(csvFile);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const exactMap = new Map();
  const cleanedMap = new Map();

  let isHeader = true;
  for await (const line of rl) {
    if (isHeader) { isHeader = false; continue; }
    const cols = parseCSVLine(line);
    const brandName = cols[1];
    const generic = cols[5];
    if (brandName && generic) {
      const lower = brandName.toLowerCase().trim();
      if (!exactMap.has(lower)) exactMap.set(lower, generic);

      const cleaned = cleanBrandName(brandName);
      if (cleaned && !cleanedMap.has(cleaned)) cleanedMap.set(cleaned, generic);
    }
  }
  console.log(`Loaded ${exactMap.size} exact brand mappings and ${cleanedMap.size} cleaned brand mappings.`);

  console.log('2. Fetching live medicines from Supabase...');
  let allMeds = [];
  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('medicines')
      .select('id, product_name, generic')
      .range(from, from + batchSize - 1);
    if (error) {
      console.error('Fetch error:', error);
      break;
    }
    allMeds.push(...data);
    if (data.length < batchSize) break;
    from += batchSize;
  }
  console.log(`Fetched ${allMeds.length} medicines from Supabase.`);

  // Group by generic
  const genericToIds = new Map();
  let matchedCount = 0;
  let unmatchedCount = 0;

  for (const med of allMeds) {
    const rawLower = med.product_name.toLowerCase().trim();
    let gen = exactMap.get(rawLower);

    if (!gen) {
      const cleaned = cleanBrandName(med.product_name);
      gen = cleanedMap.get(cleaned);
      if (!gen) {
        const words = cleaned.split(' ');
        if (words.length > 1) {
          const firstWord = words[0];
          if (firstWord.length > 2 && cleanedMap.has(firstWord)) {
            gen = cleanedMap.get(firstWord);
          } else {
            const firstTwo = words.slice(0, 2).join(' ');
            if (cleanedMap.has(firstTwo)) {
              gen = cleanedMap.get(firstTwo);
            }
          }
        }
      }
    }

    if (gen) {
      matchedCount++;
      if (!genericToIds.has(gen)) {
        genericToIds.set(gen, []);
      }
      genericToIds.get(gen).push(med.id);
    } else {
      unmatchedCount++;
    }
  }

  console.log(`Found ${matchedCount} medicines to update across ${genericToIds.size} generic formulations.`);
  console.log(`${unmatchedCount} medicines will remain safely unchanged (generic = null).`);

  console.log('3. Updating Supabase medicines table in batches...');
  let updatedMedicines = 0;
  let completedGroups = 0;
  const totalGroups = genericToIds.size;

  const entries = Array.from(genericToIds.entries());
  
  // Process with concurrency of 8
  const CONCURRENCY = 8;
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const chunk = entries.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async ([genericName, ids]) => {
        // Chunk IDs if > 100 to avoid query size limits
        const ID_CHUNK_SIZE = 100;
        for (let j = 0; j < ids.length; j += ID_CHUNK_SIZE) {
          const idSub = ids.slice(j, j + ID_CHUNK_SIZE);
          const { error } = await supabase
            .from('medicines')
            .update({ generic: genericName })
            .in('id', idSub);
          if (error) {
            console.error(`Error updating generic "${genericName}":`, error.message);
          } else {
            updatedMedicines += idSub.length;
          }
        }
        completedGroups++;
      })
    );

    if (completedGroups % 100 === 0 || completedGroups === totalGroups) {
      console.log(`Progress: ${completedGroups}/${totalGroups} generic groups processed (${updatedMedicines} medicines updated)...`);
    }
  }

  console.log(`\n✅ Migration Complete!`);
  console.log(`Total medicines successfully updated with generic formulation: ${updatedMedicines}`);

  console.log('4. Verifying database state...');
  const { count, error: countErr } = await supabase
    .from('medicines')
    .select('id', { count: 'exact', head: true })
    .not('generic', 'is', null);

  if (countErr) {
    console.error('Verification count error:', countErr);
  } else {
    console.log(`Verified: Supabase now has ${count} medicines with populated generic names!`);
  }

  // Sample check
  const { data: sampleData } = await supabase
    .from('medicines')
    .select('id, product_name, generic, unit_price, pack_mrp')
    .not('generic', 'is', null)
    .limit(5);

  console.log('Sample updated medicines:');
  console.log(sampleData);
}

populateGenerics();


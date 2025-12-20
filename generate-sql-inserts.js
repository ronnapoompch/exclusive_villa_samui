const fs = require('fs');

// Read exported data
const data = JSON.parse(fs.readFileSync('export-villa-data.json', 'utf8'));

console.log(`📊 Generating SQL for ${data.villas.length} villas and ${data.images.length} images...`);

let sql = '';

// Helper function to escape SQL strings
function escapeSql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value;
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Generate villa inserts in batches
sql += '-- ==========================================\n';
sql += '-- INSERT VILLAS\n';
sql += '-- ==========================================\n\n';

const batchSize = 50;
for (let i = 0; i < data.villas.length; i += batchSize) {
  const batch = data.villas.slice(i, i + batchSize);
  
  sql += `INSERT INTO "villas" (
    "id", "name", "slug", "description", "bedrooms", "bathrooms", "maxGuests",
    "beachfront", "location", "locationLink", "phone", "officialWebsite",
    "airbnbUrl", "agodaUrl", "images", "amenities", "minimumStay",
    "petFriendly", "cleaning", "cook", "utilities", "active", "featured",
    "createdAt", "updatedAt"
  ) VALUES\n`;
  
  batch.forEach((villa, idx) => {
    const comma = idx < batch.length - 1 ? ',' : ';';
    sql += `  (${escapeSql(villa.id)}, ${escapeSql(villa.name)}, ${escapeSql(villa.slug)}, ${escapeSql(villa.description)}, ${villa.bedrooms}, ${villa.bathrooms}, ${villa.maxGuests}, ${escapeSql(villa.beachfront)}, ${escapeSql(villa.location)}, ${escapeSql(villa.locationLink)}, ${escapeSql(villa.phone)}, ${escapeSql(villa.officialWebsite)}, ${escapeSql(villa.airbnbUrl)}, ${escapeSql(villa.agodaUrl)}, ${escapeSql(villa.images)}, ${escapeSql(villa.amenities)}, ${escapeSql(villa.minimumStay)}, ${escapeSql(villa.petFriendly)}, ${escapeSql(villa.cleaning)}, ${escapeSql(villa.cook)}, ${escapeSql(villa.utilities)}, ${escapeSql(villa.active)}, ${escapeSql(villa.featured)}, ${escapeSql(villa.createdAt)}, ${escapeSql(villa.updatedAt)})${comma}\n`;
  });
  
  sql += '\n';
}

// Generate image inserts in batches
sql += '-- ==========================================\n';
sql += '-- INSERT VILLA IMAGES\n';
sql += '-- ==========================================\n\n';

const imageBatchSize = 100;
for (let i = 0; i < data.images.length; i += imageBatchSize) {
  const batch = data.images.slice(i, i + imageBatchSize);
  
  sql += `INSERT INTO "villa_images" (
    "id", "villaId", "url", "category", "order", "altText",
    "width", "height", "size", "format", "isHero",
    "createdAt", "updatedAt"
  ) VALUES\n`;
  
  batch.forEach((img, idx) => {
    const comma = idx < batch.length - 1 ? ',' : ';';
    sql += `  (${escapeSql(img.id)}, ${escapeSql(img.villaId)}, ${escapeSql(img.url)}, ${escapeSql(img.category)}, ${img.order}, ${escapeSql(img.altText)}, ${escapeSql(img.width)}, ${escapeSql(img.height)}, ${escapeSql(img.size)}, ${escapeSql(img.format)}, ${escapeSql(img.isHero)}, ${escapeSql(img.createdAt)}, ${escapeSql(img.updatedAt)})${comma}\n`;
  });
  
  sql += '\n';
}

// Write to file
fs.writeFileSync('supabase-import-data.sql', sql);

const stats = {
  totalSize: (sql.length / 1024 / 1024).toFixed(2) + ' MB',
  villas: data.villas.length,
  images: data.images.length,
  lines: sql.split('\n').length
};

console.log('\n✅ SQL generated successfully!');
console.log('📄 File: supabase-import-data.sql');
console.log(`📊 Stats:`, stats);
console.log('\n📋 Next steps:');
console.log('1. Open https://supabase.com/dashboard/project/apyrnttbxpountnopuoq/sql/new');
console.log('2. Copy content from supabase-import-data.sql');
console.log('3. Paste and run in SQL Editor');
console.log('4. Wait ~30 seconds for completion');
console.log('5. Production site will work immediately! 🎉');

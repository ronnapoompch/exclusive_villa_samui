// Generate SQL dump for production import
const fs = require('fs');

function generateSQLDump() {
  try {
    console.log('📝 Generating SQL dump for production...\n');

    if (!fs.existsSync('export-villa-data.json')) {
      console.error('❌ export-villa-data.json not found!');
      console.log('   Run: node export-for-production.js first');
      return;
    }

    const exportData = JSON.parse(fs.readFileSync('export-villa-data.json', 'utf8'));
    console.log(`📊 Processing ${exportData.totalVillas} villas...\n`);

    let sql = `-- Exclusive Villa Samui - Production Data
-- Generated: ${new Date().toISOString()}
-- Total Villas: ${exportData.totalVillas}
-- Total Images: ${exportData.totalImages}

-- Begin transaction
BEGIN;

`;

    let villaCount = 0;
    let imageCount = 0;
    let pricingCount = 0;

    for (const villa of exportData.villas) {
      // Escape single quotes in strings
      const escapeSql = (str) => str ? str.replace(/'/g, "''") : '';

      // Insert Villa
      sql += `-- Villa: ${villa.name}\n`;
      sql += `INSERT INTO "Villa" (id, slug, name, description, bedrooms, bathrooms, "maxGuests", beachfront, location, amenities, featured, active, "createdAt", "updatedAt")\n`;
      sql += `VALUES (\n`;
      sql += `  '${villa.id}',\n`;
      sql += `  '${escapeSql(villa.slug)}',\n`;
      sql += `  '${escapeSql(villa.name)}',\n`;
      sql += `  '${escapeSql(villa.description || '')}',\n`;
      sql += `  ${villa.bedrooms},\n`;
      sql += `  ${villa.bathrooms},\n`;
      sql += `  ${villa.maxGuests},\n`;
      sql += `  ${villa.beachfront},\n`;
      sql += `  '${escapeSql(villa.location)}',\n`;
      sql += `  ARRAY[${villa.amenities.map(a => `'${escapeSql(a)}'`).join(', ')}]::text[],\n`;
      sql += `  ${villa.featured || false},\n`;
      sql += `  ${villa.active !== false},\n`;
      sql += `  '${villa.createdAt || new Date().toISOString()}',\n`;
      sql += `  '${villa.updatedAt || new Date().toISOString()}'\n`;
      sql += `);\n\n`;
      villaCount++;

      // Insert Images
      if (villa.villaImages && villa.villaImages.length > 0) {
        for (const img of villa.villaImages) {
          sql += `INSERT INTO "VillaImage" (id, "villaId", url, category, "order", "isHero", "altText", "createdAt", "updatedAt")\n`;
          sql += `VALUES (\n`;
          sql += `  '${img.id}',\n`;
          sql += `  '${villa.id}',\n`;
          sql += `  '${escapeSql(img.url)}',\n`;
          sql += `  '${escapeSql(img.category)}',\n`;
          sql += `  ${img.order},\n`;
          sql += `  ${img.isHero || false},\n`;
          sql += `  '${escapeSql(img.altText || '')}',\n`;
          sql += `  '${img.createdAt || new Date().toISOString()}',\n`;
          sql += `  '${img.updatedAt || new Date().toISOString()}'\n`;
          sql += `);\n`;
          imageCount++;
        }
        sql += `\n`;
      }

      // Insert Pricing
      if (villa.pricing && villa.pricing.length > 0) {
        for (const price of villa.pricing) {
          sql += `INSERT INTO "VillaPricing" (id, "villaId", "dailyRate", "weeklyRate", "monthlyRate", currency, "validFrom", "validTo", "createdAt", "updatedAt")\n`;
          sql += `VALUES (\n`;
          sql += `  '${price.id}',\n`;
          sql += `  '${villa.id}',\n`;
          sql += `  ${price.dailyRate || 0},\n`;
          sql += `  ${price.weeklyRate || null},\n`;
          sql += `  ${price.monthlyRate || null},\n`;
          sql += `  '${price.currency || 'USD'}',\n`;
          sql += `  '${price.validFrom || new Date().toISOString()}',\n`;
          sql += `  ${price.validTo ? `'${price.validTo}'` : 'NULL'},\n`;
          sql += `  '${price.createdAt || new Date().toISOString()}',\n`;
          sql += `  '${price.updatedAt || new Date().toISOString()}'\n`;
          sql += `);\n`;
          pricingCount++;
        }
        sql += `\n`;
      }

      if (villaCount % 10 === 0) {
        console.log(`📝 Processed ${villaCount}/${exportData.totalVillas} villas...`);
      }
    }

    sql += `-- Commit transaction
COMMIT;

-- Summary
-- Villas: ${villaCount}
-- Images: ${imageCount}
-- Pricing: ${pricingCount}
`;

    // Save to file
    fs.writeFileSync('production-import.sql', sql);

    console.log(`\n✅ SQL dump generated successfully!`);
    console.log(`📁 File: production-import.sql`);
    console.log(`📊 Stats:`);
    console.log(`   Villas: ${villaCount}`);
    console.log(`   Images: ${imageCount}`);
    console.log(`   Pricing: ${pricingCount}`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Go to Vercel Postgres dashboard`);
    console.log(`   2. Use the Query tab or import tool`);
    console.log(`   3. Run the SQL file: production-import.sql`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateSQLDump();

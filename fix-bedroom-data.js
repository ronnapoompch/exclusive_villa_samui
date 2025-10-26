const fs = require('fs');

console.log('🔧 Fixing villa data with Excel date numbers...\n');

const data = JSON.parse(fs.readFileSync('./data/villas-optimized.json', 'utf8'));

console.log(`Total villas: ${data.length}\n`);

// Map of known bad data to correct data
const fixes = {
  'chaweng-cresta-hill': { bedrooms: 3, bathrooms: 3, guests: 8, note: 'Was 3-4BR' },
  'cadenza-garden-2-4br': { bedrooms: 2, bathrooms: 2, guests: 8, note: 'Was 2-4BR' },
  'millennial-residence-villa-solara': { bedrooms: 4, bathrooms: 4, guests: 8, note: 'Was 4BR' },
  'millennial-residence-villa-wind': { bedrooms: 4, bathrooms: 4, guests: 8, note: 'Was 4BR' },
  'porta-santi': { bedrooms: 3, bathrooms: 3, guests: 6, note: 'Was 3BR' },
  'seluna-blue-orchid': { bedrooms: 3, bathrooms: 3, guests: 6, note: 'Was 3BR' },
  'seluna-boat-lagoon': { bedrooms: 3, bathrooms: 3, guests: 6, note: 'Was 3BR' },
  'samui-sentry-villa-2-4br': { bedrooms: 2, bathrooms: 2, guests: 8, note: 'Was 2-4BR' },
  'serene-villa-4-5br': { bedrooms: 4, bathrooms: 4, guests: 10, note: 'Was 4-5BR' },
  'sunny-suan-kachamudee': { bedrooms: 5, bathrooms: 5, guests: 10, note: 'Was 5BR' },
};

let fixedCount = 0;

data.forEach(villa => {
  if (fixes[villa.slug]) {
    const fix = fixes[villa.slug];
    console.log(`✅ Fixing: ${villa.name}`);
    console.log(`   Before: Bed=${villa.bedrooms}, Bath=${villa.bathrooms}, Guests=${villa.guests}`);
    
    villa.bedrooms = fix.bedrooms;
    villa.bathrooms = fix.bathrooms;
    villa.guests = fix.guests;
    
    console.log(`   After:  Bed=${villa.bedrooms}, Bath=${villa.bathrooms}, Guests=${villa.guests}`);
    console.log(`   Note: ${fix.note}\n`);
    fixedCount++;
  }
});

console.log(`\n🎯 Fixed ${fixedCount} villas\n`);

// Save backup
fs.writeFileSync('./data/backups/villas-optimized-before-bedroom-fix.json', 
  JSON.stringify(data, null, 2));
console.log('💾 Backup saved to: data/backups/villas-optimized-before-bedroom-fix.json');

// Save fixed data
fs.writeFileSync('./data/villas-optimized.json', 
  JSON.stringify(data, null, 2));
console.log('✅ Fixed data saved to: data/villas-optimized.json');

// Also update by-slug version
const bySlug = {};
data.forEach(villa => {
  bySlug[villa.slug] = villa;
});
fs.writeFileSync('./data/villas-optimized-by-slug.json', 
  JSON.stringify(bySlug, null, 2));
console.log('✅ Updated: data/villas-optimized-by-slug.json');

console.log('\n✨ Done!');

// Fix specific villas with missing data
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing villas with missing data...\n');

const jsonPath = path.join(__dirname, 'data', 'villas-optimized.json');
const villas = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let fixed = 0;

villas.forEach(villa => {
  let changed = false;
  
  // Fix bedrooms = 0
  if (villa.bedrooms === 0) {
    villa.bedrooms = 3; // Default
    villa.bathrooms = 2;
    villa.guests = 6;
    changed = true;
    console.log(`✅ Fixed ${villa.name}: bedrooms=${villa.bedrooms}`);
  }
  
  // Fix price = 0
  if (villa.pricePerNight === 0) {
    villa.pricePerNight = villa.bedrooms * 5000;
    changed = true;
    console.log(`✅ Fixed ${villa.name}: price=${villa.pricePerNight}`);
  }
  
  if (changed) fixed++;
});

// Save
fs.writeFileSync(jsonPath, JSON.stringify(villas, null, 2));

// Update by-slug version
const bySlug = {};
villas.forEach(v => { bySlug[v.slug] = v; });
fs.writeFileSync(
  jsonPath.replace('.json', '-by-slug.json'),
  JSON.stringify(bySlug, null, 2)
);

console.log(`\n✅ Fixed ${fixed} villas`);
console.log('💾 Saved updated JSON files\n');

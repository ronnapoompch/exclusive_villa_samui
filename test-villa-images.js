const villasData = require('./data/villas-with-pricing.json');

console.log('\n=== Testing Villa Images ===\n');

let noImages = [];
let withImages = [];

villasData.forEach(villa => {
  const imageCategories = [
    villa.hero || [],
    villa.ext || [],
    villa.liv || [],
    villa.bed || [],
    villa['bed1'] || [],
    villa['bed2-5'] || [],
    villa.bath1 || [],
    villa['bath2-5'] || [],
    villa.kit || [],
    villa.din || [],
    villa.pool || [],
    villa.amen || [],
    villa.view || [],
    villa.oth || [],
    villa.gallery || []
  ];
  
  const totalImages = imageCategories.reduce((sum, arr) => sum + arr.length, 0);
  
  if (totalImages === 0) {
    noImages.push({
      name: villa.name,
      codeId: villa.codeId,
      slug: villa.slug
    });
  } else {
    withImages.push({
      name: villa.name,
      codeId: villa.codeId,
      totalImages,
      hero: (villa.hero || []).length,
      ext: (villa.ext || []).length,
      liv: (villa.liv || []).length
    });
  }
});

console.log(`✅ Total villas: ${villasData.length}`);
console.log(`✅ Villas with images: ${withImages.length}`);
console.log(`❌ Villas without images: ${noImages.length}`);

if (noImages.length > 0) {
  console.log('\n❌ Villas without images:');
  noImages.forEach(v => {
    console.log(`   - ${v.name} [${v.codeId}] (${v.slug})`);
  });
}

console.log('\n=== Sample Villas with Images ===');
withImages.slice(0, 5).forEach(v => {
  console.log(`✅ ${v.name}`);
  console.log(`   Total: ${v.totalImages} (Hero: ${v.hero}, Ext: ${v.ext}, Liv: ${v.liv})`);
});

// Test the images array construction
console.log('\n=== Testing Images Array Construction ===');
const testVilla = villasData[0];
const constructedImages = [
  ...(testVilla.hero || []),
  ...(testVilla.ext || []),
  ...(testVilla.liv || []),
  ...(testVilla.bed || []),
  ...(testVilla['bed1'] || []),
  ...(testVilla['bed2-5'] || []),
  ...(testVilla.bath1 || []),
  ...(testVilla['bath2-5'] || []),
  ...(testVilla.kit || []),
  ...(testVilla.din || []),
  ...(testVilla.pool || []),
  ...(testVilla.amen || []),
  ...(testVilla.view || []),
  ...(testVilla.oth || []),
  ...(testVilla.gallery || []),
].filter(Boolean);

console.log(`\nTest Villa: ${testVilla.name}`);
console.log(`Images array length: ${constructedImages.length}`);
console.log(`First image: ${constructedImages[0]?.substring(0, 80)}...`);

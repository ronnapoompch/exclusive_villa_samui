const fs = require('fs');
const villasData = require('./data/villas-with-pricing.json');
const reuploadResults = require('./reupload-results.json');

console.log('🔄 Updating villas-with-pricing.json with new Vercel Blob URLs...\n');

let updatedCount = 0;

// Create a map of reuploaded villas
const reuploadMap = new Map();
reuploadResults.forEach(result => {
  reuploadMap.set(result.slug, result.images);
});

// Update villas data
const updatedVillas = villasData.map(villa => {
  const newImages = reuploadMap.get(villa.slug);
  
  if (newImages) {
    console.log(`✅ Updating: ${villa.name} (${villa.slug})`);
    updatedCount++;
    
    // Update all image categories
    return {
      ...villa,
      hero: newImages.hero || villa.hero || [],
      ext: newImages.ext || villa.ext || [],
      liv: newImages.liv || villa.liv || [],
      bed: newImages.bed || villa.bed || [],
      bed1: newImages.bed1 || villa.bed1 || [],
      'bed2-5': newImages['bed2-5'] || villa['bed2-5'] || [],
      bath1: newImages.bath1 || villa.bath1 || [],
      'bath2-5': newImages['bath2-5'] || villa['bath2-5'] || [],
      kit: newImages.kit || villa.kit || [],
      din: newImages.din || villa.din || [],
      pool: newImages.pool || villa.pool || [],
      amen: newImages.amen || villa.amen || [],
      view: newImages.view || villa.view || [],
      oth: newImages.oth || villa.oth || [],
      gallery: newImages.gallery || villa.gallery || []
    };
  }
  
  return villa;
});

// Save updated data
fs.writeFileSync(
  'data/villas-with-pricing.json',
  JSON.stringify(updatedVillas, null, 2)
);

// Also update src/data copy
fs.writeFileSync(
  'src/data/villas-with-pricing.json',
  JSON.stringify(updatedVillas, null, 2)
);

console.log(`\n=== Update Complete ===`);
console.log(`✅ Updated ${updatedCount} villas`);
console.log(`✅ Saved to: data/villas-with-pricing.json`);
console.log(`✅ Saved to: src/data/villas-with-pricing.json`);
console.log(`\n🎉 Done! Restart dev server to see changes.`);

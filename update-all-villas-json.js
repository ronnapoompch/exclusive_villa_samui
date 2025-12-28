const fs = require('fs');
const villasData = require('./data/villas-with-pricing.json');

try {
  const uploadResults = require('./upload-all-results.json');
  
  console.log('🔄 Updating all villas with new images...\n');

  const uploadMap = new Map();
  uploadResults.forEach(result => {
    uploadMap.set(result.slug, result.images);
  });

  let updatedCount = 0;

  const updatedVillas = villasData.map(villa => {
    const newImages = uploadMap.get(villa.slug);
    
    if (newImages) {
      console.log(`✅ ${villa.name}`);
      updatedCount++;
      
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

  fs.writeFileSync('data/villas-with-pricing.json', JSON.stringify(updatedVillas, null, 2));
  fs.writeFileSync('src/data/villas-with-pricing.json', JSON.stringify(updatedVillas, null, 2));

  console.log(`\n✅ Updated ${updatedCount} villas`);
  console.log('✅ Saved to: data/villas-with-pricing.json');
  console.log('✅ Saved to: src/data/villas-with-pricing.json');
  console.log('\n🎉 Done! Restart dev server');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('Make sure upload-all-results.json exists');
}

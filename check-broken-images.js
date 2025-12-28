const https = require('https');
const villasData = require('./data/villas-with-pricing.json');
const fs = require('fs');

console.log('\n🔍 Checking for broken image URLs...\n');

const brokenImages = {
  villas: [],
  totalBroken: 0,
  totalChecked: 0
};

// Check if URL is accessible
async function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) {
      resolve(false);
      return;
    }

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function checkVillas() {
  for (const villa of villasData.slice(0, 50)) { // Check first 50 villas
    console.log(`Checking: ${villa.name}...`);
    
    const villaImages = {
      name: villa.name,
      codeId: villa.codeId,
      slug: villa.slug,
      broken: []
    };

    const allImages = [
      ...(villa.hero || []),
      ...(villa.ext || []),
      ...(villa.liv || [])
    ];

    if (allImages.length === 0) {
      console.log(`  ⚠️  No images found`);
      continue;
    }

    // Check first 3 images only for speed
    for (const url of allImages.slice(0, 3)) {
      brokenImages.totalChecked++;
      const isAccessible = await checkUrl(url);
      
      if (!isAccessible) {
        brokenImages.totalBroken++;
        villaImages.broken.push(url);
        console.log(`  ❌ BROKEN: ${url.substring(0, 80)}...`);
      } else {
        console.log(`  ✅ OK`);
      }
    }

    if (villaImages.broken.length > 0) {
      brokenImages.villas.push(villaImages);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total URLs checked: ${brokenImages.totalChecked}`);
  console.log(`Broken URLs: ${brokenImages.totalBroken}`);
  console.log(`Villas with broken images: ${brokenImages.villas.length}`);

  if (brokenImages.villas.length > 0) {
    console.log('\n❌ Villas with broken images:');
    brokenImages.villas.forEach(v => {
      console.log(`\n${v.name} [${v.codeId}]`);
      v.broken.forEach(url => console.log(`  - ${url.substring(80, 120)}...`));
    });

    fs.writeFileSync(
      'broken-images-report.json',
      JSON.stringify(brokenImages, null, 2)
    );
    console.log('\n📝 Report saved to: broken-images-report.json');
  } else {
    console.log('\n✅ All checked images are accessible!');
  }
}

checkVillas().catch(console.error);

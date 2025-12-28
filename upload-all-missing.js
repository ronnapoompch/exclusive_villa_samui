const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

const VERCEL_BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_IMAGES_BASE = 'C:\\Users\\ronna\\exclusive-villa-samui\\public\\optimized-villas';
const villasData = require('./data/villas-with-pricing.json');

if (!VERCEL_BLOB_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN not found');
  process.exit(1);
}

async function uploadImage(localPath, blobPath) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      token: VERCEL_BLOB_TOKEN,
      addRandomSuffix: false
    });
    return blob.url;
  } catch (error) {
    if (error.message.includes('already exists')) {
      // Image already uploaded, construct URL
      return `https://xkoncnp41eepsysa.public.blob.vercel-storage.com/${blobPath}`;
    }
    console.error(`Failed: ${error.message}`);
    return null;
  }
}

async function uploadVillaImages(villaSlug) {
  const villaFolder = path.join(LOCAL_IMAGES_BASE, villaSlug);
  
  if (!fs.existsSync(villaFolder)) {
    return null;
  }

  const uploaded = { slug: villaSlug, images: {}, total: 0 };
  const categories = ['hero', 'ext', 'liv', 'bed', 'bed1', 'bed2-5', 'bath1', 'bath2-5', 'kit', 'din', 'pool', 'amen', 'view', 'oth'];

  for (const category of categories) {
    const categoryFolder = path.join(villaFolder, category);
    if (!fs.existsSync(categoryFolder)) continue;

    const files = fs.readdirSync(categoryFolder).filter(f => 
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );

    if (files.length === 0) continue;
    uploaded.images[category] = [];

    for (const file of files) {
      const localPath = path.join(categoryFolder, file);
      const blobPath = `villas/${villaSlug}/${category}/${file}`;
      const url = await uploadImage(localPath, blobPath);
      
      if (url) {
        uploaded.images[category].push(url);
        uploaded.total++;
        process.stdout.write('.');
      } else {
        process.stdout.write('X');
      }
    }
  }

  return uploaded;
}

async function main() {
  console.log('🔍 Finding villas with missing or few images...\n');
  
  const villasToUpload = [];
  
  for (const villa of villasData) {
    const totalImages = (villa.hero?.length || 0) + (villa.ext?.length || 0) + (villa.liv?.length || 0);
    
    // If villa has less than 3 images, it needs upload
    if (totalImages < 3) {
      const villaFolder = path.join(LOCAL_IMAGES_BASE, villa.slug);
      if (fs.existsSync(villaFolder)) {
        villasToUpload.push(villa);
        console.log(`⚠️  ${villa.name} (${villa.slug}) - ${totalImages} images`);
      }
    }
  }

  console.log(`\n📋 Found ${villasToUpload.length} villas needing upload\n`);
  
  if (villasToUpload.length === 0) {
    console.log('✅ All villas have sufficient images!');
    return;
  }

  const results = [];
  let totalUploaded = 0;

  for (const villa of villasToUpload) {
    console.log(`\n🔄 Uploading: ${villa.name}`);
    const result = await uploadVillaImages(villa.slug);
    
    if (result && result.total > 0) {
      results.push(result);
      totalUploaded += result.total;
      console.log(`\n  ✅ ${result.total} images`);
    } else {
      console.log(`\n  ⚠️  No new images uploaded`);
    }
  }

  fs.writeFileSync('upload-all-results.json', JSON.stringify(results, null, 2));

  console.log('\n=== Summary ===');
  console.log(`Villas processed: ${villasToUpload.length}`);
  console.log(`Villas uploaded: ${results.length}`);
  console.log(`Total images: ${totalUploaded}`);
  console.log('\n📝 Results: upload-all-results.json');
  
  if (results.length > 0) {
    console.log('\n⚠️  Next: Run update-all-villas-json.js');
  }
}

main().catch(console.error);

const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Villas that need re-upload based on screenshot
const brokenVillas = [
  'villa-amnado',
  'villa-asi-azure', 
  'villa-astro',
  'villa-delsy'
];

const VERCEL_BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_IMAGES_BASE = 'C:\\Users\\ronna\\exclusive-villa-samui\\public\\optimized-villas';

if (!VERCEL_BLOB_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment');
  process.exit(1);
}

async function uploadImage(localPath, blobPath) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      token: VERCEL_BLOB_TOKEN,
    });
    return blob.url;
  } catch (error) {
    console.error(`Failed to upload ${localPath}:`, error.message);
    return null;
  }
}

async function reuploadVilla(villaSlug) {
  console.log(`\n🔄 Re-uploading: ${villaSlug}`);
  
  const villaFolder = path.join(LOCAL_IMAGES_BASE, villaSlug);
  
  if (!fs.existsSync(villaFolder)) {
    console.log(`  ⚠️  Folder not found: ${villaFolder}`);
    return null;
  }

  const uploadedImages = {
    slug: villaSlug,
    images: {},
    totalUploaded: 0
  };

  // Categories to upload
  const categories = ['hero', 'ext', 'liv', 'bed', 'bed1', 'bed2-5', 'bath1', 'bath2-5', 'kit', 'din', 'pool', 'amen', 'view', 'oth'];

  for (const category of categories) {
    const categoryFolder = path.join(villaFolder, category);
    
    if (!fs.existsSync(categoryFolder)) {
      continue;
    }

    const files = fs.readdirSync(categoryFolder).filter(f => 
      f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
    );

    if (files.length === 0) continue;

    uploadedImages.images[category] = [];
    console.log(`  📁 ${category}: ${files.length} images`);

    for (const file of files) {
      const localPath = path.join(categoryFolder, file);
      const blobPath = `villas/${villaSlug}/${category}/${file}`;
      
      const url = await uploadImage(localPath, blobPath);
      
      if (url) {
        uploadedImages.images[category].push(url);
        uploadedImages.totalUploaded++;
        process.stdout.write('.');
      } else {
        process.stdout.write('X');
      }
    }
    console.log(''); // New line after dots
  }

  console.log(`  ✅ Uploaded ${uploadedImages.totalUploaded} images`);
  return uploadedImages;
}

async function main() {
  console.log('🚀 Starting re-upload for broken villas...\n');
  
  const results = [];
  
  for (const slug of brokenVillas) {
    const result = await reuploadVilla(slug);
    if (result) {
      results.push(result);
    }
  }

  // Save results
  fs.writeFileSync(
    'reupload-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n=== Summary ===');
  console.log(`Total villas re-uploaded: ${results.length}`);
  console.log(`Total images uploaded: ${results.reduce((sum, r) => sum + r.totalUploaded, 0)}`);
  console.log('\n📝 Results saved to: reupload-results.json');
  console.log('\n⚠️  Next step: Run update-broken-villas-json.js to update the JSON file');
}

main().catch(console.error);

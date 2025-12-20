const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://apyrnttbxpountnopuoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweXJudHRieHBvdW50bm9wdW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcwOTMyMiwiZXhwIjoyMDc3Mjg1MzIyfQ.PZCOKxrUxOdIzd-iFoHsVjKb3ZfaAYYEC8rVglq4q6Q';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
const prisma = new PrismaClient();

const PUBLIC_DIR = path.join(__dirname, 'public');
const BUCKET_NAME = 'villa-images';

let stats = {
  totalFiles: 0,
  uploaded: 0,
  failed: 0,
  skipped: 0,
  fileNotFound: 0,
  errors: [],
  missingFiles: []
};

async function createBucket() {
  console.log('📦 Checking storage bucket...');
  
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.find(b => b.name === BUCKET_NAME);
    
    if (exists) {
      console.log('✅ Bucket already exists\n');
      return;
    }
    
    console.log('Creating new bucket...');
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/jpg', 'image/png']
    });
    
    if (error) throw error;
    console.log('✅ Bucket created successfully\n');
  } catch (error) {
    console.log('⚠️  Bucket creation failed (may already exist):', error.message);
    console.log('Continuing with upload...\n');
  }
}

async function uploadImage(localPath, storagePath) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year
        upsert: false
      });
    
    if (error) {
      if (error.message.includes('already exists')) {
        stats.skipped++;
        return { success: true, skipped: true };
      }
      throw error;
    }
    
    stats.uploaded++;
    return { success: true, data };
  } catch (error) {
    stats.failed++;
    stats.errors.push({ path: storagePath, error: error.message });
    return { success: false, error };
  }
}

async function getPublicUrl(storagePath) {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);
  
  return data.publicUrl;
}

async function uploadAllImages() {
  console.log('\n📤 Starting upload to Supabase Storage...\n');
  
  // Get all images from database
  const images = await prisma.villaImage.findMany({
    include: {
      villa: {
        select: { slug: true }
      }
    },
    orderBy: { villaId: 'asc' }
  });
  
  stats.totalFiles = images.length;
  console.log(`📊 Found ${stats.totalFiles} images in database\n`);
  
  const urlUpdates = [];
  let processed = 0;
  
  for (const image of images) {
    processed++;
    
    // Parse local path: /optimized-villas/{slug}/{category}/image.webp
    const urlParts = image.url.split('/').filter(p => p);
    if (urlParts[0] !== 'optimized-villas') {
      console.log(`⚠️  Skipping non-local URL: ${image.url}`);
      stats.skipped++;
      continue;
    }
    
    const slug = urlParts[1];
    const category = urlParts[2];
    const filename = urlParts[3];
    
    // Local file path
    const localPath = path.join(PUBLIC_DIR, 'optimized-villas', slug, category, filename);
    
    if (!fs.existsSync(localPath)) {
      stats.fileNotFound++;
      stats.missingFiles.push({
        url: image.url,
        expectedPath: localPath,
        villaSlug: slug
      });
      
      // Don't log every missing file to avoid spam
      if (stats.fileNotFound <= 10) {
        console.log(`\n⚠️  File not found [${stats.fileNotFound}]: ${slug}/${category}/${filename}`);
      } else if (stats.fileNotFound === 11) {
        console.log(`\n⚠️  ... suppressing further missing file messages (will show summary at end)`);
      }
      continue;
    }
    
    // Storage path: {slug}/{category}/{filename}
    const storagePath = `${slug}/${category}/${filename}`;
    
    // Upload
    const result = await uploadImage(localPath, storagePath);
    
    if (result.success) {
      const publicUrl = await getPublicUrl(storagePath);
      urlUpdates.push({
        id: image.id,
        newUrl: publicUrl
      });
      
      if (result.skipped) {
        process.stdout.write(`⏭️  [${processed}/${stats.totalFiles}] Skipped: ${storagePath}\r`);
      } else {
        process.stdout.write(`✅ [${processed}/${stats.totalFiles}] Uploaded: ${storagePath}\r`);
      }
    } else {
      console.log(`\n❌ [${processed}/${stats.totalFiles}] Failed: ${storagePath}`);
      console.log(`   Error: ${result.error?.message || 'Unknown error'}`);
    }
    
    // Progress update every 100 images
    if (processed % 100 === 0) {
      console.log(`\n📊 Progress: ${processed}/${stats.totalFiles} (${((processed/stats.totalFiles)*100).toFixed(1)}%)`);
      console.log(`   ✅ Uploaded: ${stats.uploaded} | ⏭️  Skipped: ${stats.skipped} | ❌ Failed: ${stats.failed}`);
    }
  }
  
  console.log('\n\n🔄 Updating database URLs...\n');
  
  // Update database with new URLs
  let updated = 0;
  for (const { id, newUrl } of urlUpdates) {
    try {
      await prisma.villaImage.update({
        where: { id },
        data: { url: newUrl }
      });
      updated++;
      process.stdout.write(`🔄 Updated ${updated}/${urlUpdates.length} URLs\r`);
    } catch (error) {
      console.log(`\n❌ Failed to update ${id}:`, error.message);
    }
  }
  
  console.log(`\n✅ Updated ${updated} database records\n`);
}

async function main() {
  try {
    console.log('🚀 Supabase Storage Upload\n');
    console.log('📍 Supabase URL:', supabaseUrl);
    console.log('📦 Bucket:', BUCKET_NAME);
    console.log('📁 Source:', PUBLIC_DIR);
    console.log('');
    
    // Step 1: Create bucket
    await createBucket();
    
    // Step 2: Upload all images
    await uploadAllImages();
    
    // Final stats
    console.log('\n' + '='.repeat(60));
    console.log('📊 UPLOAD COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total images: ${stats.totalFiles}`);
    console.log(`✅ Uploaded:  ${stats.uploaded}`);
    console.log(`⏭️  Skipped:   ${stats.skipped}`);
    console.log(`⚠️  Not found: ${stats.fileNotFound}`);
    console.log(`❌ Failed:    ${stats.failed}`);
    
    if (stats.missingFiles.length > 0) {
      console.log('\n⚠️  Missing files by villa:');
      const byVilla = stats.missingFiles.reduce((acc, f) => {
        acc[f.villaSlug] = (acc[f.villaSlug] || 0) + 1;
        return acc;
      }, {});
      Object.entries(byVilla)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([slug, count]) => {
          console.log(`   ${slug}: ${count} missing files`);
        });
      if (Object.keys(byVilla).length > 10) {
        console.log(`   ... and ${Object.keys(byVilla).length - 10} more villas`);
      }
    }
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Upload errors:');
      stats.errors.slice(0, 5).forEach(e => {
        console.log(`   ${e.path}: ${e.error}`);
      });
      if (stats.errors.length > 5) {
        console.log(`   ... and ${stats.errors.length - 5} more errors`);
      }
    }
    
    console.log('\n🎉 Images are now accessible via Supabase Storage CDN!');
    console.log(`🌐 Base URL: ${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`);
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

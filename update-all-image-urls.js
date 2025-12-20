const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

const supabaseUrl = 'https://apyrnttbxpountnopuoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweXJudHRieHBvdW50bm9wdW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcwOTMyMiwiZXhwIjoyMDc3Mjg1MzIyfQ.PZCOKxrUxOdIzd-iFoHsVjKb3ZfaAYYEC8rVglq4q6Q';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'villa-images';

async function updateAllUrls() {
  console.log('🔄 Updating all image URLs to Supabase Storage...\n');
  
  try {
    // Get all local URLs
    const images = await prisma.villaImage.findMany({
      where: {
        url: { startsWith: '/optimized-villas' }
      },
      include: {
        villa: { select: { slug: true } }
      }
    });
    
    console.log(`📊 Found ${images.length} images with local URLs\n`);
    
    let updated = 0;
    let notFound = 0;
    let errors = 0;
    
    for (const image of images) {
      try {
        // Convert local path to storage path
        // /optimized-villas/{slug}/{category}/{filename} -> {slug}/{category}/{filename}
        const localPath = image.url.replace('/optimized-villas/', '');
        
        // Check if file exists in Supabase
        const { data: files, error: listError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(localPath.substring(0, localPath.lastIndexOf('/')), {
            search: localPath.substring(localPath.lastIndexOf('/') + 1)
          });
        
        if (listError || !files || files.length === 0) {
          notFound++;
          continue;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(localPath);
        
        // Update database
        await prisma.villaImage.update({
          where: { id: image.id },
          data: { url: urlData.publicUrl }
        });
        
        updated++;
        
        if (updated % 100 === 0) {
          process.stdout.write(`🔄 Updated: ${updated}, Not found: ${notFound}, Errors: ${errors}\r`);
        }
        
      } catch (error) {
        errors++;
        console.error(`\n❌ Error updating ${image.id}:`, error.message);
      }
    }
    
    console.log(`\n\n✅ Update Complete!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Not found in Supabase: ${notFound}`);
    console.log(`   Errors: ${errors}`);
    
    // Verify
    const supabaseCount = await prisma.villaImage.count({
      where: { url: { startsWith: 'https://apyrnttbxpountnopuoq.supabase.co' } }
    });
    
    console.log(`\n📊 Final count: ${supabaseCount} images with Supabase URLs`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllUrls();

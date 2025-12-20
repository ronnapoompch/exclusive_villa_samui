const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const supabaseUrl = 'https://apyrnttbxpountnopuoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweXJudHRieHBvdW50bm9wdW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcwOTMyMiwiZXhwIjoyMDc3Mjg1MzIyfQ.PZCOKxrUxOdIzd-iFoHsVjKb3ZfaAYYEC8rVglq4q6Q';

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function syncWithSupabase() {
  console.log('🔄 Syncing database with actual Supabase files...\n');
  
  try {
    // Get all villa slugs
    const villas = await prisma.villa.findMany({ select: { slug: true } });
    console.log(`📊 Checking ${villas.length} villas...\n`);
    
    let totalChecked = 0;
    let totalFound = 0;
    let totalDeleted = 0;
    
    for (const villa of villas.slice(0, 5)) { // Test with first 5 villas
      // Get images for this villa
      const images = await prisma.villaImage.findMany({
        where: { villa: { slug: villa.slug } }
      });
      
      if (images.length === 0) continue;
      
      console.log(`\n🏠 ${villa.slug}: ${images.length} images in database`);
      
      for (const image of images) {
        totalChecked++;
        
        // Extract storage path from URL
        const storagePath = image.url.replace(`${supabaseUrl}/storage/v1/object/public/villa-images/`, '');
        
        // Check if file exists in Supabase
        const { data, error } = await supabase.storage
          .from('villa-images')
          .download(storagePath);
        
        if (error || !data) {
          console.log(`   ❌ Not in Supabase: ${storagePath.substring(0, 60)}...`);
          
          // Delete from database
          await prisma.villaImage.delete({ where: { id: image.id } });
          totalDeleted++;
        } else {
          totalFound++;
        }
        
        if (totalChecked % 10 === 0) {
          process.stdout.write(`   Checked: ${totalChecked}, Found: ${totalFound}, Deleted: ${totalDeleted}\r`);
        }
      }
    }
    
    console.log(`\n\n✅ Sync complete!`);
    console.log(`   Checked: ${totalChecked}`);
    console.log(`   Found in Supabase: ${totalFound}`);
    console.log(`   Deleted from DB: ${totalDeleted}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncWithSupabase();

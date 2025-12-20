const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const supabaseUrl = 'https://apyrnttbxpountnopuoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweXJudHRieHBvdW50bm9wdW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcwOTMyMiwiZXhwIjoyMDc3Mjg1MzIyfQ.PZCOKxrUxOdIzd-iFoHsVjKb3ZfaAYYEC8rVglq4q6Q';

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function rebuildFromSupabase() {
  console.log('🔄 Rebuilding database from Supabase files...\n');
  
  try {
    // Delete all existing image records
    console.log('🗑️  Deleting all existing image records...');
    const deleted = await prisma.villaImage.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} records\n`);
    
    // Get all villas
    const villas = await prisma.villa.findMany();
    console.log(`📊 Processing ${villas.length} villas...\n`);
    
    let totalCreated = 0;
    
    for (const villa of villas) {
      try {
        // List all files for this villa slug
        const { data: files, error } = await supabase.storage
          .from('villa-images')
          .list(villa.slug, {
            limit: 1000,
            offset: 0
          });
        
        if (error || !files || files.length === 0) {
          continue;
        }
        
        console.log(`🏠 ${villa.slug}: ${files.length} folders found`);
        
        // For each category folder
        for (const folder of files) {
          if (!folder.name) continue;
          
          const { data: categoryFiles, error: catError } = await supabase.storage
            .from('villa-images')
            .list(`${villa.slug}/${folder.name}`, {
              limit: 1000
            });
          
          if (catError || !categoryFiles) continue;
          
          // Create image records
          for (const file of categoryFiles) {
            if (!file.name) continue;
            
            const url = `${supabaseUrl}/storage/v1/object/public/villa-images/${villa.slug}/${folder.name}/${file.name}`;
            
            await prisma.villaImage.create({
              data: {
                villaId: villa.id,
                url: url,
                category: folder.name,
                order: totalCreated,
                isHero: folder.name === 'hero' && totalCreated === 0
              }
            });
            
            totalCreated++;
          }
        }
        
        process.stdout.write(`   Created: ${totalCreated} images\r`);
        
      } catch (error) {
        console.error(`\n❌ Error processing ${villa.slug}:`, error.message);
      }
    }
    
    console.log(`\n\n✅ Rebuild complete!`);
    console.log(`   Total images created: ${totalCreated}`);
    
    // Verify
    const finalCount = await prisma.villaImage.count();
    console.log(`   Database total: ${finalCount}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

rebuildFromSupabase();

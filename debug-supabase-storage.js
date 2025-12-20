const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://apyrnttbxpountnopuoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweXJudHRieHBvdW50bm9wdW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcwOTMyMiwiZXhwIjoyMDc3Mjg1MzIyfQ.PZCOKxrUxOdIzd-iFoHsVjKb3ZfaAYYEC8rVglq4q6Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
  console.log('🔍 Checking bucket configuration...\n');
  
  // List all files
  const { data: files, error: listError } = await supabase.storage
    .from('villa-images')
    .list('baan-tai-essence-beach-colibri-villa/hero', {
      limit: 3
    });
  
  if (listError) {
    console.log('❌ List Error:', listError.message);
  } else {
    console.log('✅ Files found:', files.length);
    if (files.length > 0) {
      console.log('   Sample file:', files[0].name);
    }
  }
  
  // Try to get public URL
  if (files && files.length > 0) {
    const { data: urlData } = supabase.storage
      .from('villa-images')
      .getPublicUrl(`baan-tai-essence-beach-colibri-villa/hero/${files[0].name}`);
    
    console.log('\n📍 Public URL:', urlData.publicUrl);
    
    // Test the URL
    const response = await fetch(urlData.publicUrl);
    console.log('📊 URL Status:', response.status);
    
    if (response.status !== 200) {
      const text = await response.text();
      console.log('❌ Error response:', text);
    } else {
      console.log('✅ Image loads successfully!');
    }
  }
  
  // Check bucket details
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.log('\n❌ Buckets Error:', bucketsError.message);
  } else {
    const villaBucket = buckets.find(b => b.name === 'villa-images');
    console.log('\n📦 Bucket Info:');
    console.log('   Public:', villaBucket?.public);
    console.log('   File Size Limit:', villaBucket?.file_size_limit);
    console.log('   Allowed MIME types:', villaBucket?.allowed_mime_types);
  }
}

checkBucket().catch(console.error);

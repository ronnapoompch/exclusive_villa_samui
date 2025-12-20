const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://apyrnttbxpountnopuoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweXJudHRieHBvdW50bm9wdW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcwOTMyMiwiZXhwIjoyMDc3Mjg1MzIyfQ.PZCOKxrUxOdIzd-iFoHsVjKb3ZfaAYYEC8rVglq4q6Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeBucketPublic() {
  console.log('🔄 Making bucket public...\n');
  
  // Update bucket to public
  const { data, error } = await supabase.storage.updateBucket('villa-images', {
    public: true
  });
  
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  console.log('✅ Bucket is now public!');
  
  // Verify
  const { data: buckets } = await supabase.storage.listBuckets();
  const villaBucket = buckets.find(b => b.name === 'villa-images');
  console.log('📦 Bucket public status:', villaBucket?.public);
  
  // Test URL again
  console.log('\n🔍 Testing image URL...');
  const { data: urlData } = supabase.storage
    .from('villa-images')
    .getPublicUrl('baan-tai-essence-beach-colibri-villa/hero/ED175698-HDR.webp');
  
  console.log('📍 URL:', urlData.publicUrl);
  
  const response = await fetch(urlData.publicUrl);
  console.log('📊 Status:', response.status);
  
  if (response.status === 200) {
    console.log('✅ Image loads successfully!');
  } else {
    const text = await response.text();
    console.log('❌ Error:', text);
  }
}

makeBucketPublic().catch(console.error);

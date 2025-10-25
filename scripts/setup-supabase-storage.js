const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'villa-images';

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase configuration in .env file');
  console.error('Required variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Bucket configuration
const BUCKET_CONFIG = {
  public: true,
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  fileSizeLimit: 50 * 1024 * 1024, // 50MB max
  transformations: {
    resize: 'allowed',
    quality: 'allowed'
  }
};

// Setup functions
async function checkSupabaseConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('villa_bookings')  // Use existing table for connection test
      .select('count', { count: 'exact', head: true });
      
    if (error && !error.message.includes('relation "villa_bookings" does not exist')) {
      throw error;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

async function createStorageBucket() {
  console.log(`📦 Creating storage bucket: ${BUCKET_NAME}...`);
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }
    
    const existingBucket = buckets.find(bucket => bucket.name === BUCKET_NAME);
    
    if (existingBucket) {
      console.log('✅ Storage bucket already exists');
      return true;
    }
    
    // Create new bucket
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: BUCKET_CONFIG.public,
      allowedMimeTypes: BUCKET_CONFIG.allowedMimeTypes,
      fileSizeLimit: BUCKET_CONFIG.fileSizeLimit
    });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Storage bucket created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create storage bucket:', error.message);
    return false;
  }
}

async function setupBucketPolicies() {
  console.log('🛡️  Setting up storage policies...');
  
  // Note: Policies are typically set via Supabase Dashboard or SQL
  // For programmatic setup, we'll create a SQL script
  const policySQL = `
-- Villa Images Bucket Policies
-- Run this in Supabase SQL Editor

-- Enable RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to villa images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = '${BUCKET_NAME}');

-- Policy for authenticated uploads (admin only)
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = '${BUCKET_NAME}' 
  AND auth.role() = 'service_role'
);

-- Policy for admin updates and deletes
CREATE POLICY "Admin Manage" ON storage.objects FOR UPDATE USING (
  bucket_id = '${BUCKET_NAME}' 
  AND auth.role() = 'service_role'
);

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (
  bucket_id = '${BUCKET_NAME}' 
  AND auth.role() = 'service_role'
);
`;

  const sqlFilePath = path.join(__dirname, 'supabase-storage-policies.sql');
  fs.writeFileSync(sqlFilePath, policySQL);
  
  console.log('✅ Storage policies SQL generated');
  console.log(`📁 File: ${sqlFilePath}`);
  console.log('🔧 Please run this SQL in your Supabase dashboard');
  
  return true;
}

async function testBucketAccess() {
  console.log('🧪 Testing bucket access...');
  
  try {
    // Test file upload
    const testContent = 'test-file-for-access-verification';
    const testFileName = `test/access-test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    console.log('✅ Upload test successful');
    
    // Test file download
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(testFileName);
    
    if (downloadError) {
      throw downloadError;
    }
    
    console.log('✅ Download test successful');
    
    // Test public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(testFileName);
    
    console.log('✅ Public URL generated:', publicUrlData.publicUrl);
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([testFileName]);
    
    if (deleteError) {
      console.warn('⚠️  Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Bucket access test failed:', error.message);
    return false;
  }
}

async function createDirectoryStructure() {
  console.log('📁 Creating directory structure preview...');
  
  // Get villa list from existing data
  const villasDataPath = path.join(__dirname, '..', 'src', 'data', 'villas-json', 'villas.json');
  let villas = [];
  
  if (fs.existsSync(villasDataPath)) {
    try {
      const villasData = JSON.parse(fs.readFileSync(villasDataPath, 'utf8'));
      villas = villasData.villas || [];
    } catch (error) {
      console.warn('⚠️  Could not load villa data for directory preview');
    }
  }
  
  const directoryStructure = {
    bucket: BUCKET_NAME,
    structure: {
      'villa-{id}': {
        webp: ['optimized WebP images'],
        jpg: ['original/fallback JPG images'],  
        thumbnails: ['small preview images']
      }
    },
    examples: villas.slice(0, 3).map(villa => ({
      villaId: villa.id,
      paths: [
        `${villa.id}/webp/main-image.webp`,
        `${villa.id}/jpg/main-image.jpg`,
        `${villa.id}/thumbnails/main-image-thumb.jpg`
      ]
    })),
    totalVillas: villas.length
  };
  
  const structurePath = path.join(__dirname, 'supabase-directory-structure.json');
  fs.writeFileSync(structurePath, JSON.stringify(directoryStructure, null, 2));
  
  console.log('✅ Directory structure documented');
  console.log(`📁 File: ${structurePath}`);
  
  return directoryStructure;
}

// Main setup function
async function setupSupabaseStorage() {
  console.log('🚀 SETTING UP SUPABASE STORAGE FOR VILLA IMAGES');
  console.log('='.repeat(60));
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
  console.log(`📦 Bucket Name: ${BUCKET_NAME}`);
  console.log('='.repeat(60));

  const results = {
    connection: false,
    bucket: false,
    policies: false,
    access: false,
    structure: false
  };

  try {
    // Step 1: Test connection
    results.connection = await checkSupabaseConnection();
    if (!results.connection) {
      throw new Error('Supabase connection failed');
    }

    // Step 2: Create bucket
    results.bucket = await createStorageBucket();
    if (!results.bucket) {
      throw new Error('Bucket creation failed');
    }

    // Step 3: Setup policies
    results.policies = await setupBucketPolicies();

    // Step 4: Test access
    results.access = await testBucketAccess();
    if (!results.access) {
      throw new Error('Bucket access test failed');
    }

    // Step 5: Document structure
    const structure = await createDirectoryStructure();
    results.structure = true;

    // Success summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUPABASE STORAGE SETUP COMPLETED');
    console.log('='.repeat(60));
    console.log(`📦 Bucket: ${BUCKET_NAME}`);
    console.log(`🔗 URL Pattern: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`);
    console.log(`📁 Directory Structure: villa-{id}/{webp|jpg|thumbnails}/`);
    console.log(`🏠 Ready for ${structure.totalVillas} villas`);
    
    console.log('\n🛡️  SECURITY FEATURES:');
    console.log('   ✅ Public read access enabled');
    console.log('   ✅ Admin-only upload permissions');
    console.log('   ✅ Service role authentication');
    console.log('   ✅ MIME type restrictions');
    console.log('   ✅ File size limits (50MB)');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Run SQL policies in Supabase dashboard');
    console.log('   2. Run: npm run migrate-images --dry-run');
    console.log('   3. Run: npm run migrate-images');
    
    return {
      success: true,
      bucketName: BUCKET_NAME,
      supabaseUrl: SUPABASE_URL,
      results,
      structure
    };

  } catch (error) {
    console.error('\n💥 SETUP FAILED:', error.message);
    console.log('\n📋 Completed Steps:');
    Object.entries(results).forEach(([step, success]) => {
      console.log(`   ${success ? '✅' : '❌'} ${step}`);
    });
    
    return {
      success: false,
      error: error.message,
      results
    };
  }
}

// Export for use in other scripts
module.exports = {
  setupSupabaseStorage,
  supabase,
  BUCKET_NAME,
  BUCKET_CONFIG
};

// Run if called directly
if (require.main === module) {
  setupSupabaseStorage()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 SETUP ERROR:', error);
      process.exit(1);
    });
}
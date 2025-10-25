const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { createBackup, BACKUP_FOLDER } = require('./create-backup');
const { supabase, BUCKET_NAME } = require('./setup-supabase-storage');

// Load environment variables
require('dotenv').config();

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const BATCH_SIZE = process.env.MIGRATION_BATCH_SIZE ? parseInt(process.env.MIGRATION_BATCH_SIZE) : 10;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const PROJECT_ROOT = path.join(__dirname, '..');
const OPTIMIZED_IMAGES_PATH = path.join(PROJECT_ROOT, 'public', 'optimized-data-images');
const VILLAS_JSON_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'folder-based-villas.json');

// Migration state
let migrationState = {
  startTime: Date.now(),
  totalVillas: 0,
  processedVillas: 0,
  totalFiles: 0,
  uploadedFiles: 0,
  totalSize: 0,
  uploadedSize: 0,
  errors: [],
  skipped: [],
  batches: [],
  currentBatch: 0,
  rollbackData: []
};

// Utility functions
function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryOperation(operation, description, maxRetries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`${description} failed after ${maxRetries} attempts: ${error.message}`);
      }
      console.log(`⚠️  ${description} failed (attempt ${attempt}/${maxRetries}), retrying...`);
      await sleep(RETRY_DELAY * attempt); // Exponential backoff
    }
  }
}

// Load villa data
function loadVillaData() {
  try {
    if (!fs.existsSync(VILLAS_JSON_PATH)) {
      throw new Error(`Villa data not found: ${VILLAS_JSON_PATH}`);
    }
    
    const data = JSON.parse(fs.readFileSync(VILLAS_JSON_PATH, 'utf8'));
    return Object.values(data); // folder-based-villas.json has villas as object values
  } catch (error) {
    throw new Error(`Failed to load villa data: ${error.message}`);
  }
}

// Analyze images for migration
function analyzeVillaImages(villaId) {
  const villaPath = path.join(OPTIMIZED_IMAGES_PATH, villaId);
  const analysis = {
    villaId,
    exists: fs.existsSync(villaPath),
    webp: [],
    jpg: [],
    thumbnails: [],
    totalFiles: 0,
    totalSize: 0
  };
  
  if (!analysis.exists) {
    return analysis;
  }
  
  const folders = ['webp', 'jpg', 'thumbnails'];
  
  for (const folder of folders) {
    const folderPath = path.join(villaPath, folder);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          const fileInfo = {
            name: file,
            localPath: filePath,
            size: stat.size,
            supabasePath: `${villaId}/${folder}/${file}`
          };
          
          analysis[folder].push(fileInfo);
          analysis.totalFiles++;
          analysis.totalSize += stat.size;
        }
      }
    }
  }
  
  return analysis;
}

// Upload file to Supabase
async function uploadFileToSupabase(localPath, supabasePath, mimeType) {
  const fileBuffer = fs.readFileSync(localPath);
  
  return await retryOperation(async () => {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(supabasePath, fileBuffer, {
        contentType: mimeType,
        upsert: false // Don't overwrite existing files
      });
      
    if (error) {
      throw error;
    }
    
    return data;
  }, `Upload ${supabasePath}`);
}

// Get MIME type from file extension
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', 
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Migrate single villa
async function migrateVilla(villaAnalysis) {
  const { villaId } = villaAnalysis;
  console.log(`\n📁 Processing villa: ${villaId}`);
  
  if (!villaAnalysis.exists || villaAnalysis.totalFiles === 0) {
    console.log(`⚠️  No images found for villa ${villaId}`);
    migrationState.skipped.push({ villaId, reason: 'No images found' });
    return { success: true, skipped: true };
  }
  
  const villaResult = {
    villaId,
    uploadedFiles: 0,
    uploadedSize: 0,
    errors: [],
    uploadedPaths: []
  };
  
  console.log(`   📊 Files: ${villaAnalysis.totalFiles}, Size: ${formatSize(villaAnalysis.totalSize)}`);
  
  if (DRY_RUN) {
    console.log(`   🔍 DRY RUN: Would upload ${villaAnalysis.totalFiles} files`);
    migrationState.uploadedFiles += villaAnalysis.totalFiles;
    migrationState.uploadedSize += villaAnalysis.totalSize;
    return { success: true, dryRun: true };
  }
  
  // Upload files by folder
  const folders = ['webp', 'jpg', 'thumbnails'];
  
  for (const folder of folders) {
    if (villaAnalysis[folder].length === 0) continue;
    
    console.log(`   📂 Uploading ${folder}: ${villaAnalysis[folder].length} files`);
    
    for (const file of villaAnalysis[folder]) {
      try {
        const mimeType = getMimeType(file.name);
        
        console.log(`      📤 ${file.name} (${formatSize(file.size)})`);
        
        const uploadData = await uploadFileToSupabase(
          file.localPath,
          file.supabasePath,
          mimeType
        );
        
        villaResult.uploadedFiles++;
        villaResult.uploadedSize += file.size;
        villaResult.uploadedPaths.push(file.supabasePath);
        
        migrationState.uploadedFiles++;
        migrationState.uploadedSize += file.size;
        
        // Store rollback data
        migrationState.rollbackData.push({
          supabasePath: file.supabasePath,
          localPath: file.localPath,
          villaId
        });
        
      } catch (error) {
        console.error(`      ❌ Failed to upload ${file.name}: ${error.message}`);
        villaResult.errors.push(`${file.name}: ${error.message}`);
        migrationState.errors.push(`${villaId}/${file.name}: ${error.message}`);
      }
    }
  }
  
  console.log(`   ✅ Completed: ${villaResult.uploadedFiles}/${villaAnalysis.totalFiles} files uploaded`);
  
  return {
    success: villaResult.errors.length === 0,
    ...villaResult
  };
}

// Process migration in batches
async function processBatches(villas) {
  const batches = [];
  
  // Create batches
  for (let i = 0; i < villas.length; i += BATCH_SIZE) {
    batches.push(villas.slice(i, i + BATCH_SIZE));
  }
  
  migrationState.batches = batches.map((batch, index) => ({
    batchNumber: index + 1,
    villas: batch.length,
    startTime: null,
    endTime: null,
    success: false
  }));
  
  console.log(`\n📦 Processing ${batches.length} batches of ${BATCH_SIZE} villas each`);
  
  // Process each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    migrationState.currentBatch = batchIndex + 1;
    migrationState.batches[batchIndex].startTime = Date.now();
    
    console.log(`\n🔄 BATCH ${batchIndex + 1}/${batches.length}`);
    console.log(`   Villas: ${batch.map(v => v.folderName || v.id).join(', ')}`);
    
    // Process villas in current batch
    for (const villa of batch) {
      const villaId = villa.folderName || villa.id;
      const analysis = analyzeVillaImages(villaId);
      migrationState.totalFiles += analysis.totalFiles;
      migrationState.totalSize += analysis.totalSize;
      
      try {
        await migrateVilla(analysis);
        migrationState.processedVillas++;
      } catch (error) {
        console.error(`💥 Villa migration failed: ${villaId}`, error.message);
        migrationState.errors.push(`Villa ${villaId}: ${error.message}`);
      }
      
      // Progress update
      const progress = (migrationState.processedVillas / migrationState.totalVillas * 100).toFixed(1);
      process.stdout.write(`\r📊 Progress: ${migrationState.processedVillas}/${migrationState.totalVillas} (${progress}%)`);
    }
    
    migrationState.batches[batchIndex].endTime = Date.now();
    migrationState.batches[batchIndex].success = true;
    
    console.log(`\n✅ Batch ${batchIndex + 1} completed`);
    
    // Brief pause between batches
    if (batchIndex < batches.length - 1 && !DRY_RUN) {
      console.log('⏸️  Pausing 2 seconds between batches...');
      await sleep(2000);
    }
  }
}

// Create migration report
function createMigrationReport() {
  const duration = (Date.now() - migrationState.startTime) / 1000;
  const successRate = migrationState.totalFiles > 0 ? 
    (migrationState.uploadedFiles / migrationState.totalFiles * 100).toFixed(1) : 0;
  
  const report = {
    timestamp: new Date().toISOString(),
    mode: DRY_RUN ? 'DRY_RUN' : 'LIVE_MIGRATION',
    duration: `${duration.toFixed(1)}s`,
    summary: {
      totalVillas: migrationState.totalVillas,
      processedVillas: migrationState.processedVillas,
      skippedVillas: migrationState.skipped.length,
      totalFiles: migrationState.totalFiles,
      uploadedFiles: migrationState.uploadedFiles,
      successRate: `${successRate}%`,
      totalSize: formatSize(migrationState.totalSize),
      uploadedSize: formatSize(migrationState.uploadedSize)
    },
    batches: migrationState.batches.map(batch => ({
      ...batch,
      duration: batch.endTime ? `${((batch.endTime - batch.startTime) / 1000).toFixed(1)}s` : null
    })),
    errors: migrationState.errors.slice(0, 20), // First 20 errors
    skipped: migrationState.skipped,
    rollbackInstructions: DRY_RUN ? null : [
      "1. Run: npm run rollback-migration",
      "2. Or manually delete uploaded files from Supabase",
      `3. Restore from backup: ${BACKUP_FOLDER}`,
      `4. Uploaded files: ${migrationState.rollbackData.length}`
    ]
  };
  
  const reportPath = path.join(__dirname, `migration-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return { report, reportPath };
}

// Main migration function
async function migrateImages() {
  console.log('🚀 VILLA IMAGES MIGRATION TO SUPABASE');
  console.log('='.repeat(60));
  console.log(`🔧 Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE MIGRATION'}`);
  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(`📁 Source: ${OPTIMIZED_IMAGES_PATH}`);
  console.log(`🔄 Batch Size: ${BATCH_SIZE}`);
  console.log('='.repeat(60));
  
  try {
    // Step 1: Create safety backup (if not dry run)
    if (!DRY_RUN && !FORCE) {
      console.log('\n🛡️  Creating safety backup...');
      const backupResult = await createBackup();
      if (!backupResult.success) {
        throw new Error('Backup creation failed');
      }
      console.log('✅ Backup completed');
    }
    
    // Step 2: Load villa data
    console.log('\n📋 Loading villa data...');
    const villas = loadVillaData();
    migrationState.totalVillas = villas.length;
    console.log(`✅ Loaded ${villas.length} villas`);
    
    // Step 3: Validate source directory
    if (!fs.existsSync(OPTIMIZED_IMAGES_PATH)) {
      throw new Error(`Optimized images directory not found: ${OPTIMIZED_IMAGES_PATH}`);
    }
    
    // Step 4: Process migration
    console.log('\n🔄 Starting migration process...');
    await processBatches(villas);
    
    // Step 5: Generate report
    const { report, reportPath } = createMigrationReport();
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log(`${DRY_RUN ? '🔍 DRY RUN COMPLETED' : '✅ MIGRATION COMPLETED'}`);
    console.log('='.repeat(60));
    console.log(`🏠 Villas: ${report.summary.processedVillas}/${report.summary.totalVillas}`);
    console.log(`📁 Files: ${report.summary.uploadedFiles}/${report.summary.totalFiles}`);
    console.log(`📦 Size: ${report.summary.uploadedSize}/${report.summary.totalSize}`);
    console.log(`✅ Success Rate: ${report.summary.successRate}`);
    console.log(`⏱️  Duration: ${report.duration}`);
    console.log(`📋 Report: ${reportPath}`);
    
    if (migrationState.errors.length > 0) {
      console.log(`⚠️  Errors: ${migrationState.errors.length}`);
      console.log('📋 First 5 errors:');
      migrationState.errors.slice(0, 5).forEach(error => {
        console.log(`   • ${error}`);
      });
    }
    
    if (migrationState.skipped.length > 0) {
      console.log(`⏭️  Skipped: ${migrationState.skipped.length} villas`);
    }
    
    if (!DRY_RUN) {
      console.log('\n🎯 NEXT STEPS:');
      console.log('   1. Update code to use Supabase URLs');
      console.log('   2. Run: npm run update-villa-images');
      console.log('   3. Test image loading');
      console.log('   4. Run: npm run cleanup-local-images');
    } else {
      console.log('\n🎯 NEXT STEPS:');
      console.log('   1. Review dry run results');
      console.log('   2. Run: npm run migrate-images (without --dry-run)');
    }
    
    return {
      success: true,
      report,
      migrationState
    };
    
  } catch (error) {
    console.error('\n💥 MIGRATION FAILED:', error.message);
    
    const { report, reportPath } = createMigrationReport();
    console.log(`📋 Error Report: ${reportPath}`);
    
    return {
      success: false,
      error: error.message,
      report,
      migrationState
    };
  }
}

// Export for use in other scripts
module.exports = {
  migrateImages,
  migrationState,
  DRY_RUN
};

// Run if called directly
if (require.main === module) {
  migrateImages()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 MIGRATION ERROR:', error);
      process.exit(1);
    });
}
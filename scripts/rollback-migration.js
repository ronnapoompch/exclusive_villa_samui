const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'villa-images';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const PROJECT_ROOT = path.join(__dirname, '..');
const BACKUP_ROOT = path.join(PROJECT_ROOT, 'backup');

// Rollback state
let rollbackState = {
  startTime: Date.now(),
  totalFiles: 0,
  deletedFiles: 0,
  restoredFiles: 0,
  errors: [],
  backupUsed: null
};

// Utility functions
function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Find latest backup
function findLatestBackup() {
  if (!fs.existsSync(BACKUP_ROOT)) {
    throw new Error(`Backup directory not found: ${BACKUP_ROOT}`);
  }
  
  const backupFolders = fs.readdirSync(BACKUP_ROOT)
    .filter(folder => folder.startsWith('data-original-'))
    .sort()
    .reverse(); // Latest first
  
  if (backupFolders.length === 0) {
    throw new Error('No backup folders found');
  }
  
  const latestBackup = path.join(BACKUP_ROOT, backupFolders[0]);
  const manifestPath = path.join(latestBackup, 'backup-manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Backup manifest not found: ${manifestPath}`);
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  return {
    path: latestBackup,
    manifest,
    folder: backupFolders[0]
  };
}

// List all files in Supabase bucket
async function listSupabaseFiles() {
  console.log('📋 Listing files in Supabase bucket...');
  
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 10000,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      throw error;
    }
    
    // Recursively get all files
    const allFiles = [];
    
    async function getFilesRecursive(prefix = '') {
      const { data: items, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(prefix, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        throw error;
      }
      
      for (const item of items) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
        
        if (item.metadata && item.metadata.size !== undefined) {
          // It's a file
          allFiles.push({
            name: item.name,
            path: fullPath,
            size: item.metadata.size,
            created_at: item.created_at,
            updated_at: item.updated_at
          });
        } else {
          // It's a folder, recurse
          await getFilesRecursive(fullPath);
        }
      }
    }
    
    await getFilesRecursive();
    
    console.log(`✅ Found ${allFiles.length} files in bucket`);
    return allFiles;
    
  } catch (error) {
    throw new Error(`Failed to list Supabase files: ${error.message}`);
  }
}

// Delete files from Supabase
async function deleteSupabaseFiles(files) {
  console.log(`🗑️  Deleting ${files.length} files from Supabase...`);
  
  const BATCH_SIZE = 100; // Supabase limit
  const batches = [];
  
  // Create batches
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    batches.push(files.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`📦 Processing ${batches.length} batches of up to ${BATCH_SIZE} files each`);
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const filePaths = batch.map(file => file.path);
    
    try {
      console.log(`🔄 Batch ${batchIndex + 1}/${batches.length}: ${batch.length} files`);
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);
      
      if (error) {
        throw error;
      }
      
      rollbackState.deletedFiles += batch.length;
      console.log(`✅ Deleted batch ${batchIndex + 1}`);
      
    } catch (error) {
      console.error(`❌ Failed to delete batch ${batchIndex + 1}:`, error.message);
      rollbackState.errors.push(`Batch ${batchIndex + 1}: ${error.message}`);
    }
    
    // Brief pause between batches
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Restore files from backup
async function restoreFromBackup(backup) {
  console.log('📁 Restoring files from backup...');
  
  const optimizedImagesPath = path.join(PROJECT_ROOT, 'public', 'optimized-data-images');
  const backupOptimizedPath = path.join(backup.path, 'optimized-images');
  
  // Remove current optimized images
  if (fs.existsSync(optimizedImagesPath)) {
    console.log('🗑️  Removing current optimized images...');
    fs.rmSync(optimizedImagesPath, { recursive: true, force: true });
  }
  
  // Restore from backup
  if (fs.existsSync(backupOptimizedPath)) {
    console.log('📋 Restoring optimized images from backup...');
    copyDirectory(backupOptimizedPath, optimizedImagesPath);
    console.log('✅ Optimized images restored');
  }
  
  // Restore original villa images if needed
  const originalVillaImagesPath = path.join(PROJECT_ROOT, 'src', 'data', 'Villla Images');
  const backupOriginalPath = path.join(backup.path, 'src-data-villa-images');
  
  if (fs.existsSync(backupOriginalPath)) {
    console.log('📋 Original villa images backup available');
    console.log(`   Source: ${backupOriginalPath}`);
    console.log(`   Target: ${originalVillaImagesPath}`);
    console.log('   (Manual restore if needed)');
  }
}

function copyDirectory(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      try {
        fs.copyFileSync(sourcePath, targetPath);
        rollbackState.restoredFiles++;
        
        if (rollbackState.restoredFiles % 100 === 0) {
          process.stdout.write(`\r📁 Files restored: ${rollbackState.restoredFiles}`);
        }
      } catch (error) {
        console.error(`❌ Error restoring ${sourcePath}:`, error.message);
        rollbackState.errors.push(`Restore ${sourcePath}: ${error.message}`);
      }
    }
  }
}

// Create rollback report
function createRollbackReport(backup) {
  const duration = (Date.now() - rollbackState.startTime) / 1000;
  
  const report = {
    timestamp: new Date().toISOString(),
    operation: 'ROLLBACK_MIGRATION',
    duration: `${duration.toFixed(1)}s`,
    backup: {
      folder: backup.folder,
      path: backup.path,
      manifest: backup.manifest
    },
    summary: {
      totalFiles: rollbackState.totalFiles,
      deletedFiles: rollbackState.deletedFiles,
      restoredFiles: rollbackState.restoredFiles,
      errors: rollbackState.errors.length
    },
    errors: rollbackState.errors,
    nextSteps: [
      "1. Verify image loading in application",
      "2. Check that villa images are working",
      "3. Run image optimization if needed",
      "4. Update any configuration files"
    ]
  };
  
  const reportPath = path.join(__dirname, `rollback-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return { report, reportPath };
}

// Main rollback function
async function rollbackMigration() {
  console.log('🔄 ROLLING BACK VILLA IMAGES MIGRATION');
  console.log('='.repeat(60));
  console.log('⚠️  This will:');
  console.log('   1. Delete ALL files from Supabase storage');
  console.log('   2. Restore files from latest backup');
  console.log('   3. Reset to pre-migration state');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Find latest backup
    console.log('\n📂 Finding latest backup...');
    const backup = findLatestBackup();
    rollbackState.backupUsed = backup.folder;
    
    console.log(`✅ Found backup: ${backup.folder}`);
    console.log(`📅 Created: ${backup.manifest.timestamp}`);
    console.log(`📊 Files: ${backup.manifest.statistics.totalFiles.toLocaleString()}`);
    console.log(`📦 Size: ${backup.manifest.statistics.totalSizeFormatted}`);
    
    // Step 2: List Supabase files
    console.log('\n📋 Analyzing Supabase storage...');
    const supabaseFiles = await listSupabaseFiles();
    rollbackState.totalFiles = supabaseFiles.length;
    
    if (supabaseFiles.length === 0) {
      console.log('✅ No files in Supabase storage to delete');
    } else {
      // Step 3: Delete Supabase files
      console.log('\n🗑️  Deleting files from Supabase...');
      await deleteSupabaseFiles(supabaseFiles);
    }
    
    // Step 4: Restore from backup
    console.log('\n📁 Restoring from backup...');
    await restoreFromBackup(backup);
    
    // Step 5: Generate report
    const { report, reportPath } = createRollbackReport(backup);
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ROLLBACK COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`🗑️  Deleted from Supabase: ${rollbackState.deletedFiles}/${rollbackState.totalFiles}`);
    console.log(`📁 Restored from backup: ${rollbackState.restoredFiles.toLocaleString()}`);
    console.log(`📂 Backup used: ${backup.folder}`);
    console.log(`⏱️  Duration: ${((Date.now() - rollbackState.startTime) / 1000).toFixed(1)}s`);
    console.log(`📋 Report: ${reportPath}`);
    
    if (rollbackState.errors.length > 0) {
      console.log(`⚠️  Errors: ${rollbackState.errors.length}`);
      console.log('📋 First 5 errors:');
      rollbackState.errors.slice(0, 5).forEach(error => {
        console.log(`   • ${error}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Test application image loading');
    console.log('   2. Verify villa images work correctly');
    console.log('   3. Re-run image optimization if needed');
    console.log('   4. Check configuration files');
    
    return {
      success: true,
      report,
      rollbackState
    };
    
  } catch (error) {
    console.error('\n💥 ROLLBACK FAILED:', error.message);
    
    const { report, reportPath } = createRollbackReport({
      folder: rollbackState.backupUsed || 'unknown',
      path: '',
      manifest: {}
    });
    
    console.log(`📋 Error Report: ${reportPath}`);
    
    return {
      success: false,
      error: error.message,
      report,
      rollbackState
    };
  }
}

// Export for use in other scripts
module.exports = {
  rollbackMigration,
  rollbackState
};

// Run if called directly
if (require.main === module) {
  rollbackMigration()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 ROLLBACK ERROR:', error);
      process.exit(1);
    });
}
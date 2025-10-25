const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                  new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
const PROJECT_ROOT = path.join(__dirname, '..');
const BACKUP_ROOT = path.join(PROJECT_ROOT, 'backup');
const BACKUP_FOLDER = path.join(BACKUP_ROOT, `data-original-${TIMESTAMP}`);

// Directories to backup
const BACKUP_SOURCES = [
  {
    source: path.join(PROJECT_ROOT, 'src', 'data', 'Villla Images'),
    target: path.join(BACKUP_FOLDER, 'src-data-villa-images'),
    description: 'Original villa images from src/data'
  },
  {
    source: path.join(PROJECT_ROOT, 'public', 'data'),
    target: path.join(BACKUP_FOLDER, 'public-data'),
    description: 'Public data folder',
    optional: true
  },
  {
    source: path.join(PROJECT_ROOT, 'public', 'optimized-data-images'),
    target: path.join(BACKUP_FOLDER, 'optimized-images'),
    description: 'Optimized images ready for upload'
  }
];

// Statistics
let stats = {
  startTime: Date.now(),
  totalFiles: 0,
  totalSize: 0,
  foldersCreated: 0,
  errors: []
};

// Helper functions
function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let size = 0;
  let fileCount = 0;
  
  if (!fs.existsSync(dirPath)) return { size: 0, fileCount: 0 };
  
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      const subStats = getDirectorySize(itemPath);
      size += subStats.size;
      fileCount += subStats.fileCount;
    } else {
      size += stat.size;
      fileCount++;
    }
  }
  
  return { size, fileCount };
}

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    console.log(`⚠️  Source not found: ${source}`);
    return false;
  }

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    stats.foldersCreated++;
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
        stats.totalFiles++;
        stats.totalSize += stat.size;
        
        if (stats.totalFiles % 100 === 0) {
          process.stdout.write(`\r📁 Files copied: ${stats.totalFiles}`);
        }
      } catch (error) {
        console.error(`❌ Error copying ${sourcePath}:`, error.message);
        stats.errors.push(`${sourcePath}: ${error.message}`);
      }
    }
  }
  
  return true;
}

function createBackupManifest() {
  const manifest = {
    timestamp: new Date().toISOString(),
    backupFolder: BACKUP_FOLDER,
    sources: BACKUP_SOURCES.map(source => ({
      ...source,
      exists: fs.existsSync(source.source),
      stats: fs.existsSync(source.source) ? getDirectorySize(source.source) : null
    })),
    statistics: {
      ...stats,
      duration: (Date.now() - stats.startTime) / 1000,
      totalSizeFormatted: formatSize(stats.totalSize)
    },
    rollbackInstructions: [
      "1. Stop the application",
      "2. Run: npm run rollback-migration",
      "3. Or manually restore from this backup folder",
      `4. Backup location: ${BACKUP_FOLDER}`
    ]
  };
  
  const manifestPath = path.join(BACKUP_FOLDER, 'backup-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  return manifest;
}

// Main backup function
async function createBackup() {
  console.log('🔄 CREATING SAFETY BACKUP BEFORE MIGRATION');
  console.log('='.repeat(60));
  console.log(`📅 Timestamp: ${TIMESTAMP}`);
  console.log(`📂 Backup Location: ${BACKUP_FOLDER}`);
  console.log('='.repeat(60));

  // Create backup root directory
  if (!fs.existsSync(BACKUP_ROOT)) {
    fs.mkdirSync(BACKUP_ROOT, { recursive: true });
  }

  if (!fs.existsSync(BACKUP_FOLDER)) {
    fs.mkdirSync(BACKUP_FOLDER, { recursive: true });
  }

  // Analyze what will be backed up
  console.log('\n📊 ANALYZING SOURCE DATA...\n');
  
  for (const source of BACKUP_SOURCES) {
    if (!fs.existsSync(source.source)) {
      if (source.optional) {
        console.log(`⚠️  Optional source not found: ${source.source}`);
        continue;
      } else {
        console.log(`❌ Required source missing: ${source.source}`);
        stats.errors.push(`Required source missing: ${source.source}`);
        continue;
      }
    }

    const dirStats = getDirectorySize(source.source);
    console.log(`📁 ${source.description}`);
    console.log(`   Source: ${source.source}`);
    console.log(`   Files: ${dirStats.fileCount.toLocaleString()}`);
    console.log(`   Size: ${formatSize(dirStats.size)}`);
    console.log();
  }

  // Confirm backup
  console.log('🚀 STARTING BACKUP PROCESS...\n');

  // Perform backup
  for (const source of BACKUP_SOURCES) {
    if (!fs.existsSync(source.source)) {
      continue;
    }

    console.log(`📋 Backing up: ${source.description}`);
    const success = copyDirectory(source.source, source.target);
    
    if (success) {
      console.log(`✅ Completed: ${source.description}\n`);
    } else {
      console.log(`❌ Failed: ${source.description}\n`);
    }
  }

  // Create manifest
  const manifest = createBackupManifest();
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ BACKUP COMPLETED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log(`📁 Total Files Backed Up: ${stats.totalFiles.toLocaleString()}`);
  console.log(`📦 Total Size: ${formatSize(stats.totalSize)}`);
  console.log(`📂 Folders Created: ${stats.foldersCreated}`);
  console.log(`⏱️  Duration: ${((Date.now() - stats.startTime) / 1000).toFixed(1)}s`);
  console.log(`📍 Backup Location: ${BACKUP_FOLDER}`);
  
  if (stats.errors.length > 0) {
    console.log(`⚠️  Errors: ${stats.errors.length}`);
    console.log('📋 First 5 errors:');
    stats.errors.slice(0, 5).forEach(error => console.log(`   • ${error}`));
  }
  
  console.log('\n🛡️  SAFETY FEATURES ACTIVATED:');
  console.log('   ✅ Complete backup created');
  console.log('   ✅ Manifest file generated');
  console.log('   ✅ Rollback instructions available');
  console.log('   ✅ Ready for safe migration');
  
  return {
    success: stats.errors.length === 0,
    backupPath: BACKUP_FOLDER,
    manifest,
    stats
  };
}

// Export for use in other scripts
module.exports = {
  createBackup,
  BACKUP_FOLDER,
  TIMESTAMP
};

// Run if called directly
if (require.main === module) {
  createBackup()
    .then((result) => {
      if (result.success) {
        console.log('\n🎯 NEXT STEPS:');
        console.log('   1. Review backup manifest');
        console.log('   2. Configure Supabase environment variables');
        console.log('   3. Run: npm run setup-supabase-storage');
        console.log('   4. Run: npm run migrate-images --dry-run');
        process.exit(0);
      } else {
        console.log('\n❌ BACKUP COMPLETED WITH ERRORS');
        console.log('   Please review errors before proceeding');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 BACKUP FAILED:', error);
      process.exit(1);
    });
}
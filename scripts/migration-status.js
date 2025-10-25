const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title) {
  const border = '='.repeat(60);
  console.log(colorize(border, 'cyan'));
  console.log(colorize(title.toUpperCase(), 'bright'));
  console.log(colorize(border, 'cyan'));
}

function printSection(title) {
  console.log('\n' + colorize(title, 'yellow'));
  console.log('-'.repeat(40));
}

// Check migration readiness
function checkMigrationReadiness() {
  const checks = {
    optimizedImages: {
      name: 'Optimized Images',
      path: path.join(PROJECT_ROOT, 'public', 'optimized-data-images'),
      required: true
    },
    villaData: {
      name: 'Villa Data JSON',
      path: path.join(PROJECT_ROOT, 'src', 'data', 'folder-based-villas.json'),
      required: true
    },
    envFile: {
      name: 'Environment Variables',
      path: path.join(PROJECT_ROOT, '.env'),
      required: true
    },
    backupScript: {
      name: 'Backup Script',
      path: path.join(__dirname, 'create-backup.js'),
      required: true
    },
    migrationScript: {
      name: 'Migration Script',
      path: path.join(__dirname, 'migrate-images.js'),
      required: true
    },
    rollbackScript: {
      name: 'Rollback Script',
      path: path.join(__dirname, 'rollback-migration.js'),
      required: true
    }
  };

  const results = {};
  
  for (const [key, check] of Object.entries(checks)) {
    results[key] = {
      ...check,
      exists: fs.existsSync(check.path),
      status: fs.existsSync(check.path) ? 'Ready' : 'Missing'
    };
  }

  return results;
}

// Check environment variables
function checkEnvironmentVariables() {
  const envPath = path.join(PROJECT_ROOT, '.env');
  const envExamplePath = path.join(PROJECT_ROOT, '.env.example');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const results = {
    envFileExists: fs.existsSync(envPath),
    envExampleExists: fs.existsSync(envExamplePath),
    variables: {}
  };

  if (results.envFileExists) {
    try {
      require('dotenv').config({ path: envPath });
      
      for (const varName of requiredVars) {
        const value = process.env[varName];
        results.variables[varName] = {
          exists: !!value,
          hasValue: !!(value && value.length > 0),
          masked: value ? `${value.substring(0, 8)}...` : null
        };
      }
    } catch (error) {
      results.error = error.message;
    }
  }

  return results;
}

// Analyze optimized images
function analyzeOptimizedImages() {
  const optimizedPath = path.join(PROJECT_ROOT, 'public', 'optimized-data-images');
  
  if (!fs.existsSync(optimizedPath)) {
    return { exists: false };
  }

  const analysis = {
    exists: true,
    villaFolders: 0,
    totalFiles: 0,
    totalSize: 0,
    byType: {
      webp: { count: 0, size: 0 },
      jpg: { count: 0, size: 0 },
      thumbnails: { count: 0, size: 0 }
    },
    sampleVillas: []
  };

  const villaFolders = fs.readdirSync(optimizedPath).filter(item => {
    const itemPath = path.join(optimizedPath, item);
    return fs.statSync(itemPath).isDirectory();
  });

  analysis.villaFolders = villaFolders.length;

  // Analyze first 5 villas as samples
  const sampleCount = Math.min(5, villaFolders.length);
  
  for (let i = 0; i < villaFolders.length; i++) {
    const villaId = villaFolders[i];
    const villaPath = path.join(optimizedPath, villaId);
    
    const villaAnalysis = {
      id: villaId,
      webp: 0,
      jpg: 0,
      thumbnails: 0,
      size: 0
    };

    // Recursively scan all directories for image files
    function scanDirectory(dirPath, level = 0) {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanDirectory(itemPath, level + 1);
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          const isThumb = item.includes('thumb');
          
          if (ext === '.webp') {
            if (isThumb) {
              villaAnalysis.thumbnails++;
              analysis.byType.thumbnails.count++;
              analysis.byType.thumbnails.size += stat.size;
            } else {
              villaAnalysis.webp++;
              analysis.byType.webp.count++;
              analysis.byType.webp.size += stat.size;
            }
          } else if (['.jpg', '.jpeg'].includes(ext)) {
            villaAnalysis.jpg++;
            analysis.byType.jpg.count++;
            analysis.byType.jpg.size += stat.size;
          }
          
          villaAnalysis.size += stat.size;
          analysis.totalFiles++;
          analysis.totalSize += stat.size;
        }
      }
    }
    
    scanDirectory(villaPath);

    if (i < sampleCount) {
      analysis.sampleVillas.push(villaAnalysis);
    }
  }

  return analysis;
}

// Check villa data
function checkVillaData() {
  const villaDataPath = path.join(PROJECT_ROOT, 'src', 'data', 'folder-based-villas.json');
  
  if (!fs.existsSync(villaDataPath)) {
    return { exists: false };
  }

  try {
    const data = JSON.parse(fs.readFileSync(villaDataPath, 'utf8'));
    const villas = Object.values(data); // folder-based-villas.json has villas as object values
    
    return {
      exists: true,
      totalVillas: villas.length,
      hasValidStructure: Array.isArray(villas) && villas.length > 0,
      sampleVillas: villas.slice(0, 3).map(villa => ({
        id: villa.id || 'unknown',
        name: villa.name || 'unnamed',
        folderName: villa.folderName || 'unknown',
        hasImages: !!(villa.images && villa.images.length > 0)
      }))
    };
  } catch (error) {
    return {
      exists: true,
      error: error.message
    };
  }
}

// Format file size
function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Main migration status function
function showMigrationStatus() {
  printHeader('🚀 VILLA IMAGES MIGRATION STATUS');
  
  // Check readiness
  printSection('📋 MIGRATION READINESS CHECK');
  const readiness = checkMigrationReadiness();
  
  for (const [key, check] of Object.entries(readiness)) {
    const status = check.exists ? 
      colorize('✅ Ready', 'green') : 
      colorize('❌ Missing', 'red');
    
    console.log(`   ${check.name}: ${status}`);
    if (!check.exists && check.required) {
      console.log(colorize(`      Required: ${check.path}`, 'red'));
    }
  }

  // Check environment variables
  printSection('🔧 ENVIRONMENT CONFIGURATION');
  const envCheck = checkEnvironmentVariables();
  
  if (!envCheck.envFileExists) {
    console.log(colorize('❌ .env file not found', 'red'));
    console.log('   Please copy .env.example to .env and configure');
  } else {
    console.log(colorize('✅ .env file exists', 'green'));
    
    for (const [varName, varInfo] of Object.entries(envCheck.variables)) {
      const status = varInfo.hasValue ? 
        colorize('✅ Configured', 'green') : 
        colorize('❌ Missing', 'red');
      
      console.log(`   ${varName}: ${status}`);
      if (varInfo.hasValue) {
        console.log(`      Value: ${varInfo.masked}`);
      }
    }
  }

  // Analyze optimized images
  printSection('📸 OPTIMIZED IMAGES ANALYSIS');
  const imageAnalysis = analyzeOptimizedImages();
  
  if (!imageAnalysis.exists) {
    console.log(colorize('❌ Optimized images not found', 'red'));
    console.log('   Please run: npm run optimize-images first');
  } else {
    console.log(colorize('✅ Optimized images ready', 'green'));
    console.log(`   📁 Villa Folders: ${imageAnalysis.villaFolders.toLocaleString()}`);
    console.log(`   📸 Total Files: ${imageAnalysis.totalFiles.toLocaleString()}`);
    console.log(`   📦 Total Size: ${formatSize(imageAnalysis.totalSize)}`);
    
    console.log('\n   📊 By Type:');
    for (const [type, stats] of Object.entries(imageAnalysis.byType)) {
      console.log(`      ${type}: ${stats.count.toLocaleString()} files (${formatSize(stats.size)})`);
    }
    
    if (imageAnalysis.sampleVillas.length > 0) {
      console.log('\n   🏠 Sample Villas:');
      for (const villa of imageAnalysis.sampleVillas) {
        console.log(`      ${villa.id}: WebP=${villa.webp}, JPG=${villa.jpg}, Thumbs=${villa.thumbnails} (${formatSize(villa.size)})`);
      }
    }
  }

  // Check villa data
  printSection('🏠 VILLA DATA STATUS');
  const villaData = checkVillaData();
  
  if (!villaData.exists) {
    console.log(colorize('❌ Villa data not found', 'red'));
  } else if (villaData.error) {
    console.log(colorize('❌ Villa data has errors', 'red'));
    console.log(`   Error: ${villaData.error}`);
  } else {
    console.log(colorize('✅ Villa data ready', 'green'));
    console.log(`   🏠 Total Villas: ${villaData.totalVillas.toLocaleString()}`);
    
    if (villaData.sampleVillas.length > 0) {
      console.log('\n   📋 Sample Villas:');
      for (const villa of villaData.sampleVillas) {
        const imageStatus = villa.hasImages ? 'Has Images' : 'No Images';
        console.log(`      ${villa.id}: ${villa.name} (${imageStatus})`);
      }
    }
  }

  // Overall readiness
  printSection('🎯 OVERALL MIGRATION READINESS');
  
  const allReady = Object.values(readiness).every(check => check.exists || !check.required);
  const envReady = envCheck.envFileExists && 
    Object.values(envCheck.variables).every(varInfo => varInfo.hasValue);
  const imagesReady = imageAnalysis.exists && imageAnalysis.totalFiles > 0;
  const dataReady = villaData.exists && !villaData.error && villaData.totalVillas > 0;
  
  const overallReady = allReady && envReady && imagesReady && dataReady;
  
  if (overallReady) {
    console.log(colorize('🎉 READY FOR MIGRATION!', 'green'));
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Review migration plan: cat MIGRATION_DOCS.md');
    console.log('   2. Create backup: npm run backup');
    console.log('   3. Setup Supabase: npm run setup-supabase');
    console.log('   4. Dry run: npm run migrate-images:dry-run');
    console.log('   5. Migrate: npm run migrate-images');
    
  } else {
    console.log(colorize('⚠️  NOT READY FOR MIGRATION', 'yellow'));
    
    console.log('\n📋 Issues to Fix:');
    if (!allReady) console.log('   ❌ Missing required files');
    if (!envReady) console.log('   ❌ Environment variables not configured');
    if (!imagesReady) console.log('   ❌ Optimized images not ready');
    if (!dataReady) console.log('   ❌ Villa data not ready');
    
    console.log('\n🔧 Fix Steps:');
    console.log('   1. Copy .env.example to .env');
    console.log('   2. Configure Supabase environment variables');
    console.log('   3. Run image optimization if needed');
    console.log('   4. Verify villa data integrity');
  }

  // Performance estimates
  if (overallReady && imageAnalysis.exists) {
    printSection('⚡ PERFORMANCE ESTIMATES');
    
    const estimatedUploadTime = (imageAnalysis.totalFiles / 10) * 2; // ~10 files per 2 seconds
    const estimatedSizePerFile = imageAnalysis.totalSize / imageAnalysis.totalFiles;
    
    console.log(`   📤 Upload Time: ~${Math.ceil(estimatedUploadTime / 60)} minutes`);
    console.log(`   📊 Average File Size: ${formatSize(estimatedSizePerFile)}`);
    console.log(`   🌐 CDN Benefits: Global delivery, auto-optimization`);
    console.log(`   💾 Storage Cost: ~$${((imageAnalysis.totalSize / (1024**3)) * 0.021).toFixed(2)}/month`);
  }

  return {
    ready: overallReady,
    readiness,
    environment: envCheck,
    images: imageAnalysis,
    data: villaData
  };
}

// Export for use in other scripts
module.exports = {
  showMigrationStatus,
  checkMigrationReadiness,
  analyzeOptimizedImages
};

// Run if called directly
if (require.main === module) {
  try {
    const status = showMigrationStatus();
    process.exit(status.ready ? 0 : 1);
  } catch (error) {
    console.error(colorize('💥 STATUS CHECK FAILED:', 'red'), error.message);
    process.exit(1);
  }
}
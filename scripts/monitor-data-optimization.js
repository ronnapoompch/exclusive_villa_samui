const fs = require('fs');
const path = require('path');

// Configuration
const DATA_IMAGES_DIR = path.join(__dirname, '../public/optimized-data-images');
const REPORT_FILE = path.join(__dirname, 'data-image-optimization-report.json');

// Function to get directory size recursively
function getDirectorySize(dirPath) {
  let size = 0;
  
  if (!fs.existsSync(dirPath)) return 0;
  
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(itemPath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}

// Function to count files recursively
function countFiles(dirPath) {
  let count = 0;
  
  if (!fs.existsSync(dirPath)) return 0;
  
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      count += countFiles(itemPath);
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(item)) {
      count++;
    }
  }
  
  return count;
}

// Function to count villa directories
function countVillaDirectories(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  const items = fs.readdirSync(dirPath);
  return items.filter(item => {
    const itemPath = path.join(dirPath, item);
    return fs.statSync(itemPath).isDirectory();
  }).length;
}

// Format file size
function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Main monitor function
function monitorDataImageOptimization() {
  console.clear();
  
  console.log('🚀 DATA IMAGE OPTIMIZATION MONITOR');
  console.log('='.repeat(50));
  
  // Check if optimization is running
  const optimizedSize = getDirectorySize(DATA_IMAGES_DIR);
  const optimizedFiles = countFiles(DATA_IMAGES_DIR);
  const villaCount = countVillaDirectories(DATA_IMAGES_DIR);
  
  console.log(`📁 Villa Directories: ${villaCount}`);
  console.log(`📸 Optimized Images: ${optimizedFiles}`);
  console.log(`📦 Total Optimized Size: ${formatSize(optimizedSize)}`);
  
  // Load report if exists
  if (fs.existsSync(REPORT_FILE)) {
    const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
    const compressionRatio = report.compressionRatio.toFixed(1);
    
    console.log(`💰 Space Saved: ${formatSize(report.spaceSaved)} (${compressionRatio}%)`);
    console.log(`⏱️  Processing Time: ${report.processingTime.toFixed(1)}s`);
    
    if (report.errors > 0) {
      console.log(`❌ Errors: ${report.errors}`);
    }
    
    console.log(`📅 Last Updated: ${new Date(report.timestamp).toLocaleString()}`);
    
    if (report.totalProcessed > 0) {
      console.log('\n✅ DATA IMAGE OPTIMIZATION COMPLETED!');
    }
  } else {
    console.log('\n⏳ No optimization report found yet...');
  }
  
  console.log('='.repeat(50));
  console.log('⏳ Monitoring... (refreshes every 5 seconds)');
}

// Start monitoring
console.log('Starting Data Image Optimization Monitor...\n');
monitorDataImageOptimization();

// Update every 5 seconds
setInterval(monitorDataImageOptimization, 5000);
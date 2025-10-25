const fs = require('fs');
const path = require('path');

/**
 * Image Optimization Progress Monitor
 */
class OptimizationMonitor {
  constructor() {
    this.originalDir = './public/villas';
    this.optimizedDir = './public/optimized-villas';
  }

  getStats() {
    try {
      // Count original villas
      const originalVillas = fs.readdirSync(this.originalDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory()).length;

      // Count optimized villas
      const optimizedVillas = fs.existsSync(this.optimizedDir) ? 
        fs.readdirSync(this.optimizedDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory()).length : 0;

      // Calculate total file sizes
      const originalSize = this.calculateDirectorySize(this.originalDir);
      const optimizedSize = fs.existsSync(this.optimizedDir) ? 
        this.calculateDirectorySize(this.optimizedDir) : 0;

      const progress = (optimizedVillas / originalVillas * 100).toFixed(1);
      const compressionRatio = originalSize > 0 ? 
        ((originalSize - optimizedSize) / originalSize * 100).toFixed(1) : 0;

      return {
        originalVillas,
        optimizedVillas,
        progress,
        originalSize: this.formatBytes(originalSize),
        optimizedSize: this.formatBytes(optimizedSize),
        savedSpace: this.formatBytes(originalSize - optimizedSize),
        compressionRatio
      };
    } catch (error) {
      console.error('Error getting stats:', error.message);
      return null;
    }
  }

  calculateDirectorySize(dirPath, totalSize = 0) {
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          totalSize += this.calculateDirectorySize(fullPath);
        } else if (item.isFile()) {
          const stats = fs.statSync(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
    
    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printReport() {
    const stats = this.getStats();
    if (!stats) return;

    console.clear();
    console.log('🚀 IMAGE OPTIMIZATION PROGRESS MONITOR');
    console.log('='.repeat(50));
    console.log(`📁 Villas: ${stats.optimizedVillas}/${stats.originalVillas} (${stats.progress}%)`);
    console.log(`📦 Original Size: ${stats.originalSize}`);
    console.log(`📦 Optimized Size: ${stats.optimizedSize}`);
    console.log(`💰 Space Saved: ${stats.savedSpace} (${stats.compressionRatio}%)`);
    console.log('='.repeat(50));
    
    // Progress bar
    const barLength = 30;
    const filled = Math.floor((stats.progress / 100) * barLength);
    const empty = barLength - filled;
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty);
    console.log(`Progress: [${progressBar}] ${stats.progress}%`);
    
    if (stats.progress < 100) {
      console.log('\n⏳ Processing... (refreshes every 5 seconds)');
    } else {
      console.log('\n🎉 OPTIMIZATION COMPLETE!');
    }
  }

  startMonitoring() {
    console.log('Starting optimization monitor...\n');
    
    this.printReport();
    
    const interval = setInterval(() => {
      const stats = this.getStats();
      if (stats && parseFloat(stats.progress) < 100) {
        this.printReport();
      } else {
        clearInterval(interval);
        this.printReport();
        console.log('\n✅ Monitoring stopped - optimization complete!');
      }
    }, 5000); // Update every 5 seconds
  }
}

// Run monitor
const monitor = new OptimizationMonitor();
monitor.startMonitoring();
const fs = require('fs');
const path = require('path');

const sampleDir = path.join('data', 'Villla Data (New)', '5 Stars beachfront Villa');

if (fs.existsSync(sampleDir)) {
  const categories = fs.readdirSync(sampleDir).filter(f => 
    fs.statSync(path.join(sampleDir, f)).isDirectory()
  );
  
  console.log('📁 Categories found:', categories);
  console.log('\n📊 Sample file analysis:\n');
  
  let totalSize = 0;
  let totalFiles = 0;
  
  categories.forEach(cat => {
    const catPath = path.join(sampleDir, cat);
    const files = fs.readdirSync(catPath);
    
    console.log(`\n${cat}/ (${files.length} files)`);
    
    files.slice(0, 3).forEach(file => {
      const filePath = path.join(catPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      const ext = path.extname(file).toLowerCase();
      
      console.log(`  - ${file}: ${sizeKB} KB (${ext})`);
      totalSize += stats.size;
      totalFiles++;
    });
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`📈 Sample stats:`);
  console.log(`   Files: ${totalFiles}`);
  console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Avg size: ${(totalSize / totalFiles / 1024).toFixed(1)} KB`);
}

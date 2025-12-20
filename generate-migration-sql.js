const fs = require('fs');
const path = require('path');

console.log('📦 Generating Complete SQL Migration Script...\n');

const migrationsDir = path.join(__dirname, 'prisma', 'migrations');
const outputFile = path.join(__dirname, 'supabase-full-migration.sql');

// Get all migration folders (sorted by timestamp)
const migrationFolders = fs.readdirSync(migrationsDir)
  .filter(item => fs.statSync(path.join(migrationsDir, item)).isDirectory())
  .sort();

console.log(`Found ${migrationFolders.length} migrations:\n`);

let fullSQL = `-- ======================================
-- Full Migration Script for Supabase
-- Generated: ${new Date().toISOString()}
-- ======================================

`;

migrationFolders.forEach((folder, index) => {
  const migrationSQL = path.join(migrationsDir, folder, 'migration.sql');
  
  if (fs.existsSync(migrationSQL)) {
    console.log(`  ${index + 1}. ${folder}`);
    
    const sql = fs.readFileSync(migrationSQL, 'utf-8');
    
    fullSQL += `
-- ======================================
-- Migration: ${folder}
-- ======================================

${sql}

`;
  }
});

// Write to file
fs.writeFileSync(outputFile, fullSQL);

console.log(`\n✅ Complete SQL script generated!`);
console.log(`📄 File: ${outputFile}`);
console.log(`📊 Size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
console.log(`\n🔗 Copy this file content and run in Supabase SQL Editor!`);

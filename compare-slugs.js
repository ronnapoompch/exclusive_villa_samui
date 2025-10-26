const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function compareSlugFormats() {
  try {
    console.log('🔍 Comparing slug formats between JSON and Database...\n');
    
    // Load JSON data
    const jsonData = JSON.parse(
      fs.readFileSync('./data/villas-optimized.json', 'utf8')
    );
    
    // Get database slugs
    const dbVillas = await prisma.villa.findMany({
      select: { slug: true, name: true },
      orderBy: { slug: 'asc' }
    });
    
    console.log('📊 Counts:');
    console.log(`  - JSON: ${jsonData.length} villas`);
    console.log(`  - Database: ${dbVillas.length} villas\n`);
    
    // Sample comparison
    console.log('📋 Sample slugs from JSON (first 10):');
    jsonData.slice(0, 10).forEach(v => {
      console.log(`  - "${v.slug}" (${v.name})`);
    });
    
    console.log('\n📋 Sample slugs from Database (first 10):');
    dbVillas.slice(0, 10).forEach(v => {
      console.log(`  - "${v.slug}" (${v.name})`);
    });
    
    // Check for exact matches
    const jsonSlugs = new Set(jsonData.map(v => v.slug));
    const dbSlugs = new Set(dbVillas.map(v => v.slug));
    
    const matches = [...jsonSlugs].filter(slug => dbSlugs.has(slug));
    
    console.log(`\n🔍 Exact matches: ${matches.length} slugs`);
    
    if (matches.length > 0) {
      console.log('\n✅ Sample matching slugs:');
      matches.slice(0, 5).forEach(slug => {
        console.log(`  - ${slug}`);
      });
    }
    
    // Find slugs only in JSON
    const onlyInJson = [...jsonSlugs].filter(slug => !dbSlugs.has(slug));
    console.log(`\n📁 Slugs only in JSON: ${onlyInJson.length}`);
    if (onlyInJson.length > 0) {
      console.log('Sample:');
      onlyInJson.slice(0, 5).forEach(slug => {
        const villa = jsonData.find(v => v.slug === slug);
        console.log(`  - "${slug}" (${villa.name})`);
      });
    }
    
    // Find slugs only in DB
    const onlyInDb = [...dbSlugs].filter(slug => !jsonSlugs.has(slug));
    console.log(`\n💾 Slugs only in Database: ${onlyInDb.length}`);
    if (onlyInDb.length > 0) {
      console.log('Sample:');
      onlyInDb.slice(0, 5).forEach(slug => {
        const villa = dbVillas.find(v => v.slug === slug);
        console.log(`  - "${slug}" (${villa.name})`);
      });
    }
    
    // Check for case sensitivity issues
    console.log('\n🔤 Checking for case sensitivity issues...');
    const jsonSlugsLower = jsonData.map(v => ({ 
      original: v.slug, 
      lower: v.slug.toLowerCase(),
      name: v.name 
    }));
    const dbSlugsLower = dbVillas.map(v => ({ 
      original: v.slug, 
      lower: v.slug.toLowerCase(),
      name: v.name
    }));
    
    let caseIssues = 0;
    jsonSlugsLower.forEach(json => {
      const dbMatch = dbSlugsLower.find(db => 
        db.lower === json.lower && db.original !== json.original
      );
      if (dbMatch) {
        caseIssues++;
        if (caseIssues <= 5) {
          console.log(`  ⚠️  JSON: "${json.original}" vs DB: "${dbMatch.original}"`);
          console.log(`     (${json.name})`);
        }
      }
    });
    
    if (caseIssues === 0) {
      console.log('  ✅ No case sensitivity issues found');
    } else {
      console.log(`  ⚠️  Found ${caseIssues} potential case issues`);
    }
    
    // Check slug character differences
    console.log('\n🔍 Analyzing slug patterns...');
    const jsonHasSpaces = jsonData.filter(v => v.slug.includes(' ')).length;
    const dbHasSpaces = dbVillas.filter(v => v.slug.includes(' ')).length;
    const jsonHasUnderscore = jsonData.filter(v => v.slug.includes('_')).length;
    const dbHasUnderscore = dbVillas.filter(v => v.slug.includes('_')).length;
    
    console.log(`  JSON slugs with spaces: ${jsonHasSpaces}`);
    console.log(`  DB slugs with spaces: ${dbHasSpaces}`);
    console.log(`  JSON slugs with underscores: ${jsonHasUnderscore}`);
    console.log(`  DB slugs with underscores: ${dbHasUnderscore}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

compareSlugFormats();

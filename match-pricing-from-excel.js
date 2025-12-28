const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Read Excel price listing and match with villa JSON by CODE ID
 */
async function matchPricingData() {
  console.log('🔄 Starting price matching process...\n');
  
  // Paths
  const excelPath = path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx');
  const jsonPath = path.join(__dirname, 'data', 'villas-vercel-blob.json');
  const outputPath = path.join(__dirname, 'data', 'villas-with-pricing.json');
  
  // Check if files exist
  if (!fs.existsSync(excelPath)) {
    console.error('❌ Excel file not found:', excelPath);
    process.exit(1);
  }
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ JSON file not found:', jsonPath);
    process.exit(1);
  }
  
  console.log('📂 Reading Excel file...');
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const excelData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`✅ Loaded ${excelData.length} rows from Excel\n`);
  
  // Display first few rows to understand structure
  console.log('📊 Excel structure (first 3 rows):');
  excelData.slice(0, 3).forEach((row, i) => {
    console.log(`\nRow ${i + 1}:`, JSON.stringify(row, null, 2));
  });
  
  // Read JSON villas
  console.log('\n📂 Reading villa JSON...');
  const villasJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`✅ Loaded ${villasJson.length} villas from JSON\n`);
  
  // Create CODE ID to pricing map
  console.log('🔍 Creating pricing lookup map...');
  const pricingMap = new Map();
  
  excelData.forEach(row => {
    // Try to find CODE ID field (might be different names)
    const codeId = row['CODE ID.'] || row['CODE ID'] || row['Code ID'] || 
                   row['CODE_ID'] || row['code_id'] || row['CodeID'] || 
                   row['codeId'] || row['CODE'] || row['Code'];
    
    if (codeId) {
      pricingMap.set(codeId.toString().trim(), row);
    }
  });
  
  console.log(`✅ Created pricing map with ${pricingMap.size} entries\n`);
  
  // Match and update villas
  console.log('🔄 Matching villas with pricing data...');
  let matchedCount = 0;
  let unmatchedCount = 0;
  const unmatchedVillas = [];
  
  const updatedVillas = villasJson.map(villa => {
    const pricing = pricingMap.get(villa.codeId);
    
    if (pricing) {
      matchedCount++;
      
      // Extract monthly prices
      const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                     'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      
      const pricesByMonth = {};
      months.forEach(month => {
        const priceValue = pricing[month];
        if (priceValue) {
          // Parse price (remove K, commas, etc.)
          const priceStr = priceValue.toString().toUpperCase();
          const numMatch = priceStr.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
          if (numMatch) {
            let price = parseFloat(numMatch[1].replace(/,/g, ''));
            // If contains 'K', multiply by 1000
            if (priceStr.includes('K')) {
              price = price * 1000;
            }
            pricesByMonth[month.toLowerCase()] = price;
          }
        }
      });
      
      // Calculate min/max from monthly prices
      const monthlyPrices = Object.values(pricesByMonth);
      const minPrice = monthlyPrices.length > 0 ? Math.min(...monthlyPrices) : villa.priceRange?.min || 0;
      const maxPrice = monthlyPrices.length > 0 ? Math.max(...monthlyPrices) : villa.priceRange?.max || 0;
      
      // Extract monthly rental price
      const monthlyStr = pricing['Monthly'] || pricing['monthly_price'] || '';
      let monthlyPrice = '';
      if (monthlyStr) {
        monthlyPrice = monthlyStr.toString();
      }
      
      // Update villa with pricing
      return {
        ...villa,
        pricePerNight: null, // Daily prices are in monthly breakdown
        priceRange: {
          min: minPrice,
          max: maxPrice,
          display: minPrice && maxPrice
            ? `฿${minPrice.toLocaleString()}-${maxPrice.toLocaleString()}`
            : villa.priceRange?.display || ''
        },
        monthlyPrice: monthlyPrice,
        pricesByMonth: pricesByMonth,
        // Keep original data
        _pricingSourceData: pricing
      };
    } else {
      unmatchedCount++;
      unmatchedVillas.push({
        codeId: villa.codeId,
        name: villa.name
      });
      return villa;
    }
  });
  
  // Save updated JSON
  console.log('\n💾 Saving updated villa data...');
  fs.writeFileSync(outputPath, JSON.stringify(updatedVillas, null, 2), 'utf8');
  
  // Copy to src/data as well
  const srcOutputPath = path.join(__dirname, 'src', 'data', 'villas-with-pricing.json');
  fs.writeFileSync(srcOutputPath, JSON.stringify(updatedVillas, null, 2), 'utf8');
  
  console.log(`✅ Saved to: ${outputPath}`);
  console.log(`✅ Saved to: ${srcOutputPath}\n`);
  
  // Summary
  console.log('📊 Matching Summary:');
  console.log(`   ✅ Matched: ${matchedCount} villas`);
  console.log(`   ❌ Unmatched: ${unmatchedCount} villas\n`);
  
  if (unmatchedVillas.length > 0) {
    console.log('⚠️  Unmatched villas:');
    unmatchedVillas.forEach(v => {
      console.log(`   - ${v.codeId}: ${v.name}`);
    });
    console.log();
  }
  
  // Show sample
  const sampleVilla = updatedVillas.find(v => pricingMap.has(v.codeId));
  if (sampleVilla) {
    console.log('📝 Sample updated villa:');
    console.log(`   Name: ${sampleVilla.name}`);
    console.log(`   Code: ${sampleVilla.codeId}`);
    console.log(`   Price Range: ${sampleVilla.priceRange.display}`);
    console.log(`   Min: ฿${sampleVilla.priceRange.min}`);
    console.log(`   Max: ฿${sampleVilla.priceRange.max}`);
  }
  
  console.log('\n✅ Price matching complete!');
}

// Run
matchPricingData().catch(error => {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

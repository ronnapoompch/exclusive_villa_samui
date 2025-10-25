const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read Excel file
const excelPath = path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx');
const jsonPath = path.join(__dirname, 'data', 'villas-optimized.json');
const backupPath = path.join(__dirname, 'data', 'backups', `villas-optimized-price-update-${Date.now()}.json`);

console.log('📊 Reading Excel file:', excelPath);
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const excelData = XLSX.utils.sheet_to_json(worksheet);

console.log(`✅ Found ${excelData.length} rows in Excel`);

// Read current JSON
console.log('\n📖 Reading current JSON:', jsonPath);
const villasData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`✅ Found ${villasData.length} villas in JSON`);

// Create backup
console.log('\n💾 Creating backup...');
fs.writeFileSync(backupPath, JSON.stringify(villasData, null, 2));
console.log('✅ Backup created:', backupPath);

// Helper function to parse price from Excel (handles "32K", "120K-140K", "Monthly 120K-140K", etc.)
function parsePrice(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return null;
  
  // Check if this is a monthly rate
  const isMonthlyRate = /Monthly|\/M/i.test(priceStr);
  
  // Remove "Monthly", spaces, and other text
  let cleanStr = priceStr.replace(/Monthly|\/M/gi, '').trim();
  
  // Handle range like "120K-140K" or "100-180K" - return as object with range info
  if (cleanStr.includes('-')) {
    const parts = cleanStr.split('-');
    
    // Check if last part has K, if yes, apply to both parts
    const hasKSuffix = parts[parts.length - 1].toUpperCase().includes('K');
    
    const prices = parts.map(p => {
      let clean = p.trim().replace(/K/gi, '');
      let num = parseFloat(clean);
      if (isNaN(num)) return null;
      
      // If last part has K, multiply all parts by 1000
      return hasKSuffix ? Math.round(num * 1000) : Math.round(num);
    }).filter(p => p !== null);
    
    if (prices.length === 2) {
      return {
        min: prices[0],
        max: prices[1],
        isRange: true,
        isMonthlyRate
      };
    }
  }
  
  // Handle "32K" format
  if (cleanStr.toUpperCase().includes('K')) {
    const num = parseFloat(cleanStr.replace(/K/gi, ''));
    return { value: Math.round(num * 1000), isRange: false, isMonthlyRate };
  }
  
  // Handle plain numbers
  const num = parseFloat(cleanStr);
  return isNaN(num) ? null : { value: Math.round(num), isRange: false, isMonthlyRate };
}

// Helper function to get current month's price and promotional rates
function getCurrentMonthPrice(excelRow) {
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  
  // Get current month (0-11)
  const now = new Date();
  const currentMonthIndex = now.getMonth(); // 0 = January, 9 = October
  const currentMonthName = months[currentMonthIndex];
  
  console.log(`📅 Current month: ${currentMonthName} (${now.getFullYear()})`);
  
  // Try to get current month's price
  let mainPrice = null;
  if (excelRow[currentMonthName]) {
    mainPrice = parsePrice(excelRow[currentMonthName]);
  }
  
  // Fallback: try to find any valid price
  if (!mainPrice) {
    for (const month of months) {
      if (excelRow[month]) {
        mainPrice = parsePrice(excelRow[month]);
        if (mainPrice) break;
      }
    }
  }
  
  if (!mainPrice) return null;
  
  // Get Weekly and Monthly promotional rates from Excel
  const result = { ...mainPrice };
  
  // Check for Weekly rate column
  if (excelRow['Weekly'] || excelRow['WEEKLY']) {
    const weeklyPrice = parsePrice(excelRow['Weekly'] || excelRow['WEEKLY']);
    if (weeklyPrice && !weeklyPrice.isRange) {
      result.weeklyRate = weeklyPrice.value;
    }
  }
  
  // Check for Monthly rate column
  if (excelRow['Monthly'] || excelRow['MONTHLY']) {
    const monthlyPrice = parsePrice(excelRow['Monthly'] || excelRow['MONTHLY']);
    if (monthlyPrice && !monthlyPrice.isRange) {
      result.monthlyRate = monthlyPrice.value;
    }
  }
  
  return result;
}

// Update prices
console.log('\n🔄 Updating prices...\n');
let updated = 0;
let notFound = 0;
let errors = 0;

villasData.forEach(villa => {
  // Find matching Excel row by "NEW NAME (IN CASE CAN USE)" or "VILLAS REAL NAME"
  const excelRow = excelData.find(row => {
    const newName = row['NEW NAME (IN CASE CAN USE)'];
    const realName = row['VILLAS REAL NAME'];
    
    return (newName && newName.trim().toLowerCase() === villa.name.trim().toLowerCase()) ||
           (realName && realName.trim().toLowerCase() === villa.name.trim().toLowerCase());
  });
  
  if (excelRow) {
    const currentPrice = getCurrentMonthPrice(excelRow);
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const currentMonthName = months[new Date().getMonth()];
    
    if (currentPrice) {
      // Has valid price for current month
      const oldPriceStr = villa.pricePerNight ? '฿' + villa.pricePerNight.toLocaleString() : 'No price';
      const oldRangeStr = villa.priceRange ? ` (${villa.priceRange})` : '';
      
      console.log(`✅ ${villa.name}`);
      console.log(`   Old: ${oldPriceStr}${oldRangeStr}`);
      
      if (currentPrice.isRange) {
        // Range price like "120K-140K"
        villa.pricePerNight = currentPrice.min; // Use min for sorting/filtering
        villa.priceRange = `฿${currentPrice.min.toLocaleString()}-${currentPrice.max.toLocaleString()}`;
        villa.isMonthlyRate = currentPrice.isMonthlyRate || false;
        console.log(`   New (${currentMonthName}): ${villa.priceRange} (range)${villa.isMonthlyRate ? ' - MONTHLY RATE' : ''}`);
      } else {
        // Single price
        villa.pricePerNight = currentPrice.value;
        villa.isMonthlyRate = currentPrice.isMonthlyRate || false;
        delete villa.priceRange; // Remove range if exists
        console.log(`   New (${currentMonthName}): ฿${currentPrice.value.toLocaleString()}${villa.isMonthlyRate ? ' - MONTHLY RATE' : ''}`);
      }
      
      // Add Weekly/Monthly rates if available
      if (currentPrice.weeklyRate) {
        villa.weeklyRate = currentPrice.weeklyRate;
        console.log(`   Weekly rate: ฿${currentPrice.weeklyRate.toLocaleString()}`);
      } else {
        delete villa.weeklyRate;
      }
      
      if (currentPrice.monthlyRate) {
        villa.monthlyRate = currentPrice.monthlyRate;
        console.log(`   Monthly rate: ฿${currentPrice.monthlyRate.toLocaleString()}`);
      } else {
        delete villa.monthlyRate;
      }
      
      // Update beachfront status from Excel column "Beachfront (*)"
      const beachfrontValue = excelRow['Beachfront (*)'];
      if (beachfrontValue && beachfrontValue.includes('*')) {
        villa.beachfront = true;
        console.log(`   🏖️ Beachfront: YES`);
      } else {
        villa.beachfront = false;
      }
      
      // Show all monthly prices for reference
      const monthlyPrices = months.map(m => {
        const priceObj = excelRow[m] ? parsePrice(excelRow[m]) : null;
        if (priceObj) {
          if (priceObj.isRange) {
            return `${m.substring(0, 3)}: ฿${priceObj.min.toLocaleString()}-${priceObj.max.toLocaleString()}`;
          } else {
            return `${m.substring(0, 3)}: ฿${priceObj.value.toLocaleString()}`;
          }
        }
        return null;
      }).filter(p => p);
      
      if (monthlyPrices.length > 0) {
        console.log(`   All months: ${monthlyPrices.join(', ')}`);
      }
      console.log('');
      
      updated++;
    } else {
      // No valid price for current month - set to null to hide price
      if (villa.pricePerNight !== null && villa.pricePerNight !== 0) {
        console.log(`⚠️  ${villa.name} - No price for ${currentMonthName}, removing price display`);
        console.log(`   Old: ฿${villa.pricePerNight.toLocaleString()}`);
        console.log(`   New: Hidden (no price for current month)`);
        console.log('');
        
        villa.pricePerNight = null;
        delete villa.priceRange;
        updated++;
      }
      errors++;
    }
  } else {
    console.log(`❌ ${villa.name} - Not found in Excel`);
    notFound++;
  }
});

// Save updated data
console.log('\n💾 Saving updated data...');
fs.writeFileSync(jsonPath, JSON.stringify(villasData, null, 2));

console.log('\n📊 Summary:');
console.log(`   ✅ Updated: ${updated} villas`);
console.log(`   ❌ Not found in Excel: ${notFound} villas`);
console.log(`   ⚠️  No valid price: ${errors} villas`);
console.log(`   📝 Total villas: ${villasData.length}`);
console.log('\n✅ Prices updated successfully!');
console.log(`💾 Backup saved to: ${backupPath}`);

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Read Excel and villas-vercel-blob.json
const excelPath = path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx');
const jsonPath = path.join(__dirname, 'data', 'villas-vercel-blob.json');

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
const villasData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Parse price string to number
function parsePrice(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return null;
  
  // Remove K, THB, ฿, spaces, commas
  const cleaned = priceStr.replace(/[K,THB฿\s]/gi, '');
  const num = parseFloat(cleaned);
  
  if (isNaN(num)) return null;
  
  // If ends with K, multiply by 1000
  if (priceStr.toUpperCase().includes('K')) {
    return num * 1000;
  }
  
  return num;
}

// Extract monthly rates from Excel
function getMonthlyRates(row) {
  const rates = [];
  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  
  // Columns 10-21 are monthly prices
  for (let i = 0; i < 12; i++) {
    const cellValue = row[10 + i]; // Column K-V (index 10-21)
    const price = parsePrice(cellValue);
    
    if (price) {
      rates.push({
        month: i + 1,
        monthName: monthNames[i],
        rate: price
      });
    }
  }
  
  return rates;
}

// Check if villa has monthly pricing column (Column 22)
function hasMonthlyColumn(row) {
  const monthlyValue = row[22]; // Column W (index 22)
  if (!monthlyValue) return false;
  
  // Check if it's a monthly rate indicator
  const str = String(monthlyValue).toLowerCase();
  return str.includes('monthly') || str.includes('k/m') || str.includes('all include');
}

// Check if K-V columns (10-21) are merged (monthly rate)
function isMergedMonthlyRate(row, worksheet, rowIndex) {
  if (!worksheet['!merges']) return false;
  
  // Check if any K-V cell in this row is part of a merge
  const actualRowIndex = rowIndex + 1; // +1 because data starts at row 1, headers at row 0
  
  for (const merge of worksheet['!merges']) {
    // Check if merge spans K-V columns (10-21) in this row
    if (merge.s.r === actualRowIndex && merge.e.r === actualRowIndex) {
      // Check if merge includes columns K-V (10-21)
      if (merge.s.c === 10 && merge.e.c === 21) {
        return true;
      }
    }
  }
  
  return false;
}

// Get merged cell value for monthly rate
function getMergedMonthlyRate(row, worksheet, rowIndex) {
  const actualRowIndex = rowIndex + 1;
  
  if (!worksheet['!merges']) return null;
  
  for (const merge of worksheet['!merges']) {
    if (merge.s.r === actualRowIndex && merge.e.r === actualRowIndex) {
      if (merge.s.c === 10 && merge.e.c === 21) {
        // Get value from first cell of merge
        const cellAddress = XLSX.utils.encode_cell({ r: merge.s.r, c: merge.s.c });
        const cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : null;
        return cellValue;
      }
    }
  }
  
  return null;
}

console.log('🔍 Analyzing monthly pricing from Excel...\n');

// Map CODE ID to monthly rates
const monthlyPricingMap = new Map();
const headers = excelData[0];

excelData.slice(1).forEach((row, idx) => {
  const codeId = row[3]; // Column D (CODE ID)
  const villaName = row[0]; // Column A (VILLAS REAL NAME)
  
  if (!codeId) return;
  
  // Check if this row has merged K-V columns (monthly rate)
  const isMerged = isMergedMonthlyRate(row, worksheet, idx);
  const mergedValue = isMerged ? getMergedMonthlyRate(row, worksheet, idx) : null;
  
  if (isMerged && mergedValue) {
    // This is a monthly rate villa with merged cells
    monthlyPricingMap.set(codeId, {
      villaName,
      codeId,
      monthlyRateText: String(mergedValue),
      isMonthlyRate: true
    });
    
    console.log(`✅ ${codeId}: ${villaName}`);
    console.log(`   Monthly Rate: ${mergedValue}`);
    console.log('');
  }
});

console.log(`\n📊 Summary: Found ${monthlyPricingMap.size} villas with monthly pricing\n`);

// Update villas-vercel-blob.json
let updatedCount = 0;
const updatedVillas = villasData.map(villa => {
  const pricing = monthlyPricingMap.get(villa.codeId);
  
  if (pricing) {
    updatedCount++;
    return {
      ...villa,
      isMonthlyRate: true,
      monthlyPriceText: pricing.monthlyRateText, // เช่น "Monthly 120K-140K"
      pricePerNight: null // Monthly villas don't have per-night pricing
    };
  }
  
  return villa;
});

// Save updated data
const outputPath = path.join(__dirname, 'data', 'villas-with-monthly-pricing.json');
fs.writeFileSync(outputPath, JSON.stringify(updatedVillas, null, 2));

console.log(`✨ Updated ${updatedCount} villas with monthly pricing`);
console.log(`📝 Saved to: ${outputPath}`);

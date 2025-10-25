const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx');
console.log('📊 Reading Excel file:', excelPath);

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

console.log('\n📋 Column names:');
const columns = Object.keys(data[0]);
columns.forEach((col, i) => {
  console.log(`  ${i}: ${col}`);
});

console.log('\n🏖️ Checking Beachfront column (G):');
const beachfrontCol = columns.find(col => 
  col.toLowerCase().includes('beachfront') || 
  col.toLowerCase().includes('beach')
);

if (beachfrontCol) {
  console.log(`✅ Found column: "${beachfrontCol}"`);
  console.log('\n📊 Sample data (first 10 villas):');
  
  data.slice(0, 10).forEach((row, i) => {
    const villaName = row['NEW NAME (IN CASE CAN USE)'] || row['VILLAS REAL NAME'];
    const beachfrontValue = row[beachfrontCol];
    const hasAsterisk = beachfrontValue && beachfrontValue.includes('*');
    
    console.log(`  ${i + 1}. ${villaName}`);
    console.log(`     Beachfront: "${beachfrontValue}" ${hasAsterisk ? '✅ HAS *' : ''}`);
  });
  
  // Count villas with asterisk
  const beachfrontCount = data.filter(row => {
    const val = row[beachfrontCol];
    return val && val.includes('*');
  }).length;
  
  console.log(`\n📈 Total villas with * in Beachfront: ${beachfrontCount} out of ${data.length}`);
} else {
  console.log('❌ No Beachfront column found');
  console.log('Available columns:', columns.join(', '));
}

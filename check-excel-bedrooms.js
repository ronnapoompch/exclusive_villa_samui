const XLSX = require('xlsx');

console.log('🔍 Checking Excel data for bedroom issues...\n');

const wb = XLSX.readFile('data/New EXVLSM Price Listing.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null });

console.log(`📊 Total rows: ${data.length}\n`);

// Check first few rows
console.log('First 3 rows with bedroom data:');
data.slice(0, 3).forEach((row, i) => {
  console.log(`\nRow ${i + 1}:`);
  console.log(`  Name: ${row['Villa Name']}`);
  console.log(`  Bedrooms: ${row['Bedrooms']} (type: ${typeof row['Bedrooms']})`);
  console.log(`  Bathrooms: ${row['Bathrooms']} (type: ${typeof row['Bathrooms']})`);
  console.log(`  Guests: ${row['Guests']} (type: ${typeof row['Guests']})`);
});

// Find problematic rows
console.log('\n\n🔴 Problematic rows (with numbers > 1000):');
const problematic = data.filter(row => {
  const bedrooms = parseInt(row['Bedrooms']);
  const bathrooms = parseInt(row['Bathrooms']);
  const guests = parseInt(row['Guests']);
  return bedrooms > 100 || bathrooms > 100 || guests > 100;
});

console.log(`Found ${problematic.length} problematic rows\n`);

problematic.slice(0, 10).forEach((row, i) => {
  console.log(`${i + 1}. ${row['Villa Name']}`);
  console.log(`   Bedrooms: ${row['Bedrooms']}`);
  console.log(`   Bathrooms: ${row['Bathrooms']}`);
  console.log(`   Guests: ${row['Guests']}`);
  console.log(`   Airbnb Link: ${row['Airbnb Link']}`);
  console.log('');
});

// Check column headers
console.log('\n📋 Column headers in Excel:');
const headers = Object.keys(data[0]);
headers.forEach((h, i) => {
  console.log(`${i + 1}. "${h}"`);
});

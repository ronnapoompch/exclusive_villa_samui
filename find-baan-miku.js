const XLSX = require('xlsx');

const wb = XLSX.readFile('data/New EXVLSM Price Listing.xlsx', { raw: true });
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { raw: true });

console.log('Looking for Villa Baan Miku...\n');

data.forEach((row, i) => {
  const realName = row['VILLAS REAL NAME'];
  const titleName = row['TITLE NAME'];
  
  if (realName?.toLowerCase().includes('miku') || titleName?.toLowerCase().includes('miku')) {
    console.log(`Found at row ${i + 1}:`);
    console.log(`  VILLAS REAL NAME: ${realName}`);
    console.log(`  TITLE NAME: ${titleName}`);
    console.log(`  Bedroom: ${row['Bedroom']}`);
    console.log(`  PAX: ${row['PAX']}`);
    console.log('');
  }
});

// Search for any villa with bedroom = 45811
console.log('\nSearching for villas with Bedroom = 45811:\n');
data.forEach((row, i) => {
  if (row['Bedroom'] === 45811) {
    console.log(`Found at row ${i + 1}:`);
    console.log(`  VILLAS REAL NAME: ${row['VILLAS REAL NAME']}`);
    console.log(`  TITLE NAME: ${row['TITLE NAME']}`);
    console.log(`  Bedroom: ${row['Bedroom']}`);
    console.log(`  PAX: ${row['PAX']}`);
    console.log('');
  }
});

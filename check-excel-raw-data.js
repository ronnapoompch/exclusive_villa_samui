const XLSX = require('xlsx');

console.log('🔍 Checking specific villas in Excel...\n');

const wb = XLSX.readFile('data/New EXVLSM Price Listing.xlsx', { cellDates: false, raw: true });
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { raw: true, defval: null });

// Find the problematic villas
const villaNames = [
  'Millennial Residence Villa Wind',
  'Millennial Residence Villa Solara', 
  'Chaweng Cresta Hill',
  'Cadenza Garden'
];

console.log('Looking for these villas in Excel:\n');

data.forEach((row, index) => {
  const realName = row['VILLAS REAL NAME'];
  const titleName = row['TITLE NAME'];
  const newName = row['NEW NAME (IN CASE CAN USE)'];
  const bedroom = row['Bedroom'];
  const pax = row['PAX'];
  
  if (realName && villaNames.some(v => realName.includes('Millennial') || realName.includes('Chaweng') || realName.includes('Cadenza'))) {
    console.log(`Row ${index + 1}:`);
    console.log(`  VILLAS REAL NAME: ${realName}`);
    console.log(`  TITLE NAME: ${titleName}`);
    console.log(`  Bedroom: ${bedroom} (type: ${typeof bedroom})`);
    console.log(`  PAX: ${pax} (type: ${typeof pax})`);
    console.log(`  Raw cell value for Bedroom: ${JSON.stringify(sheet[`E${index + 2}`])}`);
    console.log('');
  }
});

// Show first 10 rows to see pattern
console.log('\n\n📊 First 10 rows of data:\n');
data.slice(0, 10).forEach((row, i) => {
  console.log(`${i + 1}. ${row['VILLAS REAL NAME'] || row['TITLE NAME']}`);
  console.log(`   Bedroom: ${row['Bedroom']} | PAX: ${row['PAX']}`);
});

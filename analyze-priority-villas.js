const XLSX = require('xlsx');

// Read Excel file
const workbook = XLSX.readFile('data/New EXVLSM Price Listing.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON with raw: false to get formatted text
const data = XLSX.utils.sheet_to_json(worksheet, { 
  header: 1,
  raw: false,
  defval: ''
});

console.log('📊 Excel File Analysis - First 20 Rows\n');
console.log('=' .repeat(80));

// Priority villas to look for
const priorityVillas = [
  '5 house',
  'Ariya',
  'Anzhu Seamate',
  'La Moon',
  'Kerem',
  'The one',
  'The wave',
  'Miskawaan',
  'Tish',
  'Zog'
];

// Show header
if (data.length > 0) {
  console.log(`Row 0 (Header):`);
  console.log(`  Column A: "${data[0][0]}"`);
  console.log(`  Column B: "${data[0][1]}"`);
  console.log(`  Column C: "${data[0][2]}"`);
  console.log('=' .repeat(80));
}

// Show first 20 rows
console.log('\nFirst 20 Rows:\n');
data.slice(0, 20).forEach((row, index) => {
  const colA = row[0] || '';
  const colB = row[1] || '';
  console.log(`Row ${index.toString().padStart(2)}: A="${colA.substring(0, 40)}" | B="${colB.substring(0, 40)}"`);
});

console.log('\n' + '=' .repeat(80));
console.log('\n🎯 Searching for Priority Villas:\n');

// Search for priority villas
let found = [];
let notFound = [];

priorityVillas.forEach(villName => {
  const foundRow = data.findIndex((row, index) => {
    if (index === 0) return false; // Skip header
    const colA = (row[0] || '').toLowerCase().trim();
    const colB = (row[1] || '').toLowerCase().trim();
    const search = villName.toLowerCase().trim();
    return colA.includes(search) || colB.includes(search);
  });
  
  if (foundRow > 0) {
    found.push({
      name: villName,
      row: foundRow,
      realName: data[foundRow][0],
      websiteName: data[foundRow][1]
    });
  } else {
    notFound.push(villName);
  }
});

console.log('✅ FOUND:');
found.forEach(v => {
  console.log(`  ${v.name}:`);
  console.log(`    Row: ${v.row}`);
  console.log(`    Column A (Real Name): "${v.realName}"`);
  console.log(`    Column B (Website Name): "${v.websiteName}"`);
  console.log('');
});

if (notFound.length > 0) {
  console.log('❌ NOT FOUND:');
  notFound.forEach(v => console.log(`  - ${v}`));
}

console.log('\n' + '=' .repeat(80));
console.log(`\n📈 Total rows in Excel: ${data.length}`);
console.log(`✅ Priority villas found: ${found.length}/${priorityVillas.length}`);

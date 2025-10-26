// Test Excel data parsing with fixed bedroom logic
require('dotenv').config();
const XLSX = require('xlsx');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx');

console.log('📖 Reading Excel file with formatting preserved...\n');

const workbook = XLSX.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Get data with formatting preserved (raw: false)
const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

console.log(`✅ Found ${data.length} rows\n`);

// Test the problematic villas
const testVillas = [
  { index: 35, name: 'Chaweng Hill' },
  { index: 36, name: 'Choengmon Garden' },
  { index: 93, name: 'Millennial Residence' }
];

testVillas.forEach(({ index, name }) => {
  const row = data[index];
  if (!row) {
    console.log(`❌ Row ${index + 1} not found\n`);
    return;
  }
  
  const bedroomsRaw = String(row['Bedroom'] || '0').trim();
  let bedrooms = 0;
  
  if (bedroomsRaw.includes('-')) {
    const parts = bedroomsRaw.split('-').map(p => parseInt(p.trim()));
    bedrooms = Math.max(...parts.filter(n => !isNaN(n)));
  } else {
    bedrooms = parseInt(bedroomsRaw) || 0;
  }
  
  // Validate
  if (bedrooms > 50 || bedrooms < 0) {
    console.log(`⚠️  ${name} (Row ${index + 1})`);
    console.log(`   Raw: "${bedroomsRaw}" → Invalid: ${bedrooms} → Using default: 3`);
    bedrooms = 3;
  } else {
    console.log(`✅ ${name} (Row ${index + 1})`);
    console.log(`   Raw: "${bedroomsRaw}" → Parsed: ${bedrooms} bedrooms`);
  }
  
  // PAX extraction
  const paxRaw = String(row['PAX'] || '').trim();
  let guests = bedrooms * 2;
  if (paxRaw) {
    const paxMatch = paxRaw.match(/(\d+)(?:-(\d+))?/);
    if (paxMatch) {
      guests = parseInt(paxMatch[2] || paxMatch[1]);
      console.log(`   PAX: "${paxRaw}" → ${guests} guests`);
    }
  } else {
    console.log(`   PAX: (empty) → ${guests} guests (default)`);
  }
  
  console.log('');
});

// Show summary of all villas
console.log('\n📊 Summary of all villas:');
const summary = data.map((row, i) => {
  const bedroomsRaw = String(row['Bedroom'] || '0').trim();
  let bedrooms = 0;
  
  if (bedroomsRaw.includes('-')) {
    const parts = bedroomsRaw.split('-').map(p => parseInt(p.trim()));
    bedrooms = Math.max(...parts.filter(n => !isNaN(n)));
  } else {
    bedrooms = parseInt(bedroomsRaw) || 0;
  }
  
  return { index: i, name: row['NEW NAME (IN CASE CAN USE)'], raw: bedroomsRaw, bedrooms };
});

const invalid = summary.filter(v => v.bedrooms > 50 || v.bedrooms < 0);
console.log(`\n❌ Found ${invalid.length} villas with invalid bedrooms:`);
invalid.forEach(v => {
  console.log(`   Row ${v.index + 1}: ${v.name} - Raw: "${v.raw}" → ${v.bedrooms}`);
});

const valid = summary.filter(v => v.bedrooms > 0 && v.bedrooms <= 50);
console.log(`\n✅ ${valid.length} villas have valid bedroom counts (1-50)`);

const ranges = summary.filter(v => String(v.raw).includes('-'));
console.log(`\n📏 ${ranges.length} villas have bedroom ranges:`);
ranges.slice(0, 5).forEach(v => {
  console.log(`   ${v.name}: "${v.raw}" → ${v.bedrooms} bedrooms`);
});

const XLSX = require('xlsx');

const workbook = XLSX.readFile('data/New EXVLSM Price Listing.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

console.log('🔍 Searching for "The One" villa:\n');

const matches = data.filter((row, index) => {
  if (index === 0) return false;
  const colA = (row[0] || '').toLowerCase();
  const colB = (row[1] || '').toLowerCase();
  return colA.includes('the one') || colB.includes('the one');
});

if (matches.length > 0) {
  console.log(`✅ Found ${matches.length} match(es):\n`);
  matches.forEach((row, i) => {
    console.log(`Match ${i + 1}:`);
    console.log(`  Column A: "${row[0]}"`);
    console.log(`  Column B: "${row[1]}"`);
    console.log('');
  });
} else {
  console.log('❌ No matches found for "The One"');
  console.log('\n💡 Searching for similar names (one, villa one, etc.):\n');
  
  const similar = data.filter((row, index) => {
    if (index === 0) return false;
    const colA = (row[0] || '').toLowerCase();
    const colB = (row[1] || '').toLowerCase();
    return (colA.includes(' one ') || colB.includes(' one ') || 
            colA.startsWith('one ') || colB.startsWith('one ') ||
            colA.endsWith(' one') || colB.endsWith(' one'));
  });
  
  if (similar.length > 0) {
    similar.slice(0, 10).forEach((row, i) => {
      console.log(`${i + 1}. A: "${row[0]}" | B: "${row[1]}"`);
    });
  }
}

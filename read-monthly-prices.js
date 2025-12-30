const XLSX = require('xlsx');
const path = require('path');

// Read Excel file
const excelPath = path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('📊 Excel Structure Analysis\n');
console.log('First 10 rows:');
data.slice(0, 10).forEach((row, idx) => {
  console.log(`Row ${idx}:`, row);
});

console.log('\n🔍 Looking for monthly price columns...');
const headerRow = data[0];
console.log('Headers:', headerRow);

// Find merged cells (monthly price columns)
const range = XLSX.utils.decode_range(worksheet['!ref']);
console.log('\n📐 Sheet range:', worksheet['!ref']);

if (worksheet['!merges']) {
  console.log('\n🔗 Merged cells found:');
  worksheet['!merges'].forEach((merge, idx) => {
    const startCell = XLSX.utils.encode_cell(merge.s);
    const endCell = XLSX.utils.encode_cell(merge.e);
    const cellValue = worksheet[startCell] ? worksheet[startCell].v : 'empty';
    console.log(`${idx + 1}. ${startCell}:${endCell} = "${cellValue}"`);
  });
}

console.log('\n📋 Sample villa data:');
data.slice(1, 6).forEach((row, idx) => {
  if (row[0]) { // If has villa name
    console.log(`\nVilla ${idx + 1}: ${row[0]}`);
    console.log('  Columns:', row.map((cell, i) => `[${i}]=${cell}`).join(', '));
  }
});

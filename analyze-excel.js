// Analyze Excel Structure
const XLSX = require('xlsx');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx');

function analyzeExcel() {
  console.log('📖 Analyzing Excel file...\n');
  
  const workbook = XLSX.readFile(EXCEL_PATH);
  
  console.log(`📄 Sheets found: ${workbook.SheetNames.join(', ')}\n`);
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n📋 Sheet: ${sheetName}`);
    console.log('='.repeat(60));
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length > 0) {
      console.log(`\n✅ Rows: ${data.length}`);
      console.log(`\n📊 Columns:`);
      
      const firstRow = data[0];
      Object.keys(firstRow).forEach((col, index) => {
        const value = firstRow[col];
        const valuePreview = String(value).substring(0, 50);
        console.log(`   ${index + 1}. ${col}`);
        console.log(`      Example: ${valuePreview}${String(value).length > 50 ? '...' : ''}`);
      });
      
      console.log(`\n📝 First 3 rows (sample):`);
      console.log(JSON.stringify(data.slice(0, 3), null, 2));
    } else {
      console.log('⚠️  No data found');
    }
  });
}

analyzeExcel();

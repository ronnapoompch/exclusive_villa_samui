// Test monthly villa API response
const fetch = require('node-fetch');

async function testMonthlyVillas() {
  try {
    console.log('🔍 Fetching villas from API...\n');
    
    const response = await fetch('http://localhost:3000/api/villas?limit=250');
    const json = await response.json();
    
    if (!json.data || !json.data.villas) {
      console.log('❌ No villas in response');
      console.log('Response structure:', Object.keys(json));
      return;
    }
    
    const allVillas = json.data.villas;
    const monthlyVillas = allVillas.filter(v => v.isMonthlyRate === true);
    const withText = monthlyVillas.filter(v => v.monthlyPriceText);
    
    console.log('📊 Total villas:', allVillas.length);
    console.log('✅ Monthly villas (isMonthlyRate=true):', monthlyVillas.length);
    console.log('📝 Monthly villas with monthlyPriceText:', withText.length);
    console.log('\n📋 First 10 monthly villas:\n');
    
    withText.slice(0, 10).forEach((v, i) => {
      console.log(`${i + 1}. ${v.name}`);
      console.log(`   Code: ${v.codeId || 'N/A'}`);
      console.log(`   Text: "${v.monthlyPriceText}"`);
      console.log(`   isMonthlyRate: ${v.isMonthlyRate}`);
      console.log(`   pricePerNight: ${v.pricePerNight}\n`);
    });
    
    if (withText.length === 0) {
      console.log('\n⚠️  No monthly villas with monthlyPriceText found');
      console.log('Sample villa structure:', JSON.stringify(allVillas[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMonthlyVillas();

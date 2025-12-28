const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/villas?limit=5');
    const json = await response.json();
    
    const villas = json.data?.villas || [];
    
    console.log(`📊 Total villas in response: ${villas.length}\n`);
    
    // Find villas with monthly rates
    const monthlyVillas = villas.filter(v => 
      v.monthlyRate > 0 || v.isMonthlyRate || v.allMonthlyRates
    );
    
    console.log(`💰 Villas with monthly indicators: ${monthlyVillas.length}\n`);
    
    if (monthlyVillas.length > 0) {
      console.log('First monthly villa:');
      console.log('='.repeat(60));
      const v = monthlyVillas[0];
      console.log(`Name: ${v.name}`);
      console.log(`Price Per Night: ฿${Number(v.pricePerNight || 0).toLocaleString()}`);
      console.log(`Monthly Rate: ฿${Number(v.monthlyRate || 0).toLocaleString()}`);
      console.log(`Is Monthly Rate: ${v.isMonthlyRate}`);
      console.log(`All Monthly Rates:`, v.allMonthlyRates);
      console.log('='.repeat(60));
    }
    
    // Check Anzhu specifically
    const anzhu = villas.find(v => v.name.includes('Anzhu'));
    if (anzhu) {
      console.log('\n🏠 Anzhu Serenity:');
      console.log('='.repeat(60));
      console.log(`Price Per Night: ฿${Number(anzhu.pricePerNight || 0).toLocaleString()}`);
      console.log(`Monthly Rate: ฿${Number(anzhu.monthlyRate || 0).toLocaleString()}`);
      console.log(`Is Monthly Rate: ${anzhu.isMonthlyRate}`);
      console.log(`All Monthly Rates:`, anzhu.allMonthlyRates);
      console.log('='.repeat(60));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();

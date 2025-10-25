/**
 * VILLA DATA STRUCTURE INSPECTOR
 */

const axios = require('axios');

async function inspectVillaData() {
    try {
        const response = await axios.get('http://localhost:3000/api/villas');
        const data = response.data;
        
        console.log('🔍 Villa API Response Structure:');
        console.log('📊 Response Type:', typeof data);
        console.log('📋 Response Keys:', Object.keys(data));
        
        if (data.success && data.data && data.data.villas) {
            const villas = data.data.villas;
            console.log(`\n🏡 Found ${villas.length} villas`);
            
            if (villas.length > 0) {
                const firstVilla = villas[0];
                console.log('\n📝 First Villa Structure:');
                console.log('Keys:', Object.keys(firstVilla));
                console.log('\nSample Villa Data:');
                console.log(JSON.stringify(firstVilla, null, 2));
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

inspectVillaData();
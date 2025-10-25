// Dry Run - Test with 3 villas only
// ทดสอบกับ 3 villas ก่อนรันจริง
require('dotenv').config({ path: '.env.local' });
const { main } = require('./professional-image-optimizer');

// Override CONFIG to process only 3 villas
const originalReadVillaData = require('./professional-image-optimizer').readVillaData;

console.log('🧪 DRY RUN MODE: Processing only first 3 villas');
console.log('═'.repeat(60));
console.log('');

main().catch(console.error);

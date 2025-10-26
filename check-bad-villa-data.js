const data = require('./data/villas-optimized.json');

console.log('🔍 Checking villas-optimized.json for bad data...\n');
console.log(`Total villas: ${data.length}\n`);

const bad = data.filter(v => v.bedrooms > 100 || v.bathrooms > 100 || v.guests > 100);

console.log(`Found ${bad.length} villas with bad data:\n`);

bad.slice(0, 10).forEach((v, i) => {
  console.log(`${i + 1}. ${v.name}`);
  console.log(`   Bedrooms: ${v.bedrooms}`);
  console.log(`   Bathrooms: ${v.bathrooms}`);
  console.log(`   Guests: ${v.guests}`);
  console.log(`   Slug: ${v.slug}`);
  console.log('');
});

// Check what those numbers actually mean
console.log('\n🔢 Those numbers look like Excel serial dates:');
console.log('45843 = ' + new Date((45843 - 25569) * 86400 * 1000).toISOString().split('T')[0]);
console.log('45844 = ' + new Date((45844 - 25569) * 86400 * 1000).toISOString().split('T')[0]);
console.log('91688 = ' + new Date((91688 - 25569) * 86400 * 1000).toISOString().split('T')[0]);

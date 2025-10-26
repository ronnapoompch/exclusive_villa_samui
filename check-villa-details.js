const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getVillaDetails() {
  try {
    console.log('🔍 Fetching villa details from database...\n');
    
    // Get total count
    const totalCount = await prisma.villa.count();
    console.log(`📊 Total villas in database: ${totalCount}\n`);
    
    // Get count by status
    const activeCount = await prisma.villa.count({ where: { active: true } });
    const inactiveCount = await prisma.villa.count({ where: { active: false } });
    const featuredCount = await prisma.villa.count({ where: { featured: true } });
    const beachfrontCount = await prisma.villa.count({ where: { beachfront: true } });
    
    console.log('📈 Statistics:');
    console.log(`  - Active: ${activeCount}`);
    console.log(`  - Inactive: ${inactiveCount}`);
    console.log(`  - Featured: ${featuredCount}`);
    console.log(`  - Beachfront: ${beachfrontCount}\n`);
    
    // Get bedroom distribution
    const bedroomStats = await prisma.$queryRaw`
      SELECT bedrooms, COUNT(*)::int as count
      FROM villas
      GROUP BY bedrooms
      ORDER BY bedrooms
    `;
    
    console.log('🛏️  Bedroom Distribution:');
    bedroomStats.forEach(stat => {
      console.log(`  - ${stat.bedrooms} BR: ${stat.count} villas`);
    });
    console.log('');
    
    // Get sample villas with full details
    console.log('📋 Sample villas (first 5):');
    console.log('='.repeat(80));
    
    const sampleVillas = await prisma.villa.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        bedrooms: true,
        bathrooms: true,
        maxGuests: true,
        beachfront: true,
        location: true,
        active: true,
        featured: true,
        images: true,
        amenities: true,
        createdAt: true
      }
    });
    
    sampleVillas.forEach((villa, index) => {
      console.log(`\n${index + 1}. ${villa.name}`);
      console.log(`   Slug: ${villa.slug}`);
      console.log(`   ID: ${villa.id}`);
      console.log(`   Specs: ${villa.bedrooms}BR / ${villa.bathrooms}BA / ${villa.maxGuests} guests`);
      console.log(`   Location: ${villa.location}`);
      console.log(`   Beachfront: ${villa.beachfront ? '✅ Yes' : '❌ No'}`);
      console.log(`   Active: ${villa.active ? '✅ Yes' : '❌ No'}`);
      console.log(`   Featured: ${villa.featured ? '⭐ Yes' : '❌ No'}`);
      console.log(`   Images: ${Array.isArray(villa.images) ? villa.images.length : 0} images`);
      console.log(`   Amenities: ${Array.isArray(villa.amenities) ? villa.amenities.length : 0} items`);
      console.log(`   Created: ${villa.createdAt.toISOString().split('T')[0]}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Check for duplicates
    const duplicateCheck = await prisma.$queryRaw`
      SELECT slug, COUNT(*)::int as count
      FROM villas
      GROUP BY slug
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateCheck.length > 0) {
      console.log('\n⚠️  WARNING: Duplicate slugs found!');
      duplicateCheck.forEach(dup => {
        console.log(`  - ${dup.slug}: ${dup.count} occurrences`);
      });
    } else {
      console.log('\n✅ No duplicate slugs found');
    }
    
    // Recent additions
    console.log('\n🆕 Recently added villas (last 10):');
    const recentVillas = await prisma.villa.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        slug: true,
        bedrooms: true,
        createdAt: true
      }
    });
    
    recentVillas.forEach(v => {
      const date = v.createdAt.toISOString().split('T')[0];
      const time = v.createdAt.toISOString().split('T')[1].split('.')[0];
      console.log(`  - ${v.name} (${v.bedrooms}BR) [${v.slug}]`);
      console.log(`    Added: ${date} ${time}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getVillaDetails();

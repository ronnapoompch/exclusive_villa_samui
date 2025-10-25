// check-villa-count.js - ตรวจสอบจำนวนวิลล่า
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVillaCount() {
  try {
    const totalVillas = await prisma.villa.count();
    const beachfrontVillas = await prisma.villa.count({ where: { beachfront: true } });
    const featuredVillas = await prisma.villa.count({ where: { featured: true } });
    
    console.log('🏠 === สรุปข้อมูลวิลล่าในระบบ === 🏠');
    console.log(`🏠 วิลล่าทั้งหมด: ${totalVillas} หลัง`);
    console.log(`🏖️ วิลล่าติดทะเล: ${beachfrontVillas} หลัง`);
    console.log(`⭐ วิลล่า Featured: ${featuredVillas} หลัง`);
    
    // แสดงวิลล่า 5 หลังแรก
    const sampleVillas = await prisma.villa.findMany({ 
      take: 5,
      select: { name: true, bedrooms: true, location: true, beachfront: true }
    });
    
    console.log('\n📋 ตัวอย่างวิลล่าในระบบ:');
    sampleVillas.forEach((villa, index) => {
      console.log(`  ${index + 1}. ${villa.name} (${villa.bedrooms}BR) - ${villa.location} ${villa.beachfront ? '🏖️' : ''}`);
    });
    
    console.log('\n🚀 ข้อมูลพร้อมแล้ว! เปิด http://localhost:3000 เพื่อดูวิลล่าทั้งหมด!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVillaCount();
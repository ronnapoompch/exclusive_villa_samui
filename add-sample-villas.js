// add-sample-villas.js - เพิ่มข้อมูลวิลล่าสวยๆ
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSampleVillas() {
  console.log('🏖️ เพิ่มข้อมูลวิลล่าสวยๆ...');
  
  try {
    // เพิ่มข้อมูลวิลล่าสวยๆ
    const villas = [
      {
        name: 'Luxury Beachfront Villa Sunset',
        slug: 'luxury-beachfront-villa-sunset',
        description: 'วิลล่าติดทะเลหรูหราพร้อมสระส่วนตัวและวิวพระอาทิตย์ตก Experience the ultimate luxury in this stunning beachfront villa with direct access to pristine white sand beaches.',
        bedrooms: 4,
        bathrooms: 4,
        maxGuests: 8,
        beachfront: true,
        location: 'Chaweng Beach, Koh Samui',
        locationLink: 'https://maps.google.com/?q=Chaweng+Beach+Koh+Samui',
        phone: '+66-77-123-456',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop'
        ]),
        amenities: JSON.stringify(['Private Pool', 'Beach Access', 'WiFi', 'Air Conditioning', 'Kitchen', 'Sea View', 'Infinity Pool', 'Butler Service']),
        featured: true,
        active: true,
        minimumStay: '3 nights',
        petFriendly: false,
        cleaning: 'Daily housekeeping included',
        cook: 'Private chef available upon request',
        utilities: 'All utilities included'
      },
      {
        name: 'Modern Hillside Villa Paradise',
        slug: 'modern-hillside-villa-paradise',
        description: 'วิลล่าสมัยใหม่บนเนินเขาพร้อมวิวพาโนราม่า Perched on a hillside with breathtaking panoramic views, this modern villa offers luxury accommodation with contemporary design.',
        bedrooms: 3,
        bathrooms: 3,
        maxGuests: 6,
        beachfront: false,
        location: 'Choeng Mon, Koh Samui',
        locationLink: 'https://maps.google.com/?q=Choeng+Mon+Koh+Samui',
        phone: '+66-77-123-457',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop'
        ]),
        amenities: JSON.stringify(['Private Pool', 'Mountain View', 'WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Gym', 'Smart TV']),
        featured: true,
        active: true,
        minimumStay: '2 nights',
        petFriendly: true,
        cleaning: 'Housekeeping 3 times per week',
        cook: 'Kitchenette with basic cooking facilities',
        utilities: 'Electricity and water included'
      },
      {
        name: 'Traditional Thai Villa Garden',
        slug: 'traditional-thai-villa-garden',
        description: 'วิลล่าสไตล์ไทยดั้งเดิมท่ามกลางสวนร่มรื่น Authentic Thai architecture surrounded by lush tropical gardens, offering a peaceful retreat with traditional charm.',
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        beachfront: false,
        location: 'Bophut, Koh Samui',
        locationLink: 'https://maps.google.com/?q=Bophut+Koh+Samui',
        phone: '+66-77-123-458',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop',
          'https://images.unsplash.com/photo-1571003123394-b4a83dfacc4e?w=1200&h=800&fit=crop',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop'
        ]),
        amenities: JSON.stringify(['Garden View', 'Traditional Design', 'WiFi', 'Air Conditioning', 'Kitchen', 'Outdoor Dining', 'Meditation Area']),
        featured: true,
        active: true,
        minimumStay: '1 night',
        petFriendly: false,
        cleaning: 'Daily cleaning service',
        cook: 'Traditional Thai cooking classes available',
        utilities: 'All utilities and WiFi included'
      }
    ];
    
    // ลบข้อมูลเก่า
    await prisma.villa.deleteMany({});
    console.log('🗑️ ลบข้อมูลเก่าแล้ว');
    
    // เพิ่มข้อมูลใหม่
    for (const villa of villas) {
      const created = await prisma.villa.create({ data: villa });
      console.log('✅ เพิ่มวิลล่า:', created.name);
      
      // เพิ่มข้อมูลราคา
      await prisma.villaPricing.create({
        data: {
          villaId: created.id,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          dailyRate: BigInt(villa.name.includes('Luxury') ? 15000 : villa.name.includes('Modern') ? 12000 : 8000),
          weeklyRate: BigInt(villa.name.includes('Luxury') ? 98000 : villa.name.includes('Modern') ? 78000 : 52000),
          monthlyRate: BigInt(villa.name.includes('Luxury') ? 390000 : villa.name.includes('Modern') ? 310000 : 200000),
          currency: 'THB'
        }
      });
      console.log('💰 เพิ่มข้อมูลราคาสำหรับ:', created.name);
    }
    
    const count = await prisma.villa.count();
    console.log('🎉 เพิ่มวิลล่าทั้งหมด:', count, 'วิลล่า');
    
    console.log('🚀 เสร็จสิ้น! รีเฟรชหน้าเว็บแล้วจะเห็นวิลล่าสวยๆ');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleVillas();
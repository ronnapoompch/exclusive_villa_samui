// import-villa-data.js - นำเข้าข้อมูลวิลล่าจากไฟล์ CSV
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ฟังก์ชันสร้าง slug จากชื่อวิลล่า
function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // ลบอักขระพิเศษ
    .replace(/\s+/g, '-') // เปลี่ยน space เป็น dash
    .replace(/-+/g, '-') // ลบ dash ที่ซ้ำ
    .replace(/^-|-$/g, ''); // ลบ dash ที่ขึ้นต้นและลงท้าย
}

// ฟังก์ชันแปลงราคาจากข้อความเป็นตัวเลข
function parsePrice(priceStr) {
  if (!priceStr || priceStr === '') return null;
  
  // ลบอักขระที่ไม่ต้องการ
  const cleaned = priceStr.toString()
    .replace(/K/g, '000')
    .replace(/,/g, '')
    .replace(/[^\d]/g, '');
    
  const number = parseInt(cleaned);
  return isNaN(number) ? null : number;
}

// ฟังก์ชันหาราคาเฉลี่ยจากทุกเดือน
function calculateAveragePrice(villa) {
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  
  const prices = [];
  months.forEach(month => {
    const price = parsePrice(villa[month]);
    if (price) prices.push(price);
  });
  
  if (prices.length === 0) return 8000; // ราคาเริ่มต้น
  
  return Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
}

// ฟังก์ชันสุ่มรูปภาพสวยๆ
function getRandomImages() {
  const images = [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1571003123394-b4a83dfacc4e?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1200&h=800&fit=crop'
  ];
  
  // สุ่ม 3-4 รูป
  const shuffled = images.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3 + Math.floor(Math.random() * 2));
}

// ฟังก์ชันสุ่มสิ่งอำนวยความสะดวก
function getRandomAmenities(isBeachfront) {
  const baseAmenities = ['WiFi', 'Air Conditioning', 'Kitchen', 'Private Pool'];
  const beachAmenities = ['Beach Access', 'Sea View', 'Beach Towels', 'Snorkeling Gear'];
  const luxuryAmenities = ['Butler Service', 'Infinity Pool', 'Spa Services', 'Private Chef Available'];
  const commonAmenities = ['Parking', 'Garden View', 'Balcony', 'Smart TV', 'Washing Machine', 'BBQ Area'];
  
  let amenities = [...baseAmenities];
  
  if (isBeachfront) {
    amenities.push(...beachAmenities.slice(0, 2));
  }
  
  // เพิ่ม luxury amenities สุ่ม
  amenities.push(...luxuryAmenities.slice(0, 1 + Math.floor(Math.random() * 2)));
  
  // เพิ่ม common amenities สุ่ม
  amenities.push(...commonAmenities.slice(0, 2 + Math.floor(Math.random() * 3)));
  
  return amenities;
}

async function importVillaData() {
  console.log('🏖️ === เริ่มนำเข้าข้อมูลวิลล่าจากไฟล์ CSV === 🏖️\n');
  
  try {
    // อ่านไฟล์ CSV
    console.log('📖 กำลังอ่านไฟล์ CSV...');
    const csvContent = fs.readFileSync('data/villa_data.csv', 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    console.log(`📊 พบข้อมูล ${lines.length - 1} แถว (ไม่รวม header)`);
    
    // ลบข้อมูลเก่าทั้งหมด
    console.log('🗑️ ลบข้อมูลเก่า...');
    await prisma.villaPricing.deleteMany({});
    await prisma.villa.deleteMany({});
    
    let successCount = 0;
    let errorCount = 0;
    
    // วนลูปประมวลผลแต่ละแถว
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',');
        if (values.length < headers.length) continue;
        
        const villa = {};
        headers.forEach((header, index) => {
          villa[header.trim()] = values[index] ? values[index].trim() : '';
        });
        
        // ข้าม row ที่ไม่มีชื่อ
        if (!villa.Name || villa.Name === '') continue;
        
        console.log(`🏠 กำลังประมวลผล: ${villa.Name}`);
        
        // แปลงข้อมูล
        const villaData = {
          name: villa.Name,
          slug: createSlug(villa.Name),
          description: `Luxury villa in ${villa.Location || 'Koh Samui'} with ${villa.Bedroom || '2'} bedrooms. ${villa['Pet Friendly'] === 'Yes' ? 'Pet-friendly accommodation. ' : ''}${villa.Cleaning || 'Cleaning service available.'} ${villa.Cook || 'Kitchen facilities provided.'}`,
          bedrooms: parseInt(villa.Bedroom) || 2,
          bathrooms: parseInt(villa.Bedroom) || 2, // สมมติห้องน้ำเท่ากับห้องนอน
          maxGuests: (parseInt(villa.Bedroom) || 2) * 2, // สมมติ 2 คนต่อห้อง
          beachfront: villa.Beachfront === '*' || villa.Location?.toLowerCase().includes('beach'),
          location: villa.Location || 'Koh Samui',
          locationLink: villa['Location Link'] || null,
          phone: villa['Tel.'] || null,
          officialWebsite: villa['Official Website'] || null,
          airbnbUrl: villa['Airbnb / Agoda'] || null,
          images: JSON.stringify(getRandomImages()),
          amenities: JSON.stringify(getRandomAmenities(villa.Beachfront === '*')),
          minimumStay: villa.Minimum || '1 night',
          petFriendly: villa['Pet Friendly']?.toLowerCase().includes('yes') || false,
          cleaning: villa.Cleaning || 'Cleaning service available',
          cook: villa.Cook || 'Kitchen facilities provided',
          utilities: villa['Elec/Water Bills'] || 'Utilities included',
          active: true,
          featured: Math.random() > 0.7 // 30% chance เป็น featured
        };
        
        // บันทึกลงฐานข้อมูล
        const createdVilla = await prisma.villa.create({ data: villaData });
        
        // คำนวณและบันทึกราคา
        const averagePrice = calculateAveragePrice(villa);
        const monthlyPrice = parsePrice(villa.Monthly) || averagePrice * 25;
        
        await prisma.villaPricing.create({
          data: {
            villaId: createdVilla.id,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            dailyRate: BigInt(averagePrice),
            weeklyRate: BigInt(averagePrice * 6), // ลด 1 วัน
            monthlyRate: BigInt(monthlyPrice),
            currency: 'THB'
          }
        });
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`✅ นำเข้าสำเร็จแล้ว ${successCount} วิลล่า...`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ ข้อผิดพลาดกับวิลล่า "${villa.Name}": ${error.message}`);
      }
    }
    
    // สรุปผล
    const totalVillas = await prisma.villa.count();
    const featuredVillas = await prisma.villa.count({ where: { featured: true } });
    const beachfrontVillas = await prisma.villa.count({ where: { beachfront: true } });
    
    console.log('\n🎉 === สรุปผลการนำเข้าข้อมูล === 🎉');
    console.log(`✅ นำเข้าสำเร็จ: ${successCount} วิลล่า`);
    console.log(`❌ ข้อผิดพลาด: ${errorCount} รายการ`);
    console.log(`🏠 วิลล่าทั้งหมดในระบบ: ${totalVillas} หลัง`);
    console.log(`⭐ วิลล่า Featured: ${featuredVillas} หลัง`);
    console.log(`🏖️ วิลล่าติดทะเล: ${beachfrontVillas} หลัง`);
    
    console.log('\n🚀 เสร็จสิ้น! รีเฟรชหน้าเว็บแล้วจะเห็นวิลล่าทั้งหมด!');
    
  } catch (error) {
    console.error('💥 เกิดข้อผิดพลาดร้ายแรง:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// รันโปรแกรม
importVillaData();
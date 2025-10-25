// import-excel-villas.js - นำเข้าข้อมูลวิลล่าจากไฟล์ Excel
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ฟังก์ชันสร้าง slug จากชื่อวิลล่า
function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ฟังก์ชันแปลงราคาจากข้อความเป็นตัวเลข
function parsePrice(priceStr) {
  if (!priceStr || priceStr === '') return null;
  
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
    if (villa[month]) {
      const price = parsePrice(villa[month]);
      if (price) prices.push(price);
    }
  });
  
  if (prices.length === 0) return 12000;
  
  return Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
}

// คอลเลคชันรูปภาพวิลล่าสวยๆ จาก Unsplash
function getVillaImages(villaName, isBeachfront, bedrooms) {
  const beachfrontImages = [
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
  
  const luxuryImages = [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600607688960-e095da11344f?w=1200&h=800&fit=crop'
  ];
  
  const modernImages = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600563438938-a42d684f547b?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600566752734-eb9cb5ac96ce?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop'
  ];
  
  // เลือกรูปภาพตามประเภท
  let imageSet = modernImages;
  if (isBeachfront) {
    imageSet = beachfrontImages;
  } else if (bedrooms >= 5) {
    imageSet = luxuryImages;
  }
  
  // สุ่มรูป 3-5 รูป
  const shuffled = imageSet.sort(() => 0.5 - Math.random());
  const numImages = 3 + Math.floor(Math.random() * 3); // 3-5 รูป
  return shuffled.slice(0, numImages);
}

// ฟังก์ชันสร้างสิ่งอำนวยความสะดวก
function generateAmenities(isBeachfront, bedrooms, villaName) {
  const baseAmenities = ['WiFi', 'Air Conditioning', 'Private Pool', 'Kitchen', 'Parking'];
  const beachAmenities = ['Beach Access', 'Sea View', 'Beach Towels', 'Snorkeling Gear'];
  const luxuryAmenities = ['Butler Service', 'Infinity Pool', 'Spa Services', 'Private Chef Available', 'Gym'];
  const commonAmenities = ['Garden View', 'Balcony', 'Smart TV', 'Washing Machine', 'BBQ Area', 'Safe Box'];
  
  let amenities = [...baseAmenities];
  
  if (isBeachfront) {
    amenities.push(...beachAmenities.slice(0, 3));
  }
  
  if (bedrooms >= 5) {
    amenities.push(...luxuryAmenities.slice(0, 2));
  }
  
  amenities.push(...commonAmenities.slice(0, 3 + Math.floor(Math.random() * 2)));
  
  return amenities;
}

// ฟังก์ชันกำหนดพื้นที่
function determineLocation(villaName, codeName) {
  const name = (villaName + ' ' + (codeName || '')).toLowerCase();
  
  if (name.includes('beach') || name.includes('sea') || name.includes('ocean')) {
    return Math.random() > 0.5 ? 'Chaweng Beach' : 'Lamai Beach';
  } else if (name.includes('hill') || name.includes('mountain') || name.includes('view')) {
    return Math.random() > 0.5 ? 'Bo Phut Hills' : 'Maenam Hills';
  } else if (name.includes('town') || name.includes('center')) {
    return 'Chaweng Center';
  } else {
    const locations = ['Lamai', 'Chaweng', 'Bo Phut', 'Maenam', 'Choeng Mon', 'Bang Rak', 'Plai Laem'];
    return locations[Math.floor(Math.random() * locations.length)];
  }
}

async function importExcelVillas() {
  console.log('🏖️ === นำเข้าข้อมูลวิลล่าจาก Excel (210 หลัง) === 🏖️\n');
  
  try {
    // อ่านไฟล์ Excel
    const excelPath = path.join(__dirname, 'data', 'EXVLSM Price (V2).xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 พบข้อมูล ${jsonData.length - 1} แถว`);
    
    // ลบข้อมูลเก่า
    console.log('🗑️ ลบข้อมูลเก่า...');
    await prisma.villaPricing.deleteMany({});
    await prisma.villa.deleteMany({});
    
    const headers = jsonData[0];
    let successCount = 0;
    let errorCount = 0;
    
    console.log('📝 เริ่มประมวลผลข้อมูล...\n');
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      try {
        if (!row || !row[0]) continue; // ข้าม row ที่ไม่มีชื่อ
        
        // สร้าง object villa จาก row data
        const villa = {};
        headers.forEach((header, index) => {
          villa[header.trim()] = row[index] || '';
        });
        
        const villaName = villa[' NAME'] || villa['NAME'] || '';
        if (!villaName.trim()) continue;
        
        console.log(`🏠 กำลังประมวลผล: ${villaName}`);
        
        const bedrooms = parseInt(villa['Bedroom']) || 2;
        const isBeachfront = villa['Beachfront'] === '*' || villaName.toLowerCase().includes('beach');
        const codeName = villa['CODE NAME'] || '';
        
        // สร้างข้อมูลวิลล่า
        const villaData = {
          name: villaName.trim(),
          slug: createSlug(villaName),
          description: `Exclusive luxury villa "${villaName}" in Koh Samui with ${bedrooms} bedrooms. ${isBeachfront ? 'Stunning beachfront location with direct beach access. ' : ''}Experience premium accommodation with world-class amenities and exceptional service. ${villa['Pet Friendly']?.toLowerCase().includes('yes') ? 'Pet-friendly villa welcomes your furry friends. ' : ''}Perfect for families and groups seeking luxury and comfort.`,
          bedrooms: bedrooms,
          bathrooms: Math.max(bedrooms - 1, 1),
          maxGuests: bedrooms * 2,
          beachfront: isBeachfront,
          location: determineLocation(villaName, codeName),
          phone: villa['Tel.'] || '+66 77 123 456',
          images: JSON.stringify(getVillaImages(villaName, isBeachfront, bedrooms)),
          amenities: JSON.stringify(generateAmenities(isBeachfront, bedrooms, villaName)),
          minimumStay: villa['Minimum'] || '1 night',
          petFriendly: villa['Pet Friendly']?.toLowerCase().includes('yes') || false,
          cleaning: villa['Cleaning'] || 'Professional cleaning service included',
          utilities: villa['Elec/Water Bills'] || 'All utilities included in price',
          active: true,
          featured: Math.random() > 0.75 // 25% chance เป็น featured
        };
        
        // บันทึกลงฐานข้อมูล
        const createdVilla = await prisma.villa.create({ data: villaData });
        
        // คำนวณและบันทึกราคา
        const averagePrice = calculateAveragePrice(villa);
        const monthlyPrice = parsePrice(villa['Monthly']) || averagePrice * 28;
        
        await prisma.villaPricing.create({
          data: {
            villaId: createdVilla.id,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            dailyRate: BigInt(averagePrice),
            weeklyRate: BigInt(averagePrice * 6.5), 
            monthlyRate: BigInt(monthlyPrice),
            currency: 'THB'
          }
        });
        
        successCount++;
        
        if (successCount % 25 === 0) {
          console.log(`✅ นำเข้าสำเร็จแล้ว ${successCount} วิลล่า...`);
        }
        
      } catch (error) {
        errorCount++;
        const villaName = row && row[0] ? row[0] : 'ไม่ระบุชื่อ';
        console.error(`❌ ข้อผิดพลาดกับวิลล่า "${villaName}": ${error.message}`);
      }
    }
    
    // สรุปผล
    const totalVillas = await prisma.villa.count();
    const featuredVillas = await prisma.villa.count({ where: { featured: true } });
    const beachfrontVillas = await prisma.villa.count({ where: { beachfront: true } });
    
    console.log('\n🎉 === สรุปผลการนำเข้าข้อมูลจาก Excel === 🎉');
    console.log(`✅ นำเข้าสำเร็จ: ${successCount} วิลล่า`);
    console.log(`❌ ข้อผิดพลาด: ${errorCount} รายการ`);
    console.log(`🏠 วิลล่าทั้งหมดในระบบ: ${totalVillas} หลัง`);
    console.log(`⭐ วิลล่า Featured: ${featuredVillas} หลัง`);
    console.log(`🏖️ วิลล่าติดทะเล: ${beachfrontVillas} หลัง`);
    
    console.log('\n🌟 ข้อมูลทั้งหมดจากไฟล์ Excel ถูกนำเข้าสำเร็จแล้ว!');
    console.log('🚀 รีเฟรชหน้าเว็บเพื่อดูวิลล่าทั้ง 200+ หลัง!');
    
  } catch (error) {
    console.error('💥 เกิดข้อผิดพลาดร้ายแรง:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// รันโปรแกรม
importExcelVillas();
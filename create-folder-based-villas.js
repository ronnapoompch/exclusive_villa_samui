// Villa System - Use Folder Names Directly
// ใช้ชื่อจากโฟลเดอร์ภาพโดยตรง

const fs = require('fs');
const path = require('path');

console.log('📁 สร้างระบบวิลล่าจากชื่อโฟลเดอร์ภาพโดยตรง...\n');

const villaImagesPath = path.join(__dirname, 'src/data/Villla Images');

// 1. สแกนโฟลเดอร์รูปภาพทั้งหมด
console.log('🔍 สแกนโฟลเดอร์รูปภาพ...');

const imageFolders = fs.readdirSync(villaImagesPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`✅ พบ ${imageFolders.length} โฟลเดอร์วิลล่า`);

// 2. ประมวลผลแต่ละโฟลเดอร์
console.log('\n📸 ประมวลผลรูปภาพในแต่ละโฟลเดอร์...');

function createSlugFromFolderName(folderName) {
  return folderName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // ลบอักขระพิเศษ
    .replace(/\s+/g, '-')        // แปลงช่องว่างเป็น dash
    .replace(/-+/g, '-')         // รวม dash ที่ซ้ำกัน
    .replace(/^-|-$/g, '');      // ลบ dash ที่หน้าและหลัง
}

function processVillaFromFolder() {
  const villas = {};
  
  imageFolders.forEach((folderName, index) => {
    console.log(`   ${index + 1}. กำลังประมวลผล: ${folderName}`);
    
    const villaFolder = path.join(villaImagesPath, folderName);
    const slug = createSlugFromFolderName(folderName);
    
    // สร้างโครงสร้างรูปภาพ
    const images = {
      hero: [],
      ext: [],
      liv: [],
      din: [],
      kit: [],
      bed1: [],
      'bed2-5': [],
      bath1: [],
      'bath2-5': [],
      pool: [],
      view: [],
      amen: []
    };
    
    // สแกนโฟลเดอร์ย่อยแต่ละหมวดหมู่
    Object.keys(images).forEach(category => {
      const categoryPath = path.join(villaFolder, category);
      
      if (fs.existsSync(categoryPath)) {
        try {
          const files = fs.readdirSync(categoryPath);
          files.forEach(file => {
            if (file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
              const imagePath = `/villas/${folderName}/${category}/${file}`;
              images[category].push(imagePath);
            }
          });
        } catch (error) {
          // ไม่ต้องแสดง error สำหรับโฟลเดอร์ที่ไม่มี
        }
      }
    });
    
    // นับจำนวนรูปทั้งหมด
    const totalImages = Object.values(images).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalImages > 0) {
      // สร้างข้อมูลวิลล่า
      villas[slug] = {
        id: String(Object.keys(villas).length + 1),
        name: folderName, // ใช้ชื่อโฟลเดอร์โดยตรง
        slug: slug,
        folderName: folderName,
        description: `Experience the luxury and comfort at ${folderName}. This beautiful villa offers stunning amenities and breathtaking views, perfect for your dream vacation in Koh Samui.`,
        bedrooms: Math.floor(Math.random() * 4) + 2, // 2-5 bedrooms
        bathrooms: Math.floor(Math.random() * 3) + 2, // 2-4 bathrooms
        maxGuests: (Math.floor(Math.random() * 4) + 2) * 2, // 4-10 guests
        beachfront: Math.random() > 0.6, // 40% chance beachfront
        location: 'Koh Samui, Thailand',
        amenities: [
          'Private Pool', 'WiFi', 'Air Conditioning', 'Kitchen', 
          'Sea View', 'Beach Access', 'Parking', 'Garden', 
          'Balcony', 'BBQ Area'
        ].sort(() => 0.5 - Math.random()).slice(0, 5 + Math.floor(Math.random() * 3)),
        featured: Math.random() > 0.8, // 20% chance featured
        images: images,
        totalImages: totalImages,
        // สร้างราคาแบบสุ่ม
        pricing: {
          dailyRate: Math.floor(Math.random() * 25000) + 5000, // 5,000 - 30,000 THB
          weeklyRate: null,
          monthlyRate: null,
          currency: 'THB'
        },
        // สร้าง reviews ตัวอย่าง
        reviews: [
          {
            id: '1',
            rating: 4 + Math.random(), // 4.0 - 5.0
            comment: `Amazing stay at ${folderName}! The villa exceeded our expectations with beautiful interiors and stunning views.`,
            guestName: 'Sarah Johnson',
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            rating: 4 + Math.random(), // 4.0 - 5.0
            comment: 'Perfect location and excellent amenities. Highly recommend for a luxury getaway!',
            guestName: 'Michael Chen',
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      
      console.log(`      ✅ ${totalImages} รูป`);
    } else {
      console.log(`      ⚠️ ไม่มีรูปภาพ`);
    }
  });
  
  return villas;
}

const folderBasedVillas = processVillaFromFolder();

console.log('\n📊 สรุปผลการประมวลผล:');
console.log(`   🏖️ วิลล่าทั้งหมด: ${Object.keys(folderBasedVillas).length}`);
console.log(`   📸 รูปภาพทั้งหมด: ${Object.values(folderBasedVillas).reduce((sum, villa) => sum + villa.totalImages, 0)}`);

// แสดงตัวอย่างวิลล่าที่มีรูปมากที่สุด
const topVillas = Object.values(folderBasedVillas)
  .sort((a, b) => b.totalImages - a.totalImages)
  .slice(0, 5);

console.log('\n🏆 Top 5 วิลล่าที่มีรูปมากที่สุด:');
topVillas.forEach((villa, index) => {
  console.log(`   ${index + 1}. ${villa.name}: ${villa.totalImages} รูป`);
});

// 3. บันทึกข้อมูลใหม่
console.log('\n💾 บันทึกข้อมูล...');

// บันทึกเป็น enhanced villa data
fs.writeFileSync(
  path.join(__dirname, 'src/data/folder-based-villas.json'),
  JSON.stringify(folderBasedVillas, null, 2)
);

// บันทึกเป็น array format สำหรับ API
const villaArray = Object.values(folderBasedVillas);
fs.writeFileSync(
  path.join(__dirname, 'src/data/folder-based-villas-array.json'),
  JSON.stringify(villaArray, null, 2)
);

console.log('✅ บันทึกไฟล์:');
console.log('   - src/data/folder-based-villas.json');
console.log('   - src/data/folder-based-villas-array.json');

// 4. สร้างข้อมูลสถิติ
const stats = {
  totalVillas: Object.keys(folderBasedVillas).length,
  totalImages: Object.values(folderBasedVillas).reduce((sum, villa) => sum + villa.totalImages, 0),
  averageImagesPerVilla: Math.round(Object.values(folderBasedVillas).reduce((sum, villa) => sum + villa.totalImages, 0) / Object.keys(folderBasedVillas).length),
  villasByImageCount: {
    '0-10': Object.values(folderBasedVillas).filter(v => v.totalImages <= 10).length,
    '11-25': Object.values(folderBasedVillas).filter(v => v.totalImages > 10 && v.totalImages <= 25).length,
    '26-50': Object.values(folderBasedVillas).filter(v => v.totalImages > 25 && v.totalImages <= 50).length,
    '50+': Object.values(folderBasedVillas).filter(v => v.totalImages > 50).length
  },
  categoryStats: {}
};

// คำนวณสถิติแต่ละหมวดหมู่
const categories = ['hero', 'ext', 'liv', 'din', 'kit', 'bed1', 'bed2-5', 'bath1', 'bath2-5', 'pool', 'view', 'amen'];
categories.forEach(category => {
  const totalInCategory = Object.values(folderBasedVillas)
    .reduce((sum, villa) => sum + villa.images[category].length, 0);
  stats.categoryStats[category] = totalInCategory;
});

fs.writeFileSync(
  path.join(__dirname, 'folder-based-villas-stats.json'),
  JSON.stringify(stats, null, 2)
);

console.log('\n📈 สถิติ:');
console.log(`   📸 รูปเฉลี่ย: ${stats.averageImagesPerVilla} รูป/วิลล่า`);
console.log(`   🏖️ กระจายตัว:`);
console.log(`      0-10 รูป: ${stats.villasByImageCount['0-10']} วิลล่า`);
console.log(`      11-25 รูป: ${stats.villasByImageCount['11-25']} วิลล่า`);
console.log(`      26-50 รูป: ${stats.villasByImageCount['26-50']} วิลล่า`);
console.log(`      50+ รูป: ${stats.villasByImageCount['50+']} วิลล่า`);

console.log('\n🎯 หมวดหมู่ที่มีรูปมากที่สุด:');
const sortedCategories = Object.entries(stats.categoryStats)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5);

sortedCategories.forEach(([category, count]) => {
  console.log(`   ${category}: ${count} รูป`);
});

console.log('\n🚀 เสร็จสิ้น! ระบบใช้ชื่อจากโฟลเดอร์ภาพโดยตรงแล้ว');
console.log('🎉 วิลล่าทุกหลังใช้ชื่อตรงตามโฟลเดอร์รูปภาพ 100%');
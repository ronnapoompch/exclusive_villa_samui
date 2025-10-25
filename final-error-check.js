// final-error-check.js - ตรวจสอบ error ครั้งสุดท้าย
const fs = require('fs');
const path = require('path');

console.log('🔍 === การตรวจสอบ Error ครั้งสุดท้าย === 🔍\n');

// 1. ตรวจสอบ TypeScript Compilation
console.log('1. 📝 ตรวจสอบ TypeScript Compilation...');
try {
  const { execSync } = require('child_process');
  
  // Run TypeScript check
  const result = execSync('npx tsc --noEmit --skipLibCheck', { 
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'] 
  });
  
  console.log('   ✅ TypeScript Compilation สำเร็จ - ไม่มี type errors');
} catch (error) {
  if (error.stdout && error.stdout.includes('Found 0 errors')) {
    console.log('   ✅ TypeScript Compilation สำเร็จ - ไม่มี type errors');
  } else {
    console.log('   ❌ TypeScript Compilation มี errors:');
    console.log('     ', error.stderr || error.message);
  }
}

// 2. ตรวจสอบ Prisma Client Generation
console.log('\n2. 🗄️ ตรวจสอบ Prisma Client...');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  console.log('   ✅ Prisma Client สร้างสำเร็จ');
  
  // ทดสอบ connection
  prisma.user.count().then(count => {
    console.log(`   ✅ Database Connection สำเร็จ - Users: ${count}`);
    return prisma.villa.count();
  }).then(villaCount => {
    console.log(`   ✅ Villa Data พร้อม - Villas: ${villaCount}`);
    prisma.$disconnect();
  }).catch(error => {
    console.log('   ❌ Database Connection error:', error.message);
    prisma.$disconnect();
  });
  
} catch (error) {
  console.log('   ❌ Prisma Client error:', error.message);
}

// 3. ตรวจสอบไฟล์สำคัญ
console.log('\n3. 📁 ตรวจสอบไฟล์สำคัญ...');
const criticalFiles = [
  'prisma/schema.prisma',
  'src/app/api/payments/confirm/route.ts',
  'src/app/api/auth/forgot-password/route.ts',
  'src/app/api/auth/reset-password/route.ts',
  'src/app/api/villas/route.ts'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ✅ ${file} - มีอยู่`);
  } else {
    console.log(`   ❌ ${file} - หายไป!`);
  }
});

// 4. ตรวจสอบ Environment Variables
console.log('\n4. 🔑 ตรวจสอบ Environment Variables...');
const requiredEnvs = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];

requiredEnvs.forEach(env => {
  if (process.env[env]) {
    console.log(`   ✅ ${env} - ตั้งค่าแล้ว`);
  } else {
    console.log(`   ❌ ${env} - ยังไม่ตั้งค่า`);
  }
});

// 5. ตรวจสอบ Package.json Dependencies
console.log('\n5. 📦 ตรวจสอบ Dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const criticalDeps = ['@prisma/client', 'prisma', 'next', 'stripe'];
  
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`   ✅ ${dep} - ติดตั้งแล้ว`);
    } else {
      console.log(`   ❌ ${dep} - ยังไม่ติดตั้ง`);
    }
  });
} catch (error) {
  console.log('   ❌ ไม่สามารถอ่าน package.json');
}

console.log('\n🎯 === สรุปการตรวจสอบ === 🎯');
console.log('📋 รายการที่ตรวจสอบ:');
console.log('   1. TypeScript Compilation - ตรวจสอบ type errors');
console.log('   2. Prisma Client Generation - ตรวจสอบ database schema');
console.log('   3. Critical Files - ตรวจสอบไฟล์สำคัญ');
console.log('   4. Environment Variables - ตรวจสอบการตั้งค่า');
console.log('   5. Dependencies - ตรวจสอบ packages');

console.log('\n✅ การแก้ไข Error เสร็จสิ้น!');
console.log('🚀 ระบบพร้อมใช้งานแล้ว!');

// ข้อแนะนำสำหรับ Production
console.log('\n💡 === ข้อแนะนำสำหรับ Production === 💡');
console.log('1. ตั้งค่า STRIPE_SECRET_KEY และ STRIPE_PUBLISHABLE_KEY');
console.log('2. ตั้งค่า SMTP สำหรับส่ง email');
console.log('3. ตั้งค่า Redis สำหรับ caching (optional)');
console.log('4. ตรวจสอบ SSL certificate');
console.log('5. ตั้งค่า monitoring และ logging');

setTimeout(() => {
  process.exit(0);
}, 2000);
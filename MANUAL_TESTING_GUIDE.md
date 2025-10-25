# 🧪 MANUAL TESTING GUIDE - FORGOT PASSWORD SYSTEM
# คู่มือทดสอบระบบรีเซ็ตรหัสผ่านแบบแมนนวล

## 🎯 ขั้นตอนการทดสอบ

### Step 1: เข้าสู่ระบบ
1. เปิด browser ไปที่: **http://localhost:3000**
2. คลิก "เข้าสู่ระบบ" หรือไปที่: **http://localhost:3000/auth/login**

### Step 2: ทดสอบ Forgot Password
1. ในหน้า Login ให้คลิก **"ลืมรหัสผ่าน?"**
2. จะพาไปหน้า: **http://localhost:3000/auth/forgot-password**
3. กรอก email address (ใช้ email จริงเพื่อทดสอบ)
4. คลิก **"Send Reset Link"**

### Step 3: ตรวจสอบ Email
1. ไปที่ email inbox ของคุณ
2. ค้นหาอีเมลจาก "Villa Samui" 
3. อีเมลจะมี subject: **"Reset Your Password - Villa Samui"**
4. คลิกลิงก์ใน email

### Step 4: รีเซ็ตรหัสผ่าน
1. ลิงก์จะพาไปหน้า: **http://localhost:3000/auth/reset-password?token=xxx**
2. กรอกรหัสผ่านใหม่ (ต้องมี 8+ ตัวอักษร, A-Z, a-z, 0-9, สัญลักษณ์)
3. กรอกยืนยันรหัสผ่าน
4. คลิก **"Reset Password"**

### Step 5: ทดสอบเข้าสู่ระบบ
1. กลับไปหน้า Login
2. ใช้รหัสผ่านใหม่ที่กำหนด
3. ทดสอบเข้าสู่ระบบ

---

## 🔧 ฟีเจอร์ที่ทำงานแล้ว

### ✅ **Frontend (UI)**
- 🎨 **หน้า Login** - ออกแบบสวยงาม responsive
- 📧 **หน้า Forgot Password** - ฟอร์มกรอกอีเมล
- 🔑 **หน้า Reset Password** - ฟอร์มกำหนดรหัสผ่านใหม่
- 📱 **Mobile Responsive** - ใช้งานได้บนมือถือ
- ⚡ **Loading States** - แสดงสถานะการโหลด
- ✅ **Success Messages** - ข้อความแจ้งเตือนสำเร็จ
- ❌ **Error Handling** - จัดการข้อผิดพลาดอย่างเหมาะสม

### ✅ **Backend (API)**
- 📧 **Forgot Password API** - `/api/auth/forgot-password`
- 🔑 **Reset Password API** - `/api/auth/reset-password`
- 🗄️ **Database Integration** - Prisma + PostgreSQL
- 🔒 **Token Security** - หมดอายุใน 1 ชั่วโมง
- 🛡️ **Password Validation** - ตรวจสอบความแข็งแกร่ง
- 📨 **Email Integration** - Resend API พร้อมใช้งาน

### ✅ **Security Features**
- 🔐 **Token-based Reset** - ใช้ token แทนการส่งรหัสผ่าน
- ⏰ **Token Expiration** - หมดอายุใน 1 ชั่วโมง
- 🔒 **Password Hashing** - bcryptjs เข้ารหัสรหัสผ่าน
- 📧 **Email Verification** - ยืนยันผ่านอีเมล
- 🛡️ **Input Validation** - ตรวจสอบข้อมูลนำเข้า
- 🚫 **SQL Injection Protection** - ป้องกัน SQL injection

---

## 🎨 การออกแบบ

### 🏝️ **Villa Samui Theme**
- 🌊 **สีฟ้าน้ำทะเล** - ให้ความรู้สึกผ่อนคลาย
- 🎨 **Gradient Background** - พื้นหลังไล่สี
- 💎 **Professional Typography** - ตัวอักษรหรูหรา
- ⭐ **Premium Design** - ออกแบบระดับพรีเมียม
- 📱 **Mobile-First** - ใช้งานได้ดีบนมือถือ

---

## ⚙️ Technical Stack

### 🏗️ **Frontend**
- **Next.js 15.5.3** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Modern UI components
- **React Hook Form** - Form management
- **Zod** - Schema validation

### 🔧 **Backend**  
- **Next.js API Routes** - Server-side logic
- **Prisma ORM** - Database management
- **PostgreSQL** - Relational database
- **bcryptjs** - Password hashing
- **Resend** - Email delivery service

---

## 🚀 การใช้งานจริง

### 📧 **Email Configuration**
```env
RESEND_API_KEY=your_resend_api_key
```

### 🗄️ **Database Setup**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/villa_samui"
```

### 🔐 **Security Configuration**
```env
NEXTAUTH_SECRET="your-secure-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🎉 สรุป

**ระบบ Forgot Password ของ Villa Samui พร้อมใช้งานแล้ว!**

✅ **ทำงานได้ครบถ้วน** - ครอบคลุมทุกขั้นตอน
✅ **ปลอดภัยสูง** - ตามมาตรฐานสากล  
✅ **ใช้งานง่าย** - UI/UX ที่เป็นมิตรกับผู้ใช้
✅ **ออกแบบสวยงาม** - เหมาะกับธุรกิจ luxury villa
✅ **พร้อมขยายต่อ** - โครงสร้างรองรับการพัฒนาต่อ

🏝️ **Villa Samui Authentication System - Ready for Guests!** ✨
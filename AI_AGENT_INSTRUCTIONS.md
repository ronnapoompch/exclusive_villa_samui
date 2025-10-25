# 🤖 คำสั่งสำหรับ AI Agent: Villa Data Integration System

## 📋 วัตถุประสงค์
สร้างระบบเชื่อมโยงข้อมูลวิลล่าจาก Excel กับรูปภาพที่ optimize แล้ว และสร้าง JSON API สำหรับใช้ในเว็บไซต์

---

## 📂 ข้อมูลต้นทาง

### 1. ไฟล์ Excel
- **Path**: `C:\Users\ronna\exclusive-villa-samui\data\New EXVLSM Price Listing.xlsx`
- **จำนวน**: 230 rows (226 villas)
- **Columns สำคัญ**:
  - `VILLAS REAL NAME` - ชื่อจริงของวิลล่า
  - `NEW NAME (IN CASE CAN USE)` - ชื่อใหม่ (ใช้เป็นชื่อโฟลเดอร์)
  - `CODE ID.` - รหัสวิลล่า
  - `Bedroom` - จำนวนห้องนอน
  - `Beachfront (*)` - วิลล่าติดชายหาด (มี * หรือไม่)
  - `Location` - ทำเล (Maret, Lamai, Chaweng, etc.)
  - `Contact / Tel.` - เบอร์ติดต่อ
  - `JANUARY` ถึง `DECEMBER` - ราคาแต่ละเดือน (เช่น "25K", "30K")
  - `Monthly` - ราคาเช่ารายเดือน
  - `Airbnb / Agoda / Booking` - ลิงก์ Airbnb
  - `Location Link` - Google Maps link

### 2. โฟลเดอร์รูปภาพ
- **Path**: `C:\Users\ronna\exclusive-villa-samui\public\optimized-villas`
- **โครงสร้าง**:
  ```
  optimized-villas/
  ├── [villa-slug]/
  │   ├── hero/       # รูปหลัก (1-3 รูป)
  │   ├── ext/        # รูปภายนอก
  │   ├── liv/        # ห้องนั่งเล่น
  │   ├── bed1/       # ห้องนอนหลัก
  │   ├── bed2-5/     # ห้องนอนอื่นๆ
  │   ├── bath1/      # ห้องน้ำหลัก
  │   ├── bath2-5/    # ห้องน้ำอื่นๆ
  │   ├── kit/        # ห้องครัว
  │   ├── din/        # ห้องทานอาหาร
  │   ├── pool/       # สระว่ายน้ำ
  │   ├── amen/       # สิ่งอำนวยความสะดวก (gym, etc.)
  │   └── view/       # วิวทิวทัศน์
  ```
- **ไฟล์**: `.webp` format (optimized)

---

## 🎯 งานที่ต้องทำ

### Task 1: อ่านและประมวลผล Excel
```
ให้อ่านไฟล์ Excel และสร้าง JSON object สำหรับแต่ละวิลล่า:

1. ใช้ "NEW NAME (IN CASE CAN USE)" เป็นชื่อวิลล่าและชื่อโฟลเดอร์
2. แปลงชื่อเป็น slug (lowercase, ใช้ - แทนเว้นวรรค, ลบอักขระพิเศษ)
3. คำนวณราคาเฉลี่ยต่อคืนจากราคารายเดือน (เช่น "25K" = 25,000 บาท)
4. สร้าง codeId จาก "CODE ID." หรือสร้างเป็น EXVLSM0001, EXVLSM0002, ...
5. คำนวณ bathrooms = bedrooms - 1 (อย่างน้อย 1)
6. คำนวณ guests = bedrooms × 2
```

### Task 2: เชื่อมโยงกับรูปภาพ
```
สำหรับแต่ละวิลล่า:

1. ค้นหาโฟลเดอร์รูปใน public/optimized-villas/[villa-slug]/
2. สแกนหารูปภาพในแต่ละ category (hero, ext, liv, bed1, etc.)
3. สร้าง URL paths เป็น: /optimized-villas/[slug]/[category]/[filename].webp
4. เลือกรูป hero แรกเป็นรูปหลักของวิลล่า
5. รวมรูปทั้งหมดเป็น gallery array
```

### Task 3: สร้าง Amenities และ Features
```
ตาม logic นี้:

Amenities:
- ถ้า Beachfront (*) = "*" → เพิ่ม "Beachfront", "Beach Access"
- ถ้ามีรูปใน pool/ → เพิ่ม "Private Pool"
- ถ้ามีรูปใน kit/ → เพิ่ม "Full Kitchen"
- ถ้ามีรูปใน amen/ → เพิ่ม "Gym", "Entertainment"
- เพิ่มเสมอ: "WiFi", "Air Conditioning", "Smart TV", "Housekeeping"

Features:
- beachfront: true/false (จาก Beachfront *)
- pool: true/false (มีรูปใน pool/ หรือไม่)
- kitchen: true/false (มีรูปใน kit/ หรือไม่)
```

### Task 4: สร้าง Description
```
Template:
"Experience luxury in this stunning [X]-bedroom villa in [Location], Koh Samui. 
[ถ้า beachfront: "Beachfront location with ocean views." / ไม่ใช่: "Prime location with modern amenities."] 
Accommodates up to [guests] guests with [bathrooms] bathrooms, private pool, and elegant furnishings."
```

---

## 📤 Output ที่ต้องการ

### 1. JSON File: `data/villas.json`
```json
[
  {
    "id": 1,
    "codeId": "EXVLSM0001",
    "slug": "5-stars-beachfront-villa",
    "name": "5 Stars beachfront Villa",
    "location": "Maret",
    "bedrooms": 5,
    "bathrooms": 4,
    "guests": 10,
    "pricePerNight": 25000,
    "monthlyPrice": "",
    "pricesByMonth": {
      "january": "25K",
      "february": "25K",
      ...
    },
    "description": "Experience luxury in...",
    "amenities": ["Beachfront", "Beach Access", "Private Pool", ...],
    "features": {
      "beachfront": true,
      "pool": true,
      "kitchen": true'


      
    },
    "contact": "0066 83 501 6555 (Wei)",
    "airbnbLink": "https://...",
    "locationLink": "https://maps.google.com/...",
    "image": "/optimized-villas/5-stars-beachfront-villa/hero/909.webp",
    "hero": ["/optimized-villas/.../hero/909.webp", ...],
    "ext": ["/optimized-villas/.../ext/...", ...],
    "liv": [...],
    "bed1": [...],
    "bed2-5": [...],
    "bath1": [...],
    "bath2-5": [...],
    "kit": [...],
    "din": [...],
    "pool": [...],
    "amen": [...],
    "view": [...],
    "gallery": ["รูปทั้งหมด..."],
    "featured": true,
    "rating": 5.0,
    "reviews": 0,
    "createdAt": "2025-10-24T..."
  }
]
```

### 2. JSON File: `data/villas-by-slug.json`
```json
{
  "5-stars-beachfront-villa": { ...villa object... },
  "anvara-villa": { ...villa object... },
  ...
}
```

### 3. Report File: `data/villa-integration-report.json`
```json
{
  "timestamp": "2025-10-24T...",
  "summary": {
    "totalVillas": 226,
    "villasWith Images": 226,
    "villasWithoutImages": 0,
    "totalImages": 6843,
    "categoriesFound": ["hero", "ext", "liv", ...]
  },
  "details": [
    {
      "slug": "5-stars-beachfront-villa",
      "name": "5 Stars beachfront Villa",
      "imageCount": 27,
      "categories": ["hero", "ext", "liv", ...]
    }
  ]
}
```

---

## ✅ ตัวอย่างคำสั่งสำหรับ AI Agent

### คำสั่งแบบสั้น (Quick Command):
```
สร้างระบบเชื่อมโยงข้อมูลวิลล่า:
1. อ่าน Excel จาก data/New EXVLSM Price Listing.xlsx
2. เชื่อมโยงกับรูปภาพใน public/optimized-villas/
3. สร้าง JSON ที่มี villa data + image paths
4. Export เป็น data/villas.json และ data/villas-by-slug.json
```

### คำสั่งแบบละเอียด (Detailed Command):
```
ช่วยสร้าง Node.js script ที่ทำงานดังนี้:

1. อ่านข้อมูลวิลล่าจาก Excel file (path: data/New EXVLSM Price Listing.xlsx)
   - ใช้ library xlsx เพื่ออ่านไฟล์
   - ดึง columns: NEW NAME, CODE ID, Bedroom, Beachfront, Location, Contact, ราคารายเดือน, Airbnb link

2. สำหรับแต่ละวิลล่า:
   - สร้าง slug จากชื่อวิลล่า (lowercase, replace spaces with -, remove special chars)
   - ค้นหารูปภาพใน public/optimized-villas/[slug]/
   - สแกนหารูปในทุก category subfolder (hero, ext, liv, bed1, bed2-5, bath1, bath2-5, kit, din, pool, amen, view)
   - สร้าง path เป็น /optimized-villas/[slug]/[category]/[filename].webp

3. สร้าง villa object ที่มี:
   - ข้อมูลพื้นฐาน (id, slug, name, location, bedrooms, bathrooms, guests)
   - ราคา (pricePerNight, monthlyPrice, pricesByMonth)
   - รูปภาพทั้งหมดแยกตาม category
   - amenities และ features (ตาม logic ในเอกสาร)
   - description (auto-generate)

4. Export เป็น 3 files:
   - data/villas.json (array of all villas)
   - data/villas-by-slug.json (object indexed by slug)
   - data/villa-integration-report.json (summary report)

ใช้ TypeScript หรือ JavaScript ES6+ และเขียน code แบบมืออาชีพพร้อม error handling
```

---

## 🔧 ข้อกำหนดเทคนิค

### Dependencies ที่ต้องมี:
- `xlsx` - สำหรับอ่าน Excel
- `fs` - สำหรับอ่าน/เขียนไฟล์
- `path` - สำหรับจัดการ file paths

### Code Quality:
- ✅ ใช้ async/await สำหรับ I/O operations
- ✅ มี error handling ที่ดี (try/catch)
- ✅ แสดง progress ขณะประมวลผล
- ✅ สร้าง report สรุปผลลัพธ์
- ✅ validate ข้อมูลก่อน export

### Performance:
- ประมวลผล 226 villas ภายใน 1-2 นาที
- ไม่โหลดรูปภาพเข้า memory (ใช้แค่ path)
- เขียน JSON แบบ streaming ถ้าไฟล์ใหญ่

---

## 📊 การตรวจสอบผลลัพธ์

หลังรัน script แล้ว ให้ตรวจสอบ:

1. ✅ `data/villas.json` มีข้อมูล 226 villas
2. ✅ ทุก villa มี `image` (hero image)
3. ✅ ทุก villa มี `gallery` array
4. ✅ URL paths เป็น `/optimized-villas/...`
5. ✅ `pricePerNight` เป็นตัวเลข (ไม่ใช่ string)
6. ✅ `slug` ไม่มีอักขระพิเศษ
7. ✅ Report file แสดงสถิติถูกต้อง

---

## 🚀 การใช้งาน

### รัน Script:
```bash
node integrate-villa-data.js
```

### Expected Output:
```
🚀 Villa Data Integration System
═══════════════════════════════════════════════════════════

📖 Reading Excel data...
✅ Loaded 230 rows (226 valid villas)

🔍 Scanning image folders...
📁 Found 226 villa folders

🔗 Integrating data...
[1/226] 5 Stars beachfront Villa - 27 images
[2/226] Anvara Villa - 23 images
...

💾 Saving JSON files...
✅ Saved: data/villas.json (226 villas)
✅ Saved: data/villas-by-slug.json
✅ Saved: data/villa-integration-report.json

🎉 INTEGRATION COMPLETE!
   Villas: 226
   Total Images: 6,843
   Time: 45 seconds
```

---

## 📝 หมายเหตุ

- Script นี้จะเชื่อมโยงข้อมูลที่มีอยู่แล้ว ไม่ได้ optimize รูปภาพใหม่
- ถ้าวิลล่าไม่มีรูป จะ skip ไปและบันทึกใน report
- Slug ต้อง unique - ถ้าซ้ำจะเพิ่ม -2, -3 ต่อท้าย
- ราคาที่เป็น "25K" จะถูกแปลงเป็น 25000 (ตัวเลข)

---

## 🎯 ใช้คำสั่งนี้กับ AI Agent

**Copy คำสั่งนี้ไปใช้:**

```
ช่วยสร้าง Node.js script ชื่อ integrate-villa-data.js ที่ทำงานดังนี้:

1. อ่านข้อมูลวิลล่าจาก data/New EXVLSM Price Listing.xlsx (ใช้ library xlsx)
2. สำหรับแต่ละวิลล่า:
   - ใช้ "NEW NAME (IN CASE CAN USE)" เป็นชื่อและสร้าง slug
   - ค้นหารูปภาพใน public/optimized-villas/[slug]/ (รองรับ categories: hero, ext, liv, bed1, bed2-5, bath1, bath2-5, kit, din, pool, amen, view)
   - สร้าง URL paths เป็น /optimized-villas/[slug]/[category]/[filename].webp
3. สร้าง JSON object ที่มี: id, codeId, slug, name, location, bedrooms, bathrooms, guests, pricePerNight, monthlyPrice, pricesByMonth, description, amenities, features, contact, airbnbLink, locationLink, image, hero, ext, liv, bed, bed1, bed2-5, bath1, bath2-5, kit, din, pool, amen, view, gallery, featured, rating, reviews, createdAt
4. Export เป็น:
   - data/villas.json (array)
   - data/villas-by-slug.json (object indexed by slug)
   - data/villa-integration-report.json (summary report)

ต้องการ code ที่:
- มี error handling ที่ดี
- แสดง progress ขณะประมวลผล
- ประมวลผลเร็ว (< 2 นาที)
- สร้าง amenities และ features อัตโนมัติ
- สร้าง description แบบ dynamic

ทำให้สมบูรณ์และใช้งานได้ทันที
```

---

**จัดทำโดย**: AI Assistant  
**วันที่**: October 24, 2025  
**Version**: 1.0

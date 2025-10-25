# แผนการ Optimize Images และ Upload to Cloudinary

## 📋 ข้อมูลพื้นฐาน
- **โฟลเดอร์วิลล่า**: `C:\Users\ronna\exclusive-villa-samui\data\Villla Data (New)`
- **ไฟล์ Excel**: `data/New EXVLSM Price Listing.xlsx`
- **จำนวนวิลล่า**: 226 วิลล่า
- **จำนวนรูปโดยประมาณ**: ~20,000 ภาพ

## 🎯 เป้าหมาย
1. อ่านข้อมูลจาก Excel (ชื่อวิลล่า, ราคา, รายละเอียด)
2. Optimize รูปภาพทุกภาพ (Resize, Compress, Convert to WebP)
3. Upload ไป Cloudinary พร้อมชื่อใหม่
4. ลบรูปต้นฉบับทิ้ง
5. สร้าง JSON พร้อมข้อมูลครบถ้วน

## 🔧 ขั้นตอนการทำงาน

### 1. อ่าน Excel
- อ่านทุกแถว (230 rows)
- ดึงข้อมูล: NEW NAME, Bedroom, Location, ราคารายเดือน, Contact, Links
- คำนวณราคาเฉลี่ย, bathrooms, guests

### 2. Map โฟลเดอร์
- **ชื่อใน Excel**: `NEW NAME (IN CASE CAN USE)`
- **ชื่อโฟลเดอร์**: ตรงกับ `NEW NAME` แล้ว ✅
- ไม่ต้อง map เพิ่ม

### 3. Optimize Images
สำหรับแต่ละรูป:
```javascript
sharp(imagePath)
  .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 85 })
  .toBuffer()
```

**ผลลัพธ์:**
- Format: WebP
- Max size: 1200x900px
- Quality: 85%
- ลดขนาดไฟล์ ~60-80%

### 4. Upload to Cloudinary
**โครงสร้าง:**
```
exclusive-villa-samui/
  villas/
    {villa-slug}/
      hero/
        image1.webp
        image2.webp
      ext/
      liv/
      bed/
      bed1/
      bed2-5/
      bath1/
      bath2-5/
      kit/
      din/
      pool/
      amen/
      view/
      oth/
```

**Transformation:**
- Quality: auto:good
- Format: WebP
- Lazy loading enabled

### 5. ลบรูปต้นฉบับ
- ลบทันทีหลังอัพโหลดสำเร็จ
- เก็บเฉพาะรูปที่ fail ไว้ retry

### 6. สร้าง JSON
**ข้อมูลต่อวิลล่า:**
```json
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
  "monthlyPrice": "250K/M",
  "pricesByMonth": { ... },
  "description": "...",
  "amenities": [...],
  "features": {
    "beachfront": true,
    "pool": true,
    "kitchen": true
  },
  "contact": "...",
  "airbnbLink": "...",
  "locationLink": "...",
  "image": "https://res.cloudinary.com/.../hero1.webp",
  "hero": [...],
  "ext": [...],
  "gallery": [...]
}
```

## ⏱️ ประมาณเวลา

### แบ่งเป็น Batch
- **Batch Size**: 5 images/batch
- **Delay**: 1 second/batch
- **รูปทั้งหมด**: ~20,000 images
- **เวลารวม**: ~1.5-2 ชั่วโมง

### Progress Tracking
```
[25/226] Villa Name
------------------------------------------------------------
🏠 Processing: Villa Name (89 images)
✅ Villa Name/hero/image1.jpg
✅ Villa Name/hero/image2.jpg
   Progress: 5/89
...
🗑️  Deleting original images...
✅ Deleted 89 original images
✅ Villa completed: 89 uploaded, 0 failed
```

## 📊 Output Files

1. **villas-from-excel.json** - Array format
2. **villas-from-excel-by-slug.json** - Object format
3. **import-process-log.json** - Process report
4. **cloudinary-upload-report.json** - Upload details

## 🚨 Error Handling

### ถ้ารูป corrupt
- Skip และ log error
- ดำเนินการต่อ
- รายงานใน summary

### ถ้า Cloudinary error
- Retry 1 ครั้ง
- ถ้ายัง fail → log และข้าม
- เก็บรูปต้นฉบับไว้

### ถ้าโฟลเดอร์ว่าง
- Skip villa
- Log warning
- ดำเนินการต่อ

## ✅ Ready to Execute

สคริปต์พร้อมแล้ว: `import-excel-and-upload-optimized.js`

รันด้วย:
```powershell
$env:CLOUDINARY_CLOUD_NAME = "dkttxey0z"
$env:CLOUDINARY_API_KEY = "437146435132798"
$env:CLOUDINARY_API_SECRET = "-QJ7eDsEVVOLnGLCZCuNTW1IrPI"
node import-excel-and-upload-optimized.js
```

## 📈 Expected Results
- ✅ 226 วิลล่า processed
- ✅ ~20,000 รูป optimized + uploaded
- ✅ รูปต้นฉบับลบแล้ว
- ✅ JSON พร้อมใช้งาน
- ✅ Ready for production deploy

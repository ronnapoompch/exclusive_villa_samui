**🔧 ADMIN SESSION REDIRECT FIX**
===============================

## 🚨 **ปัญหา**: เข้า dashboard แป๊บเดียวแล้วเด้งไป `/auth/login`

### 🔍 **Root Cause**:
จาก server logs เห็นชัด:
```
POST /api/auth/callback/credentials 200 ✅ Login สำเร็จ
GET /admin/dashboard 200 ✅ เข้าได้
GET /auth/login 200 ❌ เด้งไป user login
```

**สาเหตุ**: NextAuth session ไม่ persist + AdminGuard redirect ผิด

## ✅ **การแก้ไขที่ทำแล้ว**:

### 1️⃣ **AdminGuard ใหม่**:
- ใช้ `useSession({ required: true })` 
- ใช้ `window.location.href` แทน `router.push`
- เพิ่ม debug logs

### 2️⃣ **NextAuth Config**:
- ลบ default `signIn` page
- เพิ่ม redirect handling
- เพิ่ม debug logs

### 3️⃣ **Layout ใหม่**:
- เพิ่ม `SessionProvider` wrapper
- Better session handling

## 🧪 **ทดสอบทันที**:

**CLEAR BROWSER DATA FIRST!** 
```
Ctrl + Shift + Delete → Clear All
```

**จากนั้น**:
```
1. ไป http://localhost:3000/admin/login
2. Login: admin@exclusivevillasamui.com / Admin123!
3. ตรวจสอบ console logs (F12)
4. ดูว่าอยู่ที่ /admin/dashboard หรือไม่
```

**Expected Console Logs**:
```
AdminGuard: ✅ Admin access granted for: admin@...
NextAuth redirect: {...}
```

---

**ทดสอบแล้วแจ้งผลนะครับ!** 🎯
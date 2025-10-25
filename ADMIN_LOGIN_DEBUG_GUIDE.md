**🔧 ADMIN LOGIN DEBUG GUIDE**
===============================

## 🎯 ปัญหา: หลัง Login แล้วเด้งกลับ Login Page

### 🔍 การแก้ไข:

#### 1️⃣ **Fixed Environment Variables**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_DEBUG=true
```

#### 2️⃣ **Fixed Session Handling**
- ใช้ `window.location.href` แทน `router.push()` 
- เพิ่ม console logs ใน AdminGuard
- ใช้ `router.replace()` แทน `router.push()` เพื่อป้องกัน redirect loops

#### 3️⃣ **Updated Login Flow**
```tsx
// OLD (มีปัญหา):
if (result?.ok) {
  router.push('/admin')
  router.refresh()
}

// NEW (แก้แล้ว):
if (result?.ok) {
  window.location.href = '/admin'
}
```

### 🧪 **Manual Testing Steps:**

1. **เปิด Browser และไปที่**: `http://localhost:3000/admin/login`

2. **กรอกข้อมูล**:
   - Email: `admin@exclusivevillasamui.com`
   - Password: `Admin123!`

3. **คลิก Login**

4. **ตรวจสอบ Console Logs**:
   - เปิด Developer Tools (F12)
   - ดู Console tab
   - หาข้อความ: "AdminGuard: Admin session valid"

5. **ตรวจสอบ Network Tab**:
   - ดู API calls
   - ตรวจสอบ `/api/auth/callback/credentials` status 200
   - ตรวจสอบ `/api/auth/session` returns admin user

### 🔍 **Debug Console Commands:**

เปิด Browser Console (F12) แล้วรันคำสั่งนี้:

```javascript
// Check current session
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => console.log('Session:', data))

// Check if logged in
console.log('NextAuth Session:', 
  document.cookie.includes('next-auth.session-token'))
```

### 📊 **Expected Server Logs:**

```
AdminGuard: Admin session valid
GET /api/auth/session 200
POST /api/auth/callback/credentials 200
```

### 🚨 **Common Issues & Solutions:**

#### Issue 1: "AdminGuard: No session"
**Solution**: Session ไม่ได้ save - restart server

#### Issue 2: "AdminGuard: User not admin" 
**Solution**: ตรวจสอบ role ในฐานข้อมูล

#### Issue 3: Infinite redirect loop
**Solution**: Clear browser cookies และ restart server

### 📝 **Current Test Credentials:**

```
Email: admin@exclusivevillasamui.com
Password: Admin123!
Role: ADMIN
Status: Active ✅
```

### 🎯 **Next Steps If Still Not Working:**

1. Clear all browser cookies
2. Restart development server
3. Check database for admin user
4. Test with incognito/private browsing

---

**Test URL**: http://localhost:3000/admin/login  
**Expected Result**: Redirect to `/admin` after successful login  
**Debug Mode**: Enabled ✅
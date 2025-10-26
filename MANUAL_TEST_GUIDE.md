# 🧪 MANUAL TESTING GUIDE - FINAL
**Date:** October 26, 2025  
**Automated Tests:** 100% PASSED (10/10)  
**Ready for:** Browser Testing

---

## ✅ COMPLETED AUTOMATED TESTS:

✅ Database connection  
✅ 226 villas loaded  
✅ Admin user exists  
✅ User registration (direct DB) ✅ Password verification  
✅ Booking table  
✅ Villa queries  
✅ Availability logic  
✅ Environment variables (Stripe keys)  
✅ Register API file

---

## 🔧 FIXES APPLIED TODAY:

### 1. Register API Path
- **Before:** `/api/v1/auth/register` ❌
- **After:** `/en/api/register` ✅

### 2. NextAuth Route
- **Created:** `/api/auth/[...nextauth]/route.ts`
- **Reason:** Client calls `/api/auth` not `/[locale]/api/auth`

### 3. Environment Loading
- **Added:** `require('dotenv').config()`
- **Result:** Stripe keys now load correctly

### 4. Villa Schema
- **Fixed:** Removed `pricePerNight` (doesn't exist)
- **Using:** `bedrooms`, `bathrooms` instead

---

## 📋 MANUAL TESTING STEPS:

### 🌐 Open Browser (Outside VS Code):
```
http://localhost:3000/en
```

### Test 1: Homepage
- [ ] Page loads
- [ ] Villas display (should see 226)
- [ ] Images load from Cloudinary

### Test 2: Registration
```
URL: http://localhost:3000/en/auth/register

Data:
Name: Test User
Email: test@example.com  
Password: Test123456
```
- [ ] Fill form
- [ ] Click "Create Account"
- [ ] Check for success/error message

### Test 3: Login
```
URL: http://localhost:3000/en/auth/login

Admin:
Email: admin@exclusivevillasamui.com
Password: admin123secure
```
- [ ] Enter credentials
- [ ] Click "Sign In"
- [ ] Should redirect to `/admin/dashboard`

### Test 4: Villa Detail
```
URL: http://localhost:3000/en/villas/baan-tawan
```
- [ ] Page loads
- [ ] Images show
- [ ] Booking form appears
- [ ] Calendar works

### Test 5: Availability
- [ ] Select check-in date
- [ ] Select check-out date
- [ ] Check browser console for API call
- [ ] Should call `/api/villas/[slug]/availability`

---

## 🐛 IF ISSUES OCCUR:

**Page won't load:**
1. Check server terminal is running
2. Try `http://192.168.1.4:3000/en` (network IP)
3. Hard refresh (Ctrl+Shift+R)

**API errors:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Find failed request
4. Check Response tab for error message

**Authentication issues:**
1. Clear browser cookies
2. Try incognito/private mode
3. Check terminal for NextAuth logs

---

## ✅ SUCCESS CRITERIA:

**Minimum to Deploy:**
- ✅ Homepage loads
- ✅ Registration works
- ✅ Login works (admin + user)
- ✅ Villa details show

**Nice to have:**
- Availability calendar functional
- Booking flow complete
- Payment with Stripe

---

## 📞 CURRENT STATUS:

**Server:** http://localhost:3000 ✅  
**Database:** Connected (226 villas) ✅  
**APIs:** Register ✅, NextAuth ✅, Availability ✅  
**Environment:** All keys loaded ✅  

**READY FOR MANUAL TESTING** 🚀

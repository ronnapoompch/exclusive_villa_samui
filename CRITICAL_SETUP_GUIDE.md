# ⚠️ CRITICAL SETUP - ต้องทำก่อนอย่างอื่นหมด!

**วันที่:** 30 ธันวาคม 2025  
**สถานะ:** 🔴 BLOCKED - ต้อง setup environment variables ก่อน  

---

## 📊 สถานะ Environment Variables ปัจจุบัน

### ✅ พร้อมใช้งาน (ไม่ต้องแก้)
```env
DATABASE_URL=✅ Configured (Supabase)
DIRECT_URL=✅ Configured (Supabase)
NEXTAUTH_SECRET=✅ Configured
NEXTAUTH_URL=✅ Configured (localhost:3001)
```

### 🔴 CRITICAL - ต้องแก้ก่อน!

#### 1. STRIPE_SECRET_KEY
```
สถานะปัจจุบัน: ❌ "sk_test_placeholder_for_build"
ต้องการ: sk_test_51xxxxxxxxxxxxxxxxxxxxx (จริง)
```

#### 2. STRIPE_PUBLISHABLE_KEY
```
สถานะปัจจุบัน: ❌ "pk_test_placeholder_for_build"
ต้องการ: pk_test_xxxxxxxxxxxxxxxxxxxxx (จริง)
```

#### 3. STRIPE_WEBHOOK_SECRET
```
สถานะปัจจุบัน: ❌ ว่างเปล่า ""
ต้องการ: whsec_xxxxxxxxxxxxxxxxxxxxx (จริง)
```

#### 4. RESEND_API_KEY
```
สถานะปัจจุบัน: ❌ "re_placeholder_for_build_only"
ต้องการ: re_xxxxxxxxxxxxxxxxxxxxx (จริง)
```

#### 5. RESEND_FROM_EMAIL
```
สถานะปัจจุบัน: ⚠️ "booking@exclusive-villa-samui.com"
ต้องการ: อีเมลที่ verify domain แล้ว
```

---

## 🚨 ทำไมต้อง Setup ก่อน?

### ถ้าไม่ setup:
- ❌ **Payment system ใช้งานไม่ได้** - ไม่มี Stripe keys
- ❌ **Webhook ไม่ทำงาน** - ไม่มี webhook secret
- ❌ **ไม่สร้าง Booking** - webhook เป็นตัวสร้าง booking
- ❌ **Email ส่งไม่ออก** - ไม่มี Resend API key
- ❌ **ทดสอบไม่ได้เลย** - ทุกอย่างจะ error

### สรุป:
**ถ้ายัง setup ไม่เสร็จ = ทำอะไรต่อก็ไม่ได้**

---

## 📝 วิธี Setup แต่ละตัว (ทำตามลำดับ)

### 1️⃣ STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY (5 นาที)

#### ขั้นตอน:
1. เปิด: https://dashboard.stripe.com/register
2. สมัครบัญชี (ถ้ายังไม่มี)
3. เปิด: https://dashboard.stripe.com/test/apikeys
4. คัดลอก 2 keys:
   - **Publishable key** (ขึ้นต้น `pk_test_`)
   - **Secret key** (ขึ้นต้น `sk_test_`) → คลิก "Reveal test key"

#### อัพเดท .env:
```env
STRIPE_SECRET_KEY="sk_test_51abc123xyz..." # วางตรงนี้
STRIPE_PUBLISHABLE_KEY="pk_test_51abc123xyz..." # วางตรงนี้
```

#### ⚠️ สำคัญ:
- อย่า commit secret key ลง git
- ใช้ **test mode** ก่อน (ไม่เสียเงินจริง)
- เปลี่ยนเป็น live key ตอน production

---

### 2️⃣ STRIPE_WEBHOOK_SECRET (2 วิธี)

#### 🅰️ วิธีที่ 1: Local Testing (แนะนำสำหรับ development)

**ขั้นตอน:**
```powershell
# 1. Install Stripe CLI (ถ้ายังไม่มี)
# Windows:
scoop install stripe

# หรือ download: https://github.com/stripe/stripe-cli/releases

# 2. Login to Stripe
stripe login

# 3. Forward webhooks to localhost
stripe listen --forward-to localhost:3001/api/payments/webhook
```

**Output จะได้:**
```
> Ready! Your webhook signing secret is whsec_abc123xyz... (คัดลอก)
```

**อัพเดท .env:**
```env
STRIPE_WEBHOOK_SECRET="whsec_abc123xyz..." # วางตรงนี้
```

#### 🅱️ วิธีที่ 2: Production Webhook (สำหรับ deploy แล้ว)

**ขั้นตอน:**
1. เปิด: https://dashboard.stripe.com/test/webhooks
2. คลิก **"Add endpoint"**
3. Endpoint URL: `https://exclusive-villa-samui.vercel.app/api/payments/webhook`
4. Events to send:
   - เลือก `payment_intent.succeeded` ✅
   - เลือก `payment_intent.payment_failed` ✅
5. คลิก **"Add endpoint"**
6. คัดลอก **Signing secret** (ขึ้นต้น `whsec_`)

**อัพเดท .env:**
```env
STRIPE_WEBHOOK_SECRET="whsec_prod_abc123xyz..." # วางตรงนี้
```

---

### 3️⃣ RESEND_API_KEY (3 นาที)

#### ขั้นตอน:
1. เปิด: https://resend.com/signup
2. สมัครบัญชี (ฟรี 100 emails/day)
3. เปิด: https://resend.com/api-keys
4. คลิก **"Create API Key"**
5. ตั้งชื่อ: `exclusive-villa-samui`
6. Permission: **Full Access**
7. คัดลอก key (ขึ้นต้น `re_`)

#### อัพเดท .env:
```env
RESEND_API_KEY="re_abc123xyz..." # วางตรงนี้
```

---

### 4️⃣ RESEND_FROM_EMAIL (5 นาที)

#### ⚠️ ต้อง Verify Domain ก่อน!

#### ขั้นตอน:
1. เปิด: https://resend.com/domains
2. คลิก **"Add Domain"**
3. ใส่ domain: `exclusive-villa-samui.com` (หรือ domain ของคุณ)
4. คัดลอก DNS records ที่ได้:
   ```
   Type: TXT
   Name: resend._domainkey
   Value: p=MIGfMA0GC...
   
   Type: TXT
   Name: @
   Value: v=spf1 include:amazonses.com ~all
   ```
5. เพิ่ม DNS records ที่ domain registrar (Namecheap, GoDaddy, etc.)
6. รอ 5-30 นาที
7. กลับมา Resend → คลิก **"Verify"**

#### อัพเดท .env:
```env
RESEND_FROM_EMAIL="booking@exclusive-villa-samui.com" # ใช้ domain ที่ verify แล้ว
```

#### 💡 ถ้ายังไม่มี domain:
**ใช้ Development Mode:**
```env
RESEND_FROM_EMAIL="onboarding@resend.dev" # Resend's test email
```
- Email จะไม่ส่งจริง แต่จะ log ออกมาที่ console
- ทดสอบ flow ได้

---

## ✅ Checklist - ทำครบทุกข้อก่อนทดสอบ

ติ๊กถูกเมื่อทำเสร็จ:

### Stripe Setup
- [ ] มีบัญชี Stripe แล้ว
- [ ] ได้ `STRIPE_SECRET_KEY` แล้ว (ขึ้นต้น `sk_test_`)
- [ ] ได้ `STRIPE_PUBLISHABLE_KEY` แล้ว (ขึ้นต้น `pk_test_`)
- [ ] ได้ `STRIPE_WEBHOOK_SECRET` แล้ว (ขึ้นต้น `whsec_`)
- [ ] Webhook endpoint ถูกสร้างแล้ว (local หรือ production)
- [ ] Test ด้วย Stripe CLI หรือ Dashboard

### Email Setup
- [ ] มีบัญชี Resend แล้ว
- [ ] ได้ `RESEND_API_KEY` แล้ว (ขึ้นต้น `re_`)
- [ ] Domain ถูก verify แล้ว (หรือใช้ test email)
- [ ] ตั้ง `RESEND_FROM_EMAIL` แล้ว

### .env File
- [ ] อัพเดท `.env` ครบทุกตัว
- [ ] Restart dev server (`npm run dev`)
- [ ] เช็ค console ไม่มี error

---

## 🧪 วิธีเช็คว่า Setup ถูกต้อง

### Test 1: เช็ค Stripe Keys
```powershell
# ใน project directory
npm run dev

# เปิด browser console
# ไม่ควรเห็น error:
# ❌ "Stripe publishable key not found"
```

### Test 2: เช็ค Webhook
```powershell
# Terminal 1: Run server
npm run dev

# Terminal 2: Run Stripe CLI
stripe listen --forward-to localhost:3001/api/payments/webhook

# Terminal 3: Trigger test event
stripe trigger payment_intent.succeeded

# ควรเห็น:
# ✅ "payment_intent.succeeded" received
# ✅ Booking created
# ✅ Email logged (if dev mode)
```

### Test 3: เช็ค Email
```powershell
# Run server
npm run dev

# ดูใน console ตอน webhook ทำงาน:
# ถ้าใช้ placeholder API key:
# 📧 [DEV MODE] Booking Confirmation Email:
# To: guest@email.com
# Booking ID: xxx

# ถ้าใช้ real API key:
# ✅ Confirmation email sent: re_abc123xyz
```

---

## 🚀 เมื่อ Setup เสร็จแล้ว

### สิ่งที่ทำได้:
✅ ทดสอบ payment flow
✅ สร้าง booking ได้
✅ ส่ง email ได้
✅ Webhook ทำงาน
✅ ดู logs ได้
✅ ทำ admin features ต่อได้

### ขั้นตอนถัดไป:
1. ทดสอบด้วย test card: `4242 4242 4242 4242`
2. ยืนยันว่า booking ถูกสร้างใน database
3. ตรวจสอบ email ที่ส่งออกไป
4. ถ้าทุกอย่างโอเค → ทำ task ถัดไปใน NEXT_TASKS_PLAN.md

---

## 🆘 เจอปัญหา?

### Error: "Stripe secret key not found"
**แก้:** เช็คว่า `STRIPE_SECRET_KEY` ใน `.env` ถูกต้อง

### Error: "Webhook signature verification failed"
**แก้:** เช็คว่า `STRIPE_WEBHOOK_SECRET` ใน `.env` ตรงกับ webhook secret

### Error: "Email send failed"
**แก้:** 
- เช็ค `RESEND_API_KEY` ถูกต้อง
- ถ้าใช้ placeholder → เปลี่ยนเป็น real key
- ถ้าใช้ custom domain → ต้อง verify domain ก่อน

### Webhook ไม่ทำงาน (local)
**แก้:**
```powershell
# ต้องรัน Stripe CLI ด้วย
stripe listen --forward-to localhost:3001/api/payments/webhook

# เปิดไว้ตลอดเวลาที่ dev
```

---

## 📋 Quick Setup Script

สำหรับคนที่รีบ:

```powershell
# 1. Install Stripe CLI
scoop install stripe

# 2. Login Stripe
stripe login

# 3. Start webhook forwarding (เปิดไว้ terminal นึง)
stripe listen --forward-to localhost:3001/api/payments/webhook
# คัดลอก webhook secret → .env

# 4. Get API keys
# Stripe: https://dashboard.stripe.com/test/apikeys
# Resend: https://resend.com/api-keys
# อัพเดท .env

# 5. Restart server
npm run dev

# 6. Test
# http://localhost:3001/booking/[villa-slug]
# ใช้ test card: 4242 4242 4242 4242
```

---

## 🎯 สรุป

**ถ้าทำครบ 4 ตัวนี้ = พร้อม deploy!**

```env
✅ STRIPE_SECRET_KEY="sk_test_51..." # Real key
✅ STRIPE_PUBLISHABLE_KEY="pk_test_..." # Real key
✅ STRIPE_WEBHOOK_SECRET="whsec_..." # Real secret
✅ RESEND_API_KEY="re_..." # Real key
```

**เวลาโดยรวม: 15-20 นาที**

หลังจากนี้ = ทุกอย่างใช้งานได้แล้ว 🚀

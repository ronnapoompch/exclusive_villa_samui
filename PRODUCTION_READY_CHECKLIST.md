# 🚀 Production Deployment Checklist
**ฉบับละเอียด - ติ๊กได้จริง (Updated: Dec 31, 2025)**

> ⚠️ **คำเตือน:** ตรวจทุกข้อก่อนขึ้น Production จริง

---

## 🔴 Phase 1: Critical Security (ห้ามข้าม!)

### 1.1 Stripe Configuration
```bash
# ✅ ตรวจสอบว่าอยู่ Test Mode
# Current: pk_test_51SJC8a... ✅

# 🔴 TODO: Switch to Live Mode
```

**Action Items:**
- [ ] **ไป Stripe Dashboard** → https://dashboard.stripe.com/test/developers
- [ ] **Switch to Production Mode** (มุมบนขวา)
- [ ] **Copy Live Keys:**
  - Publishable key: `pk_live_...`
  - Secret key: `sk_live_...`
- [ ] **Create Webhook Endpoint:**
  - URL: `https://yourdomain.com/api/payments/webhook`
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
  - Copy webhook secret: `whsec_...`

**Environment Variables to Update:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # เปลี่ยนจาก pk_test
STRIPE_SECRET_KEY=sk_live_xxx                    # เปลี่ยนจาก sk_test
STRIPE_WEBHOOK_SECRET=whsec_xxx                  # จาก webhook endpoint ใหม่
```

**⚠️ คำเตือน:**
```bash
# ❌ ห้ามใช้ live key ใน localhost!
# ✅ ใช้เฉพาะใน production environment เท่านั้น
```

---

### 1.2 NextAuth Secret Rotation
```bash
# Current: your-secret-key-here ❌ (ไม่ปลอดภัย!)
```

**Generate Strong Secret:**
```bash
# วิธี 1: OpenSSL (แนะนำ)
openssl rand -base64 32

# วิธี 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# วิธี 3: Online (ใช้เฉพาะถ้าไว้ใจเว็บ)
# https://generate-secret.vercel.app/32
```

**Environment Variables:**
```bash
NEXTAUTH_SECRET=<ค่าที่ generate ได้>   # ❗ เปลี่ยนทันที
NEXTAUTH_URL=https://yourdomain.com     # ❗ เปลี่ยนจาก localhost
```

---

### 1.3 Database Security

**Check Connection String:**
```bash
# ✅ ตรวจว่า DATABASE_URL ไม่มี password ที่ชัดเจนใน code
# ✅ ตรวจว่าใช้ SSL connection (sslmode=require)
```

**Action Items:**
- [ ] **เปิด SSL ใน database connection**
  ```bash
  DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
  ```
- [ ] **Setup connection pooling** (ถ้ายังไม่มี)
  ```bash
  # Vercel: ใช้ Supabase/Neon มี pooling built-in
  # VPS: Setup PgBouncer
  ```
- [ ] **Rotate database password** (ถ้ายังใช้ default)

---

### 1.4 Admin Password Reset
```bash
# Current: Admin123! ❌ (password ง่ายเกิน!)
```

**Reset Admin Password:**
```bash
node reset-admin-password.js
# หรือ
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
(async () => {
  const hash = await bcrypt.hash('YourNewStrongPassword123!@#', 10);
  await prisma.user.update({
    where: { email: 'admin@exclusivevillasamui.com' },
    data: { password: hash }
  });
  console.log('✅ Password updated');
  await prisma.\$disconnect();
})();
"
```

**Action Items:**
- [ ] **เปลี่ยน password เป็นแบบแข็งแรง** (12+ ตัวอักษร, มีพิเศษ, ตัวเลข)
- [ ] **บันทึก password ไว้ใน password manager** (1Password, LastPass)
- [ ] **ตั้ง 2FA** (ถ้ามี feature - TODO)

---

### 1.5 Environment Variables Review

**Check for Secrets in Code:**
```bash
# ค้นหาว่ามี hardcoded secrets ไหม
grep -r "sk_test_" src/
grep -r "sk_live_" src/
grep -r "password.*=" src/
```

**Action Items:**
- [ ] **ตรวจว่าไม่มี API keys ใน code**
- [ ] **ตรวจว่าไม่มี .env.local ใน git**
  ```bash
  # ต้องมีใน .gitignore
  .env*.local
  .env.production
  ```
- [ ] **Setup environment variables ใน Vercel/hosting**

---

## 🟠 Phase 2: Email Service Setup

### 2.1 Resend Domain Verification
```bash
# Current: onboarding@resend.dev (Test mode only)
# Target: bookings@exclusive-villa-samui.com
```

**Step-by-Step:**

1. **ไป Resend Dashboard** → https://resend.com/domains

2. **Add Domain:**
   ```
   Domain: exclusive-villa-samui.com
   ```

3. **Add DNS Records** (ไปที่ domain registrar):
   ```
   Type: TXT
   Name: _resend
   Value: resend-verify=xxxxxxxxxx
   
   Type: TXT  
   Name: @
   Value: v=spf1 include:resend.io ~all
   
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@exclusive-villa-samui.com
   ```

4. **Verify Domain** (รอ 10-60 นาที)

5. **Update Environment Variable:**
   ```bash
   RESEND_FROM_EMAIL=bookings@exclusive-villa-samui.com
   ```

**Action Items:**
- [ ] **Add domain to Resend**
- [ ] **Configure DNS records**
- [ ] **Verify domain (wait 10-60 mins)**
- [ ] **Test email sending:**
  ```bash
  curl -X POST https://api.resend.com/emails \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "from": "bookings@exclusive-villa-samui.com",
      "to": "ronnapoom.pch@gmail.com",
      "subject": "Test Email",
      "html": "<h1>Test successful!</h1>"
    }'
  ```
- [ ] **Update src/services/email.service.ts** (ถ้าใช้ hardcoded sender)

**⚠️ Alternative (ถ้า verify ไม่ได้):**
```bash
# ยังสามารถส่งได้ แต่จำกัดที่ ronnapoom.pch@gmail.com เท่านั้น
# เหมาะสำหรับ: Internal testing, admin notifications
```

---

### 2.2 Email Templates Testing

**Action Items:**
- [ ] **Test Booking Confirmation Email:**
  ```bash
  # สร้าง test booking แล้วดูว่าอีเมลส่งถูกต้อง
  ```
- [ ] **Check Email Content:**
  - [ ] ชื่อ villa ถูกต้อง
  - [ ] วันที่ถูกต้อง
  - [ ] ราคาถูกต้อง
  - [ ] Booking reference แสดง
  - [ ] Link ไปหน้า confirmation ใช้งานได้
- [ ] **Test on Multiple Clients:**
  - [ ] Gmail (desktop)
  - [ ] Gmail (mobile)
  - [ ] Outlook
  - [ ] Apple Mail

---

## 🟡 Phase 3: Testing & Quality Assurance

### 3.1 Delete Test Data
```bash
# ลบ test bookings ทั้งหมด (17 bookings)
```

**Script to Clean:**
```javascript
// cleanup-test-data-production.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  // ⚠️ Backup ก่อน!
  console.log('Creating backup...');
  const allBookings = await prisma.booking.findMany();
  require('fs').writeFileSync('backup-bookings.json', JSON.stringify(allBookings, null, 2));
  
  // ลบ test bookings
  const result = await prisma.booking.deleteMany({
    where: {
      OR: [
        { guestName: { contains: 'Test' } },
        { guestEmail: { contains: 'test@' } },
        { guestEmail: { contains: 'example.com' } }
      ]
    }
  });
  
  console.log(`✅ Deleted ${result.count} test bookings`);
  
  // ลบ test payments
  await prisma.payment.deleteMany({
    where: {
      transactionId: { startsWith: 'test_' }
    }
  });
  
  await prisma.$disconnect();
}

cleanup();
```

**Action Items:**
- [ ] **Backup database ก่อนลบ**
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```
- [ ] **Run cleanup script**
  ```bash
  node cleanup-test-data-production.js
  ```
- [ ] **Verify deletion**
  ```bash
  node check-bookings.js
  ```

---

### 3.2 End-to-End Testing

**Critical Paths to Test:**

**Path 1: Booking Flow (Happy Path)**
- [ ] เลือก villa
- [ ] เลือกวันที่ (ตรวจว่า availability ถูกต้อง)
- [ ] กรอกข้อมูลแขก
- [ ] กด "Book Now"
- [ ] PaymentIntent created (เช็ค Network tab)
- [ ] กรอก test card: `4242 4242 4242 4242`
- [ ] Submit payment
- [ ] Redirect ไป confirmation page
- [ ] แสดงข้อมูลถูกต้อง
- [ ] ได้รับ email confirmation

**Path 2: Race Condition Test**
- [ ] เปิด 2 browser windows
- [ ] เลือก villa เดียวกัน, วันเดียวกัน
- [ ] กด book พร้อมกันทั้ง 2 windows
- [ ] Window แรก: ควรสำเร็จ
- [ ] Window สอง: ควร auto-refund + แสดง error
- [ ] เช็ค database: มี 1 booking เท่านั้น
- [ ] เช็ค Stripe: มี refund transaction

**Path 3: Admin Dashboard**
- [ ] Login ด้วย admin account
- [ ] เห็น bookings ทั้งหมด
- [ ] Search ทำงาน
- [ ] Filter ทำงาน
- [ ] เปลี่ยน status ได้
- [ ] View details modal แสดงถูก

**Path 4: Error Handling**
- [ ] ลอง book วันที่ในอดีต → แสดง error
- [ ] ลอง book villa ที่ไม่มี → 404
- [ ] ลอง access admin โดยไม่ login → redirect
- [ ] Payment fail (card declined) → แสดง error ถูกต้อง

---

### 3.3 Performance Testing

**Load Testing (Optional แต่แนะนำ):**
```bash
# ติดตั้ง k6
brew install k6  # macOS
# หรือ
choco install k6  # Windows

# สร้าง load-test.js
```

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },  // รอบอุ่น: 10 users
    { duration: '1m', target: 50 },   // ขึ้นไป 50 users
    { duration: '30s', target: 0 },   // ลงมา
  ],
};

export default function() {
  // Test homepage
  let res = http.get('http://localhost:3000');
  check(res, { 'status is 200': (r) => r.status === 200 });
  
  // Test villa page
  res = http.get('http://localhost:3000/villas');
  check(res, { 'status is 200': (r) => r.status === 200 });
  
  sleep(1);
}
```

```bash
# Run test
k6 run load-test.js
```

**Action Items:**
- [ ] **Test homepage load** (< 2s)
- [ ] **Test villa list** (< 3s)
- [ ] **Test booking page** (< 2s)
- [ ] **Test admin dashboard** (< 2s)
- [ ] **Check database connections** (no pool exhaustion)

---

### 3.4 Security Audit

**Check OWASP Top 10:**
- [ ] **SQL Injection**: ✅ (Prisma ORM protects)
- [ ] **XSS**: Check React rendering (no `dangerouslySetInnerHTML` with user input)
- [ ] **CSRF**: ✅ (NextAuth handles)
- [ ] **Authentication**: ✅ (NextAuth + bcrypt)
- [ ] **Sensitive Data Exposure**: ตรวจ logs, error messages
- [ ] **Rate Limiting**: ⚠️ TODO (Phase 3)

**Action Items:**
- [ ] **ตรวจว่า error messages ไม่ leak sensitive info**
- [ ] **ตรวจว่า HTTPS enforced** (production)
- [ ] **ตรวจว่า security headers ตั้งค่าแล้ว:**
  ```javascript
  // next.config.js
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ]
  }
  ```

---

## 🟢 Phase 4: Deployment to Production

### 4.1 Pre-Deployment Checklist

**Code Review:**
- [ ] **ไม่มี console.log() ที่ไม่จำเป็น**
  ```bash
  grep -r "console.log" src/ | grep -v "node_modules"
  ```
- [ ] **ไม่มี TODO comments ที่ critical**
  ```bash
  grep -r "TODO" src/ | grep -i "critical\|security\|bug"
  ```
- [ ] **TypeScript errors = 0**
  ```bash
  npm run build
  ```
- [ ] **ESLint warnings resolved**
  ```bash
  npm run lint
  ```

**Git Clean:**
- [ ] **Commit ทุกอย่าง**
  ```bash
  git status  # ควรเป็น "working tree clean"
  ```
- [ ] **Tag version**
  ```bash
  git tag -a v1.0.0 -m "Production release"
  git push origin v1.0.0
  ```

---

### 4.2 Vercel Deployment (แนะนำ)

**ขั้นตอน:**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link Project:**
   ```bash
   vercel link
   # เลือก scope, project name
   ```

4. **Add Environment Variables:**
   ```bash
   # Option 1: Via Dashboard (แนะนำ)
   # ไป: https://vercel.com/dashboard → Settings → Environment Variables
   
   # Option 2: Via CLI
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   vercel env add DATABASE_URL production
   vercel env add STRIPE_SECRET_KEY production
   vercel env add STRIPE_WEBHOOK_SECRET production
   vercel env add RESEND_API_KEY production
   # ... เพิ่มทุกตัวที่จำเป็น
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

6. **Verify Deployment:**
   - [ ] เข้า URL ที่ deploy ได้
   - [ ] ทดสอบ booking flow
   - [ ] ทดสอบ webhook (สร้าง test booking จริง)
   - [ ] เช็ค logs: `vercel logs`

**Environment Variables Required:**
```bash
# Authentication
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://yourdomain.com

# Database
DATABASE_URL=<production-db-url>

# Stripe (Live Mode!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=bookings@exclusive-villa-samui.com

# Other
ENCRYPTION_KEY=<same-as-before>
```

---

### 4.3 Database Migration

**ถ้าใช้ production database ใหม่:**
```bash
# 1. Run migrations
npx prisma migrate deploy

# 2. Seed initial data (villas, etc.)
npx prisma db seed

# 3. Create admin user
node create-admin.js
```

**ถ้าใช้ database เดิม:**
```bash
# Backup ก่อน!
pg_dump $DATABASE_URL > backup_before_production.sql

# Run migrations ถ้ามี
npx prisma migrate deploy
```

---

### 4.4 Post-Deployment Verification

**Critical Checks (ใน 30 นาทีแรก):**
- [ ] **Homepage loads** (< 3s)
- [ ] **SSL certificate valid** (🔒 แสดงใน browser)
- [ ] **API endpoints work:**
  ```bash
  curl https://yourdomain.com/api/health
  ```
- [ ] **Webhook receives events:**
  - สร้าง test booking
  - เช็ค Stripe webhook logs: https://dashboard.stripe.com/webhooks
  - เช็คว่า booking ถูกสร้างใน database
- [ ] **Admin login works**
- [ ] **Email sent successfully**

**Monitoring Setup:**
- [ ] **เปิด Vercel Analytics** (free tier)
- [ ] **ตั้ง alert สำหรับ errors**
  - Vercel Integration: Slack/Discord webhook
- [ ] **เช็ค logs ทุก 1 ชม. ในวันแรก**

---

## 🚨 Phase 5: จุดที่ Dev มักลืม (Critical!)

### 5.1 CORS Configuration
```javascript
// src/app/api/*/route.ts
// ❌ ห้าม: origin: '*' (ไม่ปลอดภัย)
// ✅ ควรทำ:

const allowedOrigins = [
  'https://exclusive-villa-samui.com',
  'https://www.exclusive-villa-samui.com'
];

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // ... rest of code
}
```

**Action Items:**
- [ ] **ตรวจ CORS ในทุก API route**
- [ ] **ใช้ whitelist แทน `*`**
- [ ] **Test จาก external domain** (ควรถูก block)

---

### 5.2 Rate Limiting (Critical!)

**ปัญหา:** ไม่มี rate limiting = เสี่ยง DDoS, bot attacks

**Solution: ใช้ Upstash Rate Limit (ฟรี 10k requests/day):**

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});

// Usage in API route:
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  // ... rest of code
}
```

**Priority Routes to Protect:**
- [ ] `/api/payments/create-intent` (10 req/10s per IP)
- [ ] `/api/payments/webhook` (100 req/min)
- [ ] `/api/auth/*` (5 req/min per IP)
- [ ] `/api/admin/*` (20 req/min per user)

**Action Items:**
- [ ] **Sign up Upstash:** https://upstash.com/
- [ ] **Create Redis database**
- [ ] **Add env vars:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [ ] **Implement rate limiting** (ใช้เวลา ~1 ชม.)

---

### 5.3 Error Monitoring (Critical!)

**ปัญหา:** Production errors ไม่รู้จนกว่าผู้ใช้บอก

**Solution: Sentry (ฟรี 5k errors/month):**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  
  // ❗ ห้าม log sensitive data
  beforeSend(event) {
    // ลบ credit card info
    if (event.request?.data) {
      delete event.request.data.cardNumber;
      delete event.request.data.cvv;
    }
    return event;
  }
});
```

**Action Items:**
- [ ] **Sign up Sentry:** https://sentry.io/
- [ ] **Install Sentry**
- [ ] **Test error tracking:**
  ```typescript
  throw new Error('Test Sentry integration');
  ```
- [ ] **Setup alerts** (Slack/Email)

---

### 5.4 Database Connection Pool

**ปัญหา:** Prisma opens too many connections → database crashes

**Solution: Connection Pooling:**

```typescript
// src/lib/prisma.ts (อัปเดต)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20'
      }
    }
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**For Vercel (แนะนำ):**
```bash
# ใช้ connection pooler เช่น Supabase Pooler / Neon Serverless
DATABASE_URL="postgresql://user:pass@db.host.com:5432/db?pgbouncer=true"
```

**Action Items:**
- [ ] **ตั้ง connection limit**
- [ ] **Test ด้วย concurrent requests** (load testing)
- [ ] **Monitor connection count:**
  ```sql
  SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'your_db';
  ```

---

### 5.5 Logging Strategy

**ปัญหา:** `console.log()` everywhere = hard to debug production

**Solution: Structured Logging:**

```typescript
// src/lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const logger = {
  info: (message: string, meta?: any) => log('info', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  error: (message: string, meta?: any) => log('error', message, meta),
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, meta);
    }
  }
};

function log(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(logEntry));
}

// Usage:
logger.info('Payment created', { paymentIntentId, amount });
logger.error('Booking conflict', { villaId, dates });
```

**Action Items:**
- [ ] **Replace console.log() → logger.info()**
- [ ] **เพิ่ม request ID ทุก log:**
  ```typescript
  const requestId = crypto.randomUUID();
  logger.info('API called', { requestId, endpoint });
  ```

---

### 5.6 Backup Strategy

**ปัญหา:** Database corrupted = ข้อมูลหายหมด

**Solution: Automated Backups:**

**Option 1: Vercel Postgres (Auto backup)**
- ✅ Automatic daily backups
- ✅ Point-in-time recovery

**Option 2: Custom Backup (VPS):**
```bash
# cron job: backup ทุกวัน 2AM
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# เก็บ backup 30 วันล่าสุด
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

**Action Items:**
- [ ] **Setup automated backups**
- [ ] **Test restore procedure:**
  ```bash
  gunzip < backup.sql.gz | psql $DATABASE_URL
  ```
- [ ] **Document backup location**

---

### 5.7 Health Check Endpoint

**ปัญหา:** ไม่รู้ว่าระบบ healthy หรือไม่

**Solution:**

```typescript
// src/app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test Stripe connectivity (optional)
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // await stripe.balance.retrieve();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 });
  }
}
```

**Action Items:**
- [ ] **สร้าง /api/health endpoint**
- [ ] **Setup uptime monitoring:** (UptimeRobot, Pingdom)
- [ ] **Test endpoint:**
  ```bash
  curl https://yourdomain.com/api/health
  ```

---

### 5.8 Webhook Retry Logic

**ปัญหา:** Webhook fails → booking ไม่ถูกสร้าง → customer จ่ายเงินแล้วแต่ไม่ได้ booking!

**Current Status:**
```typescript
// src/app/api/payments/webhook/route.ts
// ✅ มี idempotency check (ดี)
// ⚠️ แต่ไม่มี retry mechanism
```

**Solution:**

```typescript
// เพิ่ม webhook event log
await prisma.webhookEvent.create({
  data: {
    eventId: event.id,
    type: event.type,
    status: 'PROCESSING',
    attempts: 1,
    payload: JSON.stringify(event)
  }
});

try {
  // ... create booking
  
  // Update success
  await prisma.webhookEvent.update({
    where: { eventId: event.id },
    data: { status: 'PROCESSED' }
  });
} catch (error) {
  // Update failed
  await prisma.webhookEvent.update({
    where: { eventId: event.id },
    data: { 
      status: 'FAILED',
      error: error.message 
    }
  });
  
  // ⚠️ CRITICAL: Send alert to admin!
  await sendAdminAlert({
    type: 'WEBHOOK_FAILED',
    eventId: event.id,
    error: error.message
  });
  
  throw error;
}
```

**Stripe Webhook Retry:**
- ✅ Stripe auto-retries failed webhooks (3 days)
- ⚠️ คุณต้อง return 200 ถ้า idempotent
- ⚠️ คุณต้อง return 500 ถ้าอยากให้ retry

**Action Items:**
- [ ] **เพิ่ม WebhookEvent model ใน schema:**
  ```prisma
  model WebhookEvent {
    id        String   @id @default(cuid())
    eventId   String   @unique
    type      String
    status    String   // PROCESSING, PROCESSED, FAILED
    attempts  Int      @default(1)
    payload   Json
    error     String?
    createdAt DateTime @default(now())
  }
  ```
- [ ] **Implement webhook logging**
- [ ] **Setup admin alerts สำหรับ failed webhooks**
- [ ] **Create manual retry script:**
  ```bash
  node retry-failed-webhooks.js
  ```

---

## 📊 Phase 6: Monitoring & Maintenance

### 6.1 Analytics Setup

**User Analytics (แนะนำ):**
- [ ] **Google Analytics 4** (ฟรี)
- [ ] **Vercel Analytics** (ฟรี tier)
- [ ] **Track events:**
  - Villa viewed
  - Booking started
  - Payment completed
  - Booking cancelled

**Business Metrics:**
- [ ] **Dashboard สำหรับ:**
  - Daily revenue
  - Booking conversion rate
  - Average booking value
  - Popular villas
  - Occupancy rate

---

### 6.2 Maintenance Checklist (Weekly/Monthly)

**Weekly:**
- [ ] **Check error logs** (Sentry/Vercel)
- [ ] **Review failed webhooks**
- [ ] **Monitor database size** (approaching limits?)
- [ ] **Check uptime** (99.9% target)

**Monthly:**
- [ ] **Review security logs**
- [ ] **Rotate API keys** (ถ้าจำเป็น)
- [ ] **Update dependencies:**
  ```bash
  npm outdated
  npm update
  ```
- [ ] **Test backup restore**
- [ ] **Review performance metrics**
- [ ] **Check disk space** (VPS only)

---

## 🎯 Final Checklist Summary

### Must Have (ห้ามขาด!):
- [ ] Stripe switched to Live Mode
- [ ] Webhook endpoint configured
- [ ] NEXTAUTH_SECRET rotated
- [ ] Admin password changed
- [ ] Test data deleted
- [ ] End-to-end test passed
- [ ] Deployed to production
- [ ] Health check working
- [ ] Email sending tested

### Should Have (แนะนำ):
- [ ] Email domain verified
- [ ] Rate limiting implemented
- [ ] Error monitoring (Sentry)
- [ ] Backup strategy in place
- [ ] Webhook retry logic
- [ ] CORS configured properly
- [ ] Security headers set

### Nice to Have (ถ้ามีเวลา):
- [ ] Load testing completed
- [ ] Analytics setup
- [ ] Monitoring dashboard
- [ ] Admin alerts
- [ ] Audit logging

---

## 🚀 Ready to Launch?

**If you can check ALL items in "Must Have" section:**
```
✅ คุณพร้อม launch production แล้ว!
```

**Estimated Time:**
- Phase 1 (Security): **1-2 hours**
- Phase 2 (Email): **30-60 mins** (ขึ้นกับ DNS propagation)
- Phase 3 (Testing): **1-2 hours**
- Phase 4 (Deployment): **30 mins**
- Phase 5 (Dev forgot items): **2-3 hours**
- Phase 6 (Monitoring): **30 mins**

**Total: 4-6 hours** (ตามที่รายงาน)

---

## 📞 Need Help?

**Common Issues:**

**Q: Webhook ไม่ทำงาน**
```bash
# Check Stripe webhook logs
# Verify STRIPE_WEBHOOK_SECRET
# Test with Stripe CLI:
stripe listen --forward-to localhost:3000/api/payments/webhook
```

**Q: Email ไม่ส่ง**
```bash
# Check domain verification status
# Test API key:
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -d '{"from":"test@yourdomain.com","to":"you@email.com","subject":"Test","html":"Test"}'
```

**Q: Database connection errors**
```bash
# Check connection string
# Verify SSL mode
# Check connection pool settings
```

---

**Generated:** Dec 31, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready (with checklist completion)

🎯 **Next Step:** เริ่มจาก Phase 1.1 (Stripe Configuration) เลย!

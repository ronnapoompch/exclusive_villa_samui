# 🚀 Vercel Environment Variables Setup

## Required Environment Variables for Vercel

Copy these environment variables to Vercel Dashboard:
**Settings → Environment Variables**

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_DEBUG=false

# Encryption
ENCRYPTION_KEY=your-256-bit-hex-key

# Email (Resend)
RESEND_API_KEY=re_NdtkWJW4_GDKNnuSx92cbPEAEFmWGmTws
RESEND_FROM_EMAIL=noreply@exclusive-villa-samui.com

# Stripe Payment (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key-here
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key-here
STRIPE_SECRET_KEY=your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret-here

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@exclusive-villa-samui.com
FROM_NAME=Exclusive Villa Samui

# Admin
ADMIN_EMAIL=admin@exclusive-villa-samui.com
ADMIN_PASSWORD=your-secure-password

# Base URL (Change after deploy)
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# Database (Supabase)
DATABASE_URL=your-database-url-here
DIRECT_URL=your-direct-url-here
```

## 📝 Important Notes:

1. **NEXTAUTH_URL** - เปลี่ยนเป็น URL ของ Vercel หลัง deploy
2. **NEXT_PUBLIC_BASE_URL** - เปลี่ยนเป็น URL ของ Vercel หลัง deploy
3. **NEXTAUTH_DEBUG** - ตั้งเป็น `false` สำหรับ production
4. **DATABASE_URL** - ใช้ค่าจาก Supabase
5. **Stripe** - ตอนนี้ใช้ Test Mode ถ้าจะ production ต้องเปลี่ยน keys

## 🔐 Database Connection

Make sure to add your Supabase database URLs:
- Get from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database

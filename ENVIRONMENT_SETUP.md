# 🚀 ENVIRONMENT VARIABLES CHECKLIST

## Vercel Dashboard Setup (เมื่อกลับมา)

### 📍 ไปที่: https://vercel.com/dashboard
### 🔧 Project Settings > Environment Variables

### 🗄️ Database Configuration
```
DATABASE_URL
postgresql://username:password@host:5432/database_name
```

### 🔐 Authentication  
```
NEXTAUTH_SECRET
random-32-character-secret-string

NEXTAUTH_URL  
https://your-domain.vercel.app
```

### 💳 Stripe Payment
```
STRIPE_SECRET_KEY
sk_live_your_live_secret_key

STRIPE_PUBLISHABLE_KEY  
pk_live_your_live_publishable_key

STRIPE_WEBHOOK_SECRET
whsec_your_webhook_secret
```

### 📧 Email Service (Resend)
```
RESEND_API_KEY
re_your_resend_api_key

RESEND_FROM_EMAIL
noreply@exclusive-villa-samui.com
```

### 🔍 Google OAuth (Optional)
```  
GOOGLE_CLIENT_ID
your_google_client_id

GOOGLE_CLIENT_SECRET
your_google_client_secret
```

### 🌍 Optional Environment Variables
```
NODE_ENV
production

NEXT_TELEMETRY_DISABLED  
1
```

## ✅ Quick Verification Commands

```bash
# Test database connection
npx prisma db pull

# Test Stripe integration  
curl -X POST https://your-domain.vercel.app/api/payments/create-intent

# Test email service
curl -X POST https://your-domain.vercel.app/api/auth/forgot-password
```

## 🚨 Important Notes

1. **Never commit secrets to Git!** ⚠️
2. **Use Vercel dashboard for production env vars** ✅  
3. **Test each service after deployment** 🧪
4. **Keep backup of all environment variables** 💾

---

**All systems ready for deployment! 🚀**
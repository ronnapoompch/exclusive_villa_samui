# Deployment Guide - Exclusive Villa Samui

## 🚀 Production Deployment Options

### Option 1: Vercel (Recommended)
**Perfect for Next.js applications**

1. **Setup Vercel Project**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Environment Variables in Vercel Dashboard**
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: https://your-domain.vercel.app
   - `DATABASE_URL`: PostgreSQL connection string
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `RESEND_API_KEY`: Your Resend API key

3. **Deploy Command**
   ```bash
   git push origin main
   ```
   Auto-deploys via GitHub Actions!

### Option 2: Docker + Cloud Provider
**For more control and flexibility**

1. **Build Docker Image**
   ```bash
   docker build -t exclusive-villa-samui .
   docker run -p 3000:3000 exclusive-villa-samui
   ```

2. **Deploy to Cloud**
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances

### Option 3: VPS/Dedicated Server

1. **Server Setup**
   ```bash
   # Install Node.js, PostgreSQL, Redis
   sudo apt update
   sudo apt install nodejs npm postgresql redis-server
   ```

2. **Application Setup**
   ```bash
   git clone https://github.com/ronnapoom.pch/exclusive-villa-samui.git
   cd exclusive-villa-samui
   npm install
   npm run build
   npm start
   ```

## 📋 Pre-Deployment Checklist

### ✅ Required Environment Variables
- [ ] `NEXTAUTH_SECRET` - Authentication secret
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `DATABASE_URL` - PostgreSQL database
- [ ] `STRIPE_SECRET_KEY` - Payment processing
- [ ] `RESEND_API_KEY` - Email sending

### ✅ Database Setup
- [ ] PostgreSQL database created
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed data: `npm run prisma:seed`

### ✅ Domain & SSL
- [ ] Domain configured
- [ ] SSL certificate (auto with Vercel)
- [ ] CORS settings updated

### ✅ Third-party Services
- [ ] Stripe webhook configured
- [ ] Email service configured
- [ ] Image optimization setup

## 🔧 Production Configuration

### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker deployment
  images: {
    unoptimized: false,
    domains: ['your-domain.com']
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['your-domain.com']
    }
  }
}
```

### Database Migration
```bash
# Production migration
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 🌐 Vercel Deployment (Step by Step)

1. **Connect GitHub Repository**
   - Go to vercel.com
   - Import your GitHub repository
   - Select "exclusive-villa-samui"

2. **Configure Build Settings**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**
   ```
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=https://your-app.vercel.app
   DATABASE_URL=postgresql://...
   STRIPE_SECRET_KEY=sk_live_...
   RESEND_API_KEY=re_...
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Your app is live! 🎉

## 🐳 Docker Deployment

1. **Build & Run Locally**
   ```bash
   docker build -t villa-samui .
   docker run -p 3000:3000 villa-samui
   ```

2. **Push to Registry**
   ```bash
   docker tag villa-samui your-registry/villa-samui:latest
   docker push your-registry/villa-samui:latest
   ```

3. **Deploy to Cloud**
   ```bash
   # Example: Google Cloud Run
   gcloud run deploy villa-samui \
     --image=your-registry/villa-samui:latest \
     --platform=managed \
     --region=asia-southeast1
   ```

## 📊 Monitoring & Maintenance

### Health Checks
- Monitor `/api/health` endpoint
- Database connection status
- Error tracking with Sentry

### Performance Monitoring
- Vercel Analytics (built-in)
- Google Analytics
- Lighthouse CI

### Backup Strategy
- Database backups (daily)
- Image backups (weekly)
- Code repository (GitHub)

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures**
   - Check environment variables
   - Verify dependencies
   - Review build logs

2. **Database Connection**
   - Verify connection string
   - Check SSL requirements
   - Test network connectivity

3. **Authentication Issues**
   - Verify NEXTAUTH_SECRET
   - Check callback URLs
   - Review provider settings

### Support Contacts
- Vercel Support: vercel.com/support
- Database Issues: Check your provider docs
- Application Issues: Check GitHub issues

---

## 🎯 Quick Deploy Commands

```bash
# Option 1: Vercel (Fastest)
npx vercel --prod

# Option 2: Docker
docker-compose up -d

# Option 3: Traditional hosting
npm run build && npm start
```

**Your Exclusive Villa Samui is ready for the world! 🏖️**
# 🔒 Immediate Security Actions (Do Now!)

**Date:** 2025-12-30  
**Priority:** 🔴 CRITICAL

---

## ❗ Issue Found
Stripe Secret Key was shared in chat/logs:
- Old key ending in: `...wOGf`
- New key ending in: `...NlIG`

Both keys were exposed in chat history and must be rotated immediately.

---

## 🚨 Action 1: Rotate Stripe Keys (NOW!)

### Steps:
1. **Go to Stripe Dashboard:**
   - Test Mode: https://dashboard.stripe.com/test/apikeys
   - Production Mode: https://dashboard.stripe.com/apikeys

2. **Delete/Roll Old Keys:**
   - Find key: `sk_test_51SJC8aL9zMvGCEfG...`
   - Click "Delete" or "Roll key"
   - Generate new secret key

3. **Update `.env.local` immediately:**
   ```bash
   STRIPE_SECRET_KEY=sk_test_NEW_KEY_HERE
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_NEW_KEY_HERE
   ```

4. **Restart Server:**
   ```bash
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

5. **Update Vercel/Production:**
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Update `STRIPE_SECRET_KEY`
   - Redeploy

---

## 🧹 Action 2: Remove Sensitive Logs

### File: `src/lib/stripe/server.ts`

Check if this file logs any keys:
```typescript
// ❌ BAD - Remove this
console.log('Stripe initialized with key:', process.env.STRIPE_SECRET_KEY);

// ✅ GOOD - Only log that it exists
console.log('Stripe initialized:', !!process.env.STRIPE_SECRET_KEY);
```

### General Rule:
```typescript
// ❌ Never log:
- API keys
- Secret keys  
- Webhook secrets
- Payment details (card numbers, CVV)
- Personal data (without consent)

// ✅ Safe to log:
- Request IDs
- PaymentIntent IDs (these are safe)
- Booking IDs
- Status codes
- Error types (without sensitive data)
```

---

## 🔐 Action 3: Verify .gitignore

**Already checked ✅** - `.env*` is ignored

**Double-check no committed secrets:**
```bash
# Search git history for secrets
git log -p | grep -i "STRIPE_SECRET_KEY"
git log -p | grep -i "sk_test_"

# If found, must rewrite git history:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 🛡️ Action 4: Add Rate Limiting

### File: `src/app/api/payments/create-intent/route.ts`

Add at the top of POST function:
```typescript
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  // Basic rate limiting (improve with Redis later)
  const ip = headers().get('x-forwarded-for') || 'unknown';
  
  // TODO: Implement proper rate limiting with Upstash Redis
  // For now, trust Vercel's built-in rate limiting
  
  try {
    // ... existing code
```

**Better solution (for production):**
```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const paymentRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '5 m'), // 3 payment attempts per 5 minutes
  analytics: true,
});
```

---

## 📧 Action 5: Enable Email Notifications

### Current Status:
- Email service exists: `src/services/email.service.ts`
- Resend integration ready
- **Not configured yet**

### Enable Now:
```bash
# .env.local
RESEND_API_KEY=re_GET_FROM_RESEND_DASHBOARD
RESEND_FROM_EMAIL=bookings@your-domain.com
```

### Get Resend API Key:
1. Go to: https://resend.com/api-keys
2. Create new key
3. Copy to `.env.local`
4. Restart server

---

## 🎯 Action 6: Enhanced Error Messages

### File: `src/components/StripePayment.tsx`

Replace generic error with specific messages:

```typescript
const getErrorMessage = (error: any): string => {
  const code = error?.code;
  
  switch (code) {
    case 'card_declined':
      return '❌ Your card was declined. Please try another card.';
    case 'insufficient_funds':
      return '❌ Insufficient funds. Please use another payment method.';
    case 'incorrect_cvc':
      return '❌ Invalid CVV. Please check and try again.';
    case 'expired_card':
      return '❌ Your card has expired. Please use another card.';
    case 'processing_error':
      return '❌ Payment processing error. Please try again in a moment.';
    case 'rate_limit':
      return '⏱️ Too many attempts. Please wait 5 minutes and try again.';
    default:
      return '❌ Payment failed. Please check your card details and try again.';
  }
};

// Usage:
setError(getErrorMessage(err));
```

---

## 🚀 Action 7: Production Webhook Setup

### When Ready to Deploy:

1. **Deploy to production first**
2. **Get production URL:** `https://your-domain.com`
3. **Configure webhook:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events: Select:
     * `payment_intent.succeeded`
     * `payment_intent.payment_failed`
   - Click "Add endpoint"
4. **Copy webhook secret:**
   ```bash
   # Add to Vercel environment variables
   STRIPE_WEBHOOK_SECRET=whsec_PRODUCTION_SECRET
   ```
5. **Test webhook:**
   - Send test event from Stripe dashboard
   - Check logs in Vercel

---

## ✅ Quick Verification Checklist

Before going to production:

- [ ] Rotated Stripe keys
- [ ] No secrets in git history
- [ ] `.env.local` not committed
- [ ] Removed console.logs with sensitive data
- [ ] Rate limiting added
- [ ] Email service configured
- [ ] Better error messages
- [ ] Production webhook configured
- [ ] Tested end-to-end in production
- [ ] Monitoring/alerts set up

---

## 🆘 If Already in Production

**IMMEDIATE ACTIONS:**

1. **Rotate keys NOW** (see Action 1)
2. **Check Stripe logs:**
   - Dashboard → Logs
   - Look for suspicious activity
   - Check for unauthorized charges
3. **Monitor for 24 hours:**
   - Watch for unusual payment attempts
   - Check error rates
4. **If compromise suspected:**
   - Contact Stripe support immediately
   - Review all transactions
   - Consider temporary shutdown

---

## 📞 Emergency Contacts

- **Stripe Support:** support@stripe.com
- **Security Issues:** security@stripe.com (if keys were compromised)
- **Developer:** [Your contact]

---

**Next Steps After This:**
1. Complete these immediate actions
2. Review `PRODUCTION_CHECKLIST.md` for full production prep
3. Implement confirmation page & admin dashboard
4. Set up monitoring & alerts

**Status:** 🔴 **REQUIRES IMMEDIATE ACTION**

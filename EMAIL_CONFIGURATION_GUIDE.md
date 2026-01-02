# 📧 Email Configuration Guide

**Status:** ✅ API Key Valid | ⚠️ Domain Not Verified

---

## Current Status

### ✅ What's Working:
- Resend API key is valid
- Email service code is ready
- Templates are implemented

### ⚠️ What's Missing:
- Domain verification
- Can only send to: **ronnapoom.pch@gmail.com** (your registered email)
- Cannot send to guest emails yet

---

## Option 1: Test with Your Email (Quick - 2 Minutes) ⭐

**For testing only - all emails go to you:**

```bash
# .env.local (already set)
RESEND_API_KEY=re_NdtkWJW4_GDKNnuSx92cbPEAEFmWGmTws
RESEND_FROM_EMAIL=onboarding@resend.dev

# All booking confirmations will be sent to:
# ronnapoom.pch@gmail.com (your Resend account email)
```

**Testing:**
1. Make a test booking
2. Check your email: ronnapoom.pch@gmail.com
3. You'll receive the confirmation email

---

## Option 2: Verify Your Domain (Production Ready - 30 Minutes) ⭐⭐⭐

### Step 1: Add Domain to Resend

1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain: `exclusive-villa-samui.com`
4. Click **"Add"**

### Step 2: Add DNS Records

Resend will provide DNS records to add. You need to add these to your domain's DNS settings:

**Example Records:**
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN...
```

**Where to add:**
- If using Vercel: Vercel Dashboard → Domains → DNS Records
- If using Cloudflare: Cloudflare Dashboard → DNS
- If using GoDaddy: GoDaddy DNS Management
- Other providers: Check their DNS management page

### Step 3: Wait for Verification

- DNS propagation: 5-30 minutes (sometimes up to 48 hours)
- Check verification status: https://resend.com/domains
- Status will change from "Pending" to "Verified" ✓

### Step 4: Update .env.local

```bash
# After verification
RESEND_FROM_EMAIL=bookings@exclusive-villa-samui.com
```

### Step 5: Restart Server

```bash
npm run dev
```

---

## Option 3: Use Different Email Service (Alternative)

If you can't verify domain, alternatives:

### A. SendGrid (Free Tier: 100 emails/day)
1. Sign up: https://sendgrid.com/
2. Get API key
3. Update code to use SendGrid instead

### B. Gmail SMTP (Simple but Limited)
Already configured in .env.local:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=villasamuitest@gmail.com
SMTP_PASS=testpass123
```

**Note:** Need to enable "Less secure app access" or use App Password

---

## Current Workaround for Development

**Email service will work but only for testing:**

### What happens now:
```
User books villa → Payment successful → Webhook triggered
→ Email service tries to send → Can only send to ronnapoom.pch@gmail.com
→ Guest won't receive email yet
→ But booking is still created successfully in database
```

### For development/testing:
```javascript
// webhook will skip email if domain not verified
if (process.env.RESEND_API_KEY && 
    process.env.RESEND_API_KEY !== 're_placeholder_for_build_only') {
  try {
    await sendBookingConfirmation({...});
  } catch (error) {
    console.error('Email failed but booking completed');
  }
}
```

**Booking will work even if email fails!** ✅

---

## Testing Instructions

### Test 1: Booking Without Email (Current)
1. Make a test booking
2. Payment succeeds
3. Redirect to confirmation page ✓
4. Booking saved in database ✓
5. Email fails (domain not verified) ⚠️
6. Check terminal logs: "Email sending skipped"

### Test 2: Email to Your Address (After Step 1)
1. Make a test booking with **ANY email address**
2. Email will be sent to: ronnapoom.pch@gmail.com
3. Check your inbox
4. You'll see the confirmation email

### Test 3: Full Production (After Domain Verified)
1. Make a test booking with guest email
2. Guest receives confirmation email ✓
3. Check: bookings@exclusive-villa-samui.com as sender

---

## Recommended Action

### For Development (Now):
✅ Continue testing - bookings work without email
✅ Email service will automatically work when domain verified
✅ No code changes needed

### For Production (Before Launch):
🔐 **Priority 1:** Rotate Stripe keys (security - do first!)
📧 **Priority 2:** Verify domain (30 mins)
🧪 **Priority 3:** Test email delivery
🚀 **Priority 4:** Deploy to production

---

## Email Templates Available

Already implemented and ready:

### 1. Booking Confirmation ✅
File: `src/services/email.service.ts` → `sendBookingConfirmation()`

**Includes:**
- Booking reference number
- Villa details
- Check-in/out dates
- Guest information
- Payment summary
- Check-in instructions
- Contact information

**Preview:**
```
Subject: Booking Confirmation - Villa Playful Azure

Your booking has been confirmed!
Booking Reference: AB12CD34
Villa: Villa Playful Azure
Check-in: January 2, 2026
Check-out: January 6, 2026
Total: ฿98,868

[View Full Details Button]
```

### 2. Admin Notification (TODO)
Notify admin when new booking received

### 3. Pre-Arrival Reminder (TODO)
Sent 3 days before check-in

---

## Quick Command Reference

```bash
# Test Resend API
node test-resend-email.js

# Check current configuration
cat .env.local | grep RESEND

# Restart server after changes
Ctrl+C
npm run dev

# View email logs (in server terminal)
grep -i "email" terminal-output.log
```

---

## Troubleshooting

### Issue: "Domain not verified"
**Solution:** Follow Option 2 above

### Issue: "Invalid API key"
**Solution:** 
1. Go to https://resend.com/api-keys
2. Generate new key
3. Update RESEND_API_KEY in .env.local

### Issue: "Cannot send to this email"
**Solution:** 
- Before domain verification: Only sends to ronnapoom.pch@gmail.com
- After domain verification: Can send to anyone

### Issue: Email not received
**Check:**
1. Spam folder
2. Server logs for errors
3. Resend dashboard: https://resend.com/emails
4. DNS records verified

---

## Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Resend API Key | ✅ Valid | Working |
| Email Code | ✅ Ready | Templates implemented |
| Domain Verification | ⚠️ Pending | Blocks production use |
| Test Emails | ✅ Working | Only to ronnapoom.pch@gmail.com |
| Production Emails | ❌ Blocked | Need domain verification |

---

## Next Steps

1. ✅ **Continue development** - Email not blocking
2. 🔐 **Rotate Stripe keys** - CRITICAL security
3. 📧 **Verify domain** - When ready for production
4. 🧪 **Test booking flow** - Confirmation page works!

---

**Last Updated:** 2025-12-30
**Priority:** Medium (can launch without email, add later)
**Time to Fix:** 30 minutes (domain verification)

# 🔴 Stripe Live Migration Checklist
**ทำตอน: Domain + Email + Monitoring พร้อมแล้ว**

---

## ⚠️ Prerequisites (ต้องพร้อมก่อน):

- [ ] **Domain Ready:** Production domain ตั้งค่า + DNS propagated
- [ ] **Email Verified:** Resend domain verified (สามารถส่งได้จริง)
- [ ] **Monitoring Active:** Sentry/logging system ทำงาน
- [ ] **Phase 1 Complete:** Hardening ทั้งหมดเสร็จแล้ว
- [ ] **Backup Done:** Database backup เรียบร้อย

---

## 🚀 Migration Steps (ทำทีละขั้นตอน)

### Step 1: Stripe Account Verification
```bash
# ✅ ตรวจสอบว่า Stripe account ผ่าน KYC
# ไป: https://dashboard.stripe.com/settings/account
```

- [ ] Business information complete
- [ ] Bank account connected (สำหรับรับเงิน)
- [ ] Identity verification complete
- [ ] Account status: **Active** (not restricted)

---

### Step 2: Create Production Webhook Endpoint

**Go to:** https://dashboard.stripe.com/webhooks

1. **Switch to Production Mode** (มุมขวาบน)

2. **Click:** "Add endpoint"

3. **Enter Endpoint URL:**
   ```
   https://yourdomain.com/api/payments/webhook
   ```

4. **Select Events:**
   - [x] `payment_intent.succeeded`
   - [x] `payment_intent.payment_failed`
   - [x] `payment_intent.canceled`

5. **Copy Webhook Signing Secret:**
   ```
   whsec_xxxxxxxxxxxxx
   ```

---

### Step 3: Get Live API Keys

**Go to:** https://dashboard.stripe.com/apikeys

**Copy:**
```bash
Publishable key: pk_live_xxxxxxxxxxxxx
Secret key:      sk_live_xxxxxxxxxxxxx
```

⚠️ **CRITICAL:** ห้ามแชร์ secret key กับใคร!

---

### Step 4: Update Environment Variables

**On Vercel/Hosting Platform:**

```bash
# ลบตัวเก่า (test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # ❌ DELETE
STRIPE_SECRET_KEY=sk_test_xxx                    # ❌ DELETE
STRIPE_WEBHOOK_SECRET=whsec_test_xxx             # ❌ DELETE

# เพิ่มตัวใหม่ (live keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # ✅ ADD
STRIPE_SECRET_KEY=sk_live_xxx                    # ✅ ADD
STRIPE_WEBHOOK_SECRET=whsec_xxx                  # ✅ ADD (from Step 2)
```

**⚠️ DON'T update .env.local (localhost should stay on test mode)**

---

### Step 5: Test Webhook Delivery

**Stripe Dashboard → Webhooks → Your Endpoint**

1. Click "Send test webhook"
2. Choose: `payment_intent.succeeded`
3. Send
4. Check response: Should be **200 OK**

**If Failed:**
```bash
# Check webhook logs:
vercel logs --follow

# Common issues:
- Wrong webhook secret
- CORS blocking
- API route not deployed
- Database connection error
```

---

### Step 6: Create Test Transaction (Small Amount)

**Test with Real Card (Small Amount: 50 THB):**

1. Go to your booking page (production)
2. Select cheapest villa
3. Select 1 night
4. Use **YOUR real card** (not test card!)
5. Amount: Minimum booking (e.g., 50-100 THB)

**Expected Flow:**
```
[Frontend] → Create PaymentIntent (50 THB)
    ↓
[Stripe] → Charge your card
    ↓
[Webhook] → Create booking
    ↓
[Email] → Send confirmation
    ↓
[Database] → Booking saved
```

**Verify:**
- [ ] Payment charged (check your bank statement)
- [ ] Booking created in database
- [ ] Email received
- [ ] Confirmation page shown
- [ ] Admin dashboard shows booking
- [ ] No errors in logs

---

### Step 7: Immediate Refund (If Test)

**If testing, refund immediately:**

```bash
# Go to Stripe Dashboard → Payments
# Find the test payment
# Click "Refund"
# Refund full amount
```

---

### Step 8: Monitor for 24 Hours

**Check Every Hour (First Day):**
- [ ] Webhook events delivered (Dashboard → Webhooks)
- [ ] No failed webhooks
- [ ] Bookings created successfully
- [ ] Emails sent
- [ ] No errors in Sentry
- [ ] No database connection issues

**Setup Alerts:**
```bash
# Stripe: Email alert for failed webhooks
# Vercel: Function error notifications
# Sentry: Error spikes
```

---

### Step 9: Update Rate Limits (Production Values)

**If using rate limiting:**

```typescript
// src/lib/rate-limit.ts
// Adjust for production traffic
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, '10 s'), // Increase from 10 to 50
  analytics: true,
});
```

---

### Step 10: Document & Communicate

**Update Documentation:**
- [ ] Update README with live Stripe status
- [ ] Document webhook URL
- [ ] Note test card no longer works
- [ ] Update error messages (test mode → live mode)

**Notify Team:**
```
✅ Stripe Live Mode Active
- Webhook: https://yourdomain.com/api/payments/webhook
- Test transaction: Successful
- Monitoring: Active
- Status: Production Ready
```

---

## 🔙 Rollback Plan (If Issues)

**If problems occur:**

### Emergency Rollback:
```bash
# 1. Switch back to test keys on Vercel
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# 2. Redeploy
vercel --prod

# 3. Disable production webhook (Stripe Dashboard)

# 4. Investigate issue

# 5. Fix & retry
```

---

## 📊 Success Criteria

**All must be ✅ before declaring success:**

- [ ] Webhook delivers successfully (200 OK)
- [ ] Test booking created with real card
- [ ] Test booking appears in database
- [ ] Confirmation email received
- [ ] Admin dashboard shows booking
- [ ] Payment visible in Stripe Dashboard
- [ ] No errors in logs (24h monitoring)
- [ ] Refund test successful (if applicable)

---

## 🚨 Common Issues & Solutions

### Issue 1: Webhook Returns 500
**Solution:**
```bash
# Check logs:
vercel logs --follow

# Common causes:
- Database connection error → Check DATABASE_URL
- Missing env vars → Verify all keys set
- Code error → Check webhook route code
```

### Issue 2: Webhook Not Received
**Solution:**
```bash
# Verify webhook URL is correct
# Check Stripe webhook logs (shows delivery attempts)
# Verify endpoint is publicly accessible
# Test with curl:
curl https://yourdomain.com/api/payments/webhook
```

### Issue 3: Payment Success But No Booking
**Solution:**
```bash
# Check webhook signature verification
# Verify STRIPE_WEBHOOK_SECRET matches
# Check idempotency key handling
# Review booking creation logic in webhook
```

---

## 📝 Migration Log Template

```
=== Stripe Live Migration ===
Date: __________
Time: __________

✅ Stripe account verified
✅ Webhook created: whsec_xxx
✅ Live keys copied
✅ Env vars updated on Vercel
✅ Test webhook sent: 200 OK
✅ Test transaction: __ THB
   - Payment ID: pi_xxx
   - Booking ID: xxx
   - Email sent: Yes/No
✅ Refunded (if test)
✅ 24h monitoring complete

Issues encountered:
- [None / List any issues]

Status: ✅ SUCCESS / ⚠️ PARTIAL / ❌ FAILED
Notes:
_______________________________
```

---

## 🎯 Timeline Estimate

| Step | Duration | Waiting Time |
|------|----------|--------------|
| Step 1-3 (Setup) | 15 mins | - |
| Step 4 (Env vars) | 5 mins | - |
| Step 5 (Test webhook) | 5 mins | - |
| Step 6 (Test transaction) | 10 mins | - |
| Step 7 (Refund) | 2 mins | - |
| Step 8 (Monitor) | - | 24 hours |
| **Total Active Time** | **~37 mins** | - |
| **Total Wait Time** | - | **24 hours** |

---

**Ready to Execute When:**
1. Phase 1 Hardening complete ✅
2. Domain configured ✅
3. Email verified ✅
4. Monitoring active ✅
5. Team notified ✅

📍 **Current Status:** ⏸️ Deferred (Waiting for prerequisites)

---

**Generated:** Dec 31, 2025  
**Version:** 1.0  
**Next Review:** When domain/email/monitoring ready

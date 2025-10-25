# 🧪 STRIPE PAYMENT TESTING GUIDE

## 🎯 Quick Setup & Testing

### Step 1: Configure Stripe Keys (2 minutes)
```bash
# 1. Visit https://dashboard.stripe.com/test/apikeys
# 2. Create free Stripe account
# 3. Copy test keys and update .env.local:

STRIPE_PUBLISHABLE_KEY=pk_test_[YOUR_KEY]
STRIPE_SECRET_KEY=sk_test_[YOUR_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_KEY]
```

### Step 2: Run Complete Payment Tests
```bash
# Test all payment functionality
node test-stripe-payment.js

# Quick payment API test
node test-payment-mock.js

# Verify Stripe configuration
node test-stripe-config.js
```

---

## 📊 Available Test Scripts

### 1. **Complete System Test** (`test-stripe-payment.js`)
```bash
node test-stripe-payment.js
```
**Tests 7 Categories:**
- ✅ Environment validation
- ✅ Payment intent creation
- ✅ Payment confirmation
- ✅ Webhook endpoints
- ✅ Error handling
- ✅ Data validation
- ✅ Integration flows

### 2. **Quick Payment Test** (`test-payment-mock.js`)
```bash
node test-payment-mock.js
```
**Features:**
- Mock booking support
- Payment intent creation
- Response validation
- Error analysis

### 3. **Stripe Configuration Check** (`test-stripe-config.js`)
```bash
node test-stripe-config.js
```
**Validates:**
- API key format
- Stripe connection
- Account information
- Configuration issues

---

## 🎮 Manual Testing Scenarios

### Scenario 1: Successful Payment Flow
```bash
# 1. Create payment intent
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test-booking-123",
    "amount": 10000,
    "currency": "THB"
  }'

# Expected: 200 OK with paymentIntent and client_secret
```

### Scenario 2: Payment Confirmation
```bash
# 2. Check payment status
curl "http://localhost:3000/api/payments/confirm?payment_intent=pi_xxx"

# Expected: Payment status and details
```

### Scenario 3: Webhook Testing
```bash
# 3. Simulate webhook (requires Stripe CLI)
stripe listen --forward-to localhost:3000/api/payments/webhook
```

---

## 🔍 Expected Test Results

### ✅ SUCCESS Response (Payment Intent)
```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_xxxxxxxxxxxxx",
    "client_secret": "pi_xxxxx_secret_xxxxx",
    "amount": 10000,
    "currency": "thb"
  },
  "payment": {
    "id": "clxxxxxxxxxxxxx",
    "status": "PENDING"
  }
}
```

### ✅ SUCCESS Response (Confirmation)
```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_xxxxxxxxxxxxx",
    "status": "requires_payment_method"
  },
  "payment": {
    "status": "PENDING",
    "amount": 10000
  }
}
```

### ❌ ERROR Response (Invalid Keys)
```json
{
  "success": false,
  "error": "Payment processing failed",
  "details": "Invalid API Key provided: sk_test_***"
}
```

---

## 🛠️ Debugging Common Issues

### Issue 1: Invalid API Key
**Error:** `Invalid API Key provided`
**Solution:**
```bash
# Update .env.local with real Stripe test keys
# Get from: https://dashboard.stripe.com/test/apikeys
```

### Issue 2: Server Not Running
**Error:** `ECONNREFUSED`
**Solution:**
```bash
npm run dev  # Start Next.js server
```

### Issue 3: Database Connection
**Error:** `Database connection failed`
**Solution:**
```bash
# Check PostgreSQL and run migrations
npx prisma migrate dev
```

### Issue 4: Webhook Signature
**Error:** `Invalid signature`
**Solution:**
```bash
# Update STRIPE_WEBHOOK_SECRET in .env.local
# Get from Stripe Dashboard > Webhooks
```

---

## 🎯 Production Testing Checklist

### Pre-Production ✅
- [ ] Test keys working in development
- [ ] All test scenarios passing
- [ ] Webhook handling verified
- [ ] Database integration confirmed
- [ ] Error handling tested

### Production Setup 📝
- [ ] Replace test keys with live keys
- [ ] Configure production webhook endpoints
- [ ] Test with real payment methods
- [ ] Monitor webhook delivery
- [ ] Set up error alerting

---

## 📞 Support Resources

### Stripe Documentation
- **API Reference**: https://stripe.com/docs/api
- **Webhook Guide**: https://stripe.com/docs/webhooks
- **Testing Guide**: https://stripe.com/docs/testing

### Test Cards (Stripe Test Mode)
```
✅ Success: 4242424242424242
❌ Decline: 4000000000000002
🔒 3D Secure: 4000002500003155
💳 Visa: 4242424242424242
💳 Mastercard: 5555555555554444
```

### Local Development
```bash
# Install Stripe CLI for webhook testing
stripe login
stripe listen --forward-to localhost:3000/api/payments/webhook
```

---

## 🎉 Success Confirmation

**When all tests pass, you should see:**
```
✅ All 7 test categories completed
✅ Payment intent creation successful  
✅ Payment confirmation working
✅ Webhook handler responding
✅ Database integration confirmed
🎯 Payment system ready for production!
```

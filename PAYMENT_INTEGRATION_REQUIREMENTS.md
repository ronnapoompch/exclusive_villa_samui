# 💳 Payment Integration Requirements Document
**Project:** Exclusive Villa Samui  
**Document Date:** December 30, 2025  
**Priority:** 🔥 CRITICAL - HIGH PRIORITY  
**Estimated Time:** 4-5 hours  
**For:** Developer Implementation

---

## 📋 Table of Contents
1. [Database Schema](#1-database-schema)
2. [Stripe Configuration](#2-stripe-configuration)
3. [Booking Flow Architecture](#3-booking-flow-architecture)
4. [Email Provider Setup](#4-email-provider-setup)
5. [Email Content Requirements](#5-email-content-requirements)
6. [Admin Access Control](#6-admin-access-control)
7. [Booking Status Definitions](#7-booking-status-definitions)
8. [Implementation Checklist](#8-implementation-checklist)
9. [API Endpoints Required](#9-api-endpoints-required)

---

## 1️⃣ Database Schema

### Current Schema (Prisma)

#### **Booking Model**
```prisma
model Booking {
  id              String        @id @default(cuid())
  villaId         String
  userId          String?
  guestName       String
  guestEmail      String
  guestPhone      String?
  checkIn         DateTime
  checkOut        DateTime
  guests          Int
  totalAmount     Float
  currency        String        @default("THB")
  status          BookingStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  specialRequests String?
  
  // Relations
  villa           Villa         @relation(fields: [villaId], references: [id])
  user            User?         @relation(fields: [userId], references: [id])
  payments        Payment[]     // One-to-many relationship
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([villaId])
  @@index([userId])
  @@index([checkIn, checkOut])
  @@map("bookings")
}
```

#### **Payment Model**
```prisma
model Payment {
  id              String        @id @default(cuid())
  bookingId       String
  amount          Float
  currency        String        @default("THB")
  status          PaymentStatus @default(PENDING)
  paymentIntentId String?       @unique  // ⚠️ Stripe PaymentIntent ID
  transactionId   String?
  processedAt     DateTime?
  
  // Relations
  booking         Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([bookingId])
  @@index([paymentIntentId])
  @@map("payments")
}
```

#### **Enums**
```prisma
enum BookingStatus {
  PENDING     // รอยืนยันหลังชำระเงิน
  CONFIRMED   // Admin ยืนยันแล้ว
  CANCELLED   // ยกเลิกการจอง
  COMPLETED   // Check-out เสร็จสิ้น
  
  @@map("enum_booking_status")
}

enum PaymentStatus {
  PENDING     // รอการชำระเงิน
  PAID        // ชำระเงินสำเร็จ
  FAILED      // การชำระเงินล้มเหลว
  REFUNDED    // คืนเงินแล้ว
  
  @@map("enum_payment_status")
}
```

#### **User Model (Relevant fields)**
```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  password    String?
  name        String?
  role        UserRole  @default(USER)
  
  bookings    Booking[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@map("users")
}

enum UserRole {
  USER      // Regular customer
  ADMIN     // Full system access
  STAFF     // Limited access
  
  @@map("enum_user_role")
}
```

### ⚠️ Important Notes:
- **`paymentIntentId`** is in the **Payment** model, NOT in Booking model
- Booking has **one-to-many** relationship with Payment (allows partial payments, refunds)
- All monetary values use **Float** type for THB currency
- Cascade delete: Deleting a booking will delete associated payments

---

## 2️⃣ Stripe Configuration

### Current Setup

**File:** `src/lib/stripe/server.ts`

```typescript
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_CONFIG = {
  currency: 'thb',              // Thai Baht
  minAmount: 100,               // 100 THB minimum
  maxAmount: 100_000_000,       // 100M THB maximum
  apiVersion: '2023-10-16'
} as const;
```

### Status Overview

| Feature | Status | Details |
|---------|--------|---------|
| **PaymentIntent API** | ✅ **YES** | Using `stripe.paymentIntents.create()` |
| **Currency** | ✅ **THB** | Thai Baht (ไทย) |
| **Mode** | ⚠️ **TEST** | Using placeholder key |
| **Webhook Secret** | ❌ **NO** | Not configured yet |

### Environment Variables Required

```env
# Current .env status
DATABASE_URL=✅ Configured (Supabase)
NEXTAUTH_SECRET=✅ Configured
NEXTAUTH_URL=http://localhost:3001

# ⚠️ REQUIRED TO ADD:
STRIPE_SECRET_KEY=sk_test_xxxxx        # ❌ Missing (placeholder only)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx      # ❌ Missing (need to create)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx   # ❌ Missing (for client-side)

# Email
RESEND_API_KEY=re_xxxxx                # ⚠️ Placeholder only
RESEND_FROM_EMAIL=booking@yourdomain.com  # ⚠️ Need to set
```

### Stripe Test Card Numbers
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
Expired: 4000 0000 0000 0069
CVV: Any 3 digits
Date: Any future date
```

---

## 3️⃣ Booking Flow Architecture

### Current Implementation (⚠️ NEEDS CHANGE)

**Current Flow:** **Book-First** (จองก่อน → จ่ายทีหลัง)

```
User fills form → Check availability → Create booking → Redirect to payment
```

**File:** `src/components/booking/BookingForm.tsx` (lines 260-269)

```typescript
const onSubmit = async (data: BookingFormData) => {
  if (!availability) {
    setAvailabilityError('Please check availability first');
    return;
  }

  const bookingData = {
    villaId, checkInDate, checkOutDate, guests,
    guestName, guestEmail, guestPhone,
    pricing: availability.pricing,
    specialRequests
  };

  // Creates booking WITHOUT payment
  await onBookingSubmit(bookingData);
}
```

### ⚠️ Issues with Current Flow:
1. **Ghost Bookings:** Unpaid bookings block availability
2. **Revenue Loss:** Users abandon payment after booking
3. **Management Overhead:** Need to chase unpaid bookings
4. **Inventory Issues:** Fake bookings block real customers

---

### ✅ RECOMMENDED: Pay-First Flow

**New Flow:** **Pay-First** (จ่ายก่อน → จองทีหลัง)

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User fills booking form                                │
│ - Select dates (Check-in / Check-out)                          │
│ - Select number of guests                                      │
│ - Enter guest details (name, email, phone)                     │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Check Availability (API Call)                          │
│ - POST /api/villas/{slug}/availability                         │
│ - Validate dates not booked                                    │
│ - Calculate pricing with discounts                             │
│   * 15% off for 7+ nights (weekly)                            │
│   * 30% off for 30+ nights (monthly)                          │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Show Payment Form (Stripe Elements)                    │
│ - Display: Total amount, breakdown, fees                       │
│ - Stripe CardElement for card input                           │
│ - Billing details form                                         │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Create PaymentIntent                                   │
│ - POST /api/payments/create-intent                             │
│ - Request Body:                                                │
│   {                                                            │
│     villaId, checkIn, checkOut,                               │
│     guestName, guestEmail, guestPhone,                        │
│     totalAmount, currency: "THB"                              │
│   }                                                            │
│ - Response: { clientSecret }                                   │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Confirm Card Payment (Client-Side)                     │
│ - stripe.confirmCardPayment(clientSecret, {...})              │
│ - Handle 3D Secure authentication if required                  │
│ - Show loading state during processing                         │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Webhook Receives payment_intent.succeeded              │
│ - POST /api/payments/webhook                                   │
│ - Verify webhook signature                                     │
│ - Create Booking record (status: PENDING)                      │
│ - Create Payment record (status: PAID)                         │
│ - Save paymentIntentId in Payment table                        │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Send Confirmation Email                                │
│ - Email booking confirmation to guest                          │
│ - Include: Villa details, dates, pricing, receipt             │
│ - Template: booking-confirmation.tsx                           │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: Redirect to Success Page                               │
│ - Show booking confirmation                                    │
│ - Display booking ID                                           │
│ - Button: "View Booking Details"                               │
│ - Button: "Back to Home"                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Benefits of Pay-First:
✅ **No ghost bookings** - Only paid bookings block availability  
✅ **Guaranteed revenue** - Payment secured before booking confirmed  
✅ **Better inventory** - Real-time availability accuracy  
✅ **Customer trust** - Instant confirmation after payment  
✅ **Reduced admin work** - No chasing unpaid bookings

---

## 4️⃣ Email Provider Setup

### Current Configuration

**Provider:** Resend  
**File:** `src/services/email.service.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'fake-api-key-for-build');

export async function sendEmail(options: SendEmailOptions) {
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@exclusive-villa-samui.com',
    to: options.to,
    subject: options.template.subject,
    html: options.template.html,
    text: options.template.text
  });
  
  return result;
}
```

### Status

| Item | Status | Action Required |
|------|--------|-----------------|
| **Resend SDK** | ✅ Installed | None |
| **Email Service** | ✅ Created | Working (forgot password tested) |
| **API Key** | ⚠️ Placeholder | Need real key from Resend |
| **Domain Verified** | ❓ Unknown | Check Resend Dashboard |
| **Sender Email** | ⚠️ Not Set | Need to configure |
| **Templates** | ❌ Missing | Need to create booking templates |

### Required Setup Steps

1. **Get Resend API Key**
   - Login to [resend.com](https://resend.com)
   - Create API key
   - Add to `.env`: `RESEND_API_KEY=re_xxxxx`

2. **Verify Domain**
   - Go to: https://resend.com/domains
   - Add your domain (e.g., exclusive-villa-samui.com)
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification (5-30 minutes)

3. **Configure Sender**
   - Set verified email address
   - Add to `.env`: `RESEND_FROM_EMAIL=booking@exclusive-villa-samui.com`

---

## 5️⃣ Email Content Requirements

### Templates to Create

#### 5.1 Booking Confirmation Email
**File:** `src/lib/email/templates/booking-confirmation.tsx`

**Required Content:**
```typescript
interface BookingConfirmationEmailProps {
  // Guest Info
  guestName: string;
  guestEmail: string;
  
  // Villa Info
  villaName: string;
  villaImage: string;
  villaLocation: string;
  villaSlug: string;
  
  // Booking Details
  bookingId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  
  // Pricing
  basePrice: number;
  discount?: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  currency: string;
  
  // Additional
  specialRequests?: string;
  cancellationPolicy: string;
  contactEmail: string;
  contactPhone: string;
}
```

**Content Sections:**
1. **Header:** Logo + "Booking Confirmed"
2. **Greeting:** "Dear {guestName}"
3. **Villa Image:** Hero image of villa
4. **Booking Summary:**
   - Check-in: {date} after 2:00 PM
   - Check-out: {date} before 11:00 AM
   - Duration: {nights} nights
   - Guests: {count} people
5. **Price Breakdown:**
   - Base price
   - Discount (if any)
   - Service fee
   - Taxes
   - **Total**
6. **Important Information:**
   - Cancellation policy
   - Contact details
   - Villa address
7. **Footer:** Social media, unsubscribe

#### 5.2 Payment Receipt
**File:** `src/lib/email/templates/payment-receipt.tsx`

**Content:**
- Official receipt with transaction ID
- Payment method used
- Date and time of payment
- Itemized breakdown
- Refund policy

#### 5.3 Booking Reminder
**File:** `src/lib/email/templates/booking-reminder.tsx`

**Trigger:** 3 days before check-in

**Content:**
- Upcoming booking reminder
- Check-in instructions
- What to bring
- Contact for concierge

---

### ❓ Questions for Client (TO BE ANSWERED)

**Language:**
- [ ] English only?
- [ ] Thai only?
- [ ] Bilingual (EN + TH)?

**Tone/Style:**
- [ ] Luxury/Premium (formal)
- [ ] Friendly/Warm (casual)
- [ ] Professional/Business

**Branding:**
- [ ] Logo URL or file?
- [ ] Brand colors (hex codes)?
- [ ] Font preferences?

**Contact Information:**
- [ ] Support email?
- [ ] Phone number?
- [ ] WhatsApp/Line?
- [ ] Office hours?

---

## 6️⃣ Admin Access Control

### Current Implementation

**Authentication:** NextAuth.js  
**File:** `src/app/api/auth/[...nextauth]/route.ts`

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Email + Password login
    })
  ],
  pages: {
    signIn: '/admin/login',    // ✅ Separate admin login
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;  // Store role in JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;   // Add role to session
      }
      return session;
    }
  }
};
```

### User Roles

```prisma
enum UserRole {
  USER   // Regular customer - Can make bookings
  ADMIN  // Full access - Can view/edit/delete everything
  STAFF  // Limited access - Can view bookings, update status
}
```

### Role Permissions Matrix

| Feature | USER | STAFF | ADMIN |
|---------|------|-------|-------|
| Make booking | ✅ | ✅ | ✅ |
| View own bookings | ✅ | ❌ | ✅ |
| View all bookings | ❌ | ✅ | ✅ |
| Update booking status | ❌ | ✅ | ✅ |
| Cancel any booking | ❌ | ❌ | ✅ |
| Process refunds | ❌ | ❌ | ✅ |
| View payments | ❌ | ✅ | ✅ |
| Export reports | ❌ | ✅ | ✅ |
| Manage villas | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

### Protected Routes

**Admin Dashboard:**
- `/admin` - Overview dashboard
- `/admin/bookings` - All bookings
- `/admin/bookings/[id]` - Booking details
- `/admin/payments` - Payment history
- `/admin/villas` - Villa management
- `/admin/users` - User management

**Middleware Check:**
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
}
```

### Login Separation

✅ **Admin Login:** `/admin/login` (separate UI)  
✅ **User Login:** `/login` (customer facing)  
✅ **Different redirects after login**

---

## 7️⃣ Booking Status Definitions

### BookingStatus Flow

```
PENDING → CONFIRMED → COMPLETED
   ↓
CANCELLED
```

#### Status Definitions

**PENDING** (Default after payment)
- Payment received successfully
- Waiting for admin confirmation
- Booking is tentative but paid
- Customer receives "Payment Successful" email
- **Next Action:** Admin confirms or contacts customer

**CONFIRMED**
- Admin has reviewed and confirmed booking
- Villa is officially reserved
- Customer receives "Booking Confirmed" email
- Appears in confirmed bookings list
- **Next Action:** Wait for check-in date

**CANCELLED**
- Booking has been cancelled
- Can be cancelled by: Admin, User (within policy)
- Triggers refund process (if applicable)
- Customer receives "Cancellation Confirmation" email
- **Terminal State** (no further changes)

**COMPLETED**
- Check-out has been completed
- Guest has left the villa
- Review/feedback can be requested
- Used for historical reporting
- **Terminal State** (no further changes)

### PaymentStatus Flow

```
PENDING → PAID → REFUNDED (if cancelled)
   ↓
FAILED
```

#### Status Definitions

**PENDING**
- PaymentIntent created but not confirmed
- User is on payment page
- Card has not been charged yet
- **Timeout:** Auto-cancel after 30 minutes

**PAID**
- Payment successfully charged
- Stripe confirmed the payment
- Money is in account (pending settlement)
- **This triggers booking creation**

**FAILED**
- Payment attempt declined
- Card insufficient funds / expired / blocked
- Customer receives "Payment Failed" email
- **Action:** Allow retry or use different card

**REFUNDED**
- Full or partial refund issued
- Original payment reversed
- Takes 5-10 business days to customer
- Customer receives "Refund Processed" email

---

## 8️⃣ Implementation Checklist

### Phase 1: Environment Setup (15 min)
- [ ] Get Stripe test API keys from [stripe.com/dashboard](https://dashboard.stripe.com/test/apikeys)
- [ ] Add `STRIPE_SECRET_KEY` to `.env`
- [ ] Add `STRIPE_PUBLISHABLE_KEY` to `.env`
- [ ] Get Resend API key from [resend.com](https://resend.com/api-keys)
- [ ] Add `RESEND_API_KEY` to `.env`
- [ ] Verify domain in Resend dashboard
- [ ] Set `RESEND_FROM_EMAIL` in `.env`

### Phase 2: Payment API Routes (1.5 hours)
- [ ] Create `src/app/api/payments/create-intent/route.ts`
  - Validate booking data
  - Check availability before creating intent
  - Calculate total amount with fees
  - Create Stripe PaymentIntent
  - Return clientSecret to client
- [ ] Create `src/app/api/payments/webhook/route.ts`
  - Verify Stripe webhook signature
  - Handle `payment_intent.succeeded` event
  - Create Booking + Payment records
  - Send confirmation email
  - Handle `payment_intent.failed` event
- [ ] Set up webhook endpoint in Stripe Dashboard
  - URL: `https://yourdomain.com/api/payments/webhook`
  - Events: `payment_intent.succeeded`, `payment_intent.failed`
  - Get webhook secret → Add to `.env`

### Phase 3: Payment UI (1 hour)
- [ ] Update `src/components/booking/BookingForm.tsx`
  - Keep form as-is for data collection
  - On submit → Navigate to payment page
- [ ] Update `src/components/StripePayment.tsx`
  - Call `/api/payments/create-intent`
  - Use Stripe Elements for card input
  - Confirm payment client-side
  - Handle 3D Secure authentication
  - Show success/error messages
  - Redirect to success page

### Phase 4: Email Templates (1 hour)
- [ ] Install `@react-email/components` (if not installed)
- [ ] Create `src/lib/email/templates/booking-confirmation.tsx`
  - Responsive HTML email
  - Include all booking details
  - Price breakdown
  - Contact information
- [ ] Create `src/lib/email/templates/payment-receipt.tsx`
  - Official receipt format
  - Transaction details
- [ ] Update `src/services/email.service.ts`
  - Add `sendBookingConfirmation()` function
  - Add `sendPaymentReceipt()` function

### Phase 5: Testing (1 hour)
- [ ] Test with Stripe test cards
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - 3D Secure: `4000 0025 0000 3155`
- [ ] Verify webhook receives events
- [ ] Check booking created in database
- [ ] Verify email sent successfully
- [ ] Test error handling (network issues, declined cards)
- [ ] Test on different browsers

### Phase 6: Admin Interface (30 min)
- [ ] Verify admin can view bookings
- [ ] Test booking status updates
- [ ] Check payment details display correctly
- [ ] Test filtering and search

---

## 9️⃣ API Endpoints Required

### 9.1 Create Payment Intent
**Endpoint:** `POST /api/payments/create-intent`

**Request Body:**
```typescript
{
  villaId: string;
  checkInDate: string;      // ISO 8601
  checkOutDate: string;     // ISO 8601
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
  totalAmount: number;      // In THB
  currency: "THB";
}
```

**Response (Success):**
```typescript
{
  success: true;
  data: {
    clientSecret: string;     // For stripe.confirmCardPayment()
    paymentIntentId: string;  // For reference
    amount: number;           // Total in smallest unit (satang)
  }
}
```

**Response (Error):**
```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "UNAVAILABLE" | "STRIPE_ERROR";
    message: string;
  }
}
```

### 9.2 Stripe Webhook Handler
**Endpoint:** `POST /api/payments/webhook`

**Headers:**
```
stripe-signature: string
```

**Body:** Raw Stripe event (don't parse JSON manually)

**Events to Handle:**
1. `payment_intent.succeeded`
   - Create Booking record (status: PENDING)
   - Create Payment record (status: PAID, save paymentIntentId)
   - Send booking confirmation email
   - Return 200 OK

2. `payment_intent.failed`
   - Log failure
   - Send payment failed email (optional)
   - Return 200 OK

**Response:**
```typescript
{
  received: true
}
```

### 9.3 Check Availability (Existing)
**Endpoint:** `POST /api/villas/{slug}/availability`

**Request Body:**
```typescript
{
  checkInDate: string;   // ISO 8601
  checkOutDate: string;  // ISO 8601
}
```

**Response:**
```typescript
{
  success: true;
  available: boolean;
  checkInDate: string;
  checkOutDate: string;
  pricing?: {
    nights: number;
    basePrice: number;
    effectiveRate: number;
    discountLabel?: string;
    baseTotal: number;
    discountAmount: number;
    serviceFee: number;
    cleaningFee: number;
    taxes: number;
    totalPrice: number;
    currency: "THB";
  }
}
```

---

## 🔐 Security Considerations

### Stripe Security
1. **Never expose secret key** - Only use on server-side
2. **Verify webhook signature** - Use `stripe.webhooks.constructEvent()`
3. **Validate amounts** - Recalculate total server-side, don't trust client
4. **HTTPS only** - Stripe requires SSL in production
5. **Idempotency keys** - Prevent duplicate payments

### Payment Data
1. **Never store card details** - Let Stripe handle it
2. **Log PaymentIntent IDs** - For dispute resolution
3. **Double-check availability** - Before creating PaymentIntent
4. **Rate limiting** - Prevent payment spam attempts

### Email Security
1. **Validate email addresses** - Use proper regex
2. **Sanitize user input** - Prevent email injection
3. **SPF/DKIM/DMARC** - Configure for domain
4. **Unsubscribe links** - Required by law

---

## 📞 Support & Resources

### Stripe Documentation
- PaymentIntents API: https://stripe.com/docs/payments/payment-intents
- Webhooks: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing

### Resend Documentation
- Getting Started: https://resend.com/docs
- React Email: https://react.email/docs

### Next.js API Routes
- Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## ✅ Definition of Done

Payment integration is considered **COMPLETE** when:

- [ ] User can complete full booking flow with Stripe payment
- [ ] Payment is processed and money reaches Stripe account
- [ ] Booking and Payment records created in database correctly
- [ ] Confirmation email sent automatically after payment
- [ ] Admin can view bookings and payment details
- [ ] Webhooks working in both test and production
- [ ] Error handling covers all failure scenarios
- [ ] Tested with all Stripe test cards
- [ ] No console errors or warnings
- [ ] Code reviewed and approved
- [ ] Deployed to production successfully

---

**Document Version:** 1.0  
**Last Updated:** December 30, 2025  
**Prepared By:** GitHub Copilot  
**For:** Developer Implementation Team

**Questions?** Contact project owner or refer to:
- [NEXT_TASKS_PLAN.md](./NEXT_TASKS_PLAN.md) - Overall project plan
- [PROJECT_STATUS_REPORT_DEC30.md](./PROJECT_STATUS_REPORT_DEC30.md) - Current status

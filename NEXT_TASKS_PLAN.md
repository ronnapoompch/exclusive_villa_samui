# 🎯 งานถัดไปตามแผนโปรเจค (NEXT TASKS)
**อัพเดต:** 30 ธันวาคม 2025  
**สถานะปัจจุบัน:** 95% Complete - PRODUCTION READY  
**อ้างอิงจาก:** PROJECT_STATUS_REPORT_DEC30.md, ACTION_PLAN.md

---

## 🔴 HIGH PRIORITY - ต้องทำก่อน Go-Live

### 1. 💳 Payment Integration (Stripe)
**เวลาประมาณ:** 4-5 ชั่วโมง  
**ความสำคัญ:** 🔥🔥🔥 CRITICAL

#### Files ที่ต้องแก้ไข:
```
src/app/api/payments/create-intent/route.ts
src/app/api/payments/confirm/route.ts
src/app/api/payments/webhook/route.ts
src/components/booking/payment-form.tsx
```

#### Tasks:
- [ ] **Fix Stripe Webhook Handlers**
  - Verify webhook signature
  - Handle payment_intent.succeeded event
  - Handle payment_intent.failed event
  - Update booking status in database
  
- [ ] **Complete Payment Confirmation Flow**
  - Create payment intent with correct amount
  - Handle 3D Secure authentication
  - Confirm payment and update UI
  - Show confirmation message
  
- [ ] **Add Payment Status Tracking**
  - Save payment status to database
  - Display payment history to users
  - Admin view of all payments
  
- [ ] **Receipt Generation**
  - Generate PDF receipt
  - Email receipt to customer
  - Admin can resend receipts

#### Current Status:
⚠️ **Code exists but incomplete**
- Stripe SDK installed ✅
- Environment variables configured ✅
- Basic payment form exists ✅
- Webhook handlers need completion ❌
- Payment confirmation flow incomplete ❌

#### How to Start:
```bash
# 1. Test current Stripe setup
cd src/app/api/payments
# Review existing code in create-intent/route.ts

# 2. Set up Stripe webhook locally
stripe listen --forward-to localhost:3000/api/payments/webhook

# 3. Test payment flow
npm run dev
# Navigate to /booking/[slug] and test payment
```

---

### 2. 📧 Booking Confirmation Email
**เวลาประมาณ:** 2-3 ชั่วโมง  
**ความสำคัญ:** 🔥🔥🔥 CRITICAL

#### Files ที่ต้องสร้าง/แก้ไข:
```
src/lib/email/templates/booking-confirmation.tsx (NEW)
src/lib/email/templates/welcome.tsx (NEW)
src/lib/email/templates/payment-receipt.tsx (NEW)
src/lib/email/sender.ts (UPDATE)
src/app/api/bookings/create/route.ts (UPDATE)
```

#### Tasks:
- [ ] **Design Email Templates**
  - Booking confirmation template (HTML + React Email)
  - Welcome email for new users
  - Payment receipt template
  - Include villa details, dates, pricing
  
- [ ] **Integrate with Resend API**
  - Configure Resend sender domain
  - Test email delivery
  - Handle email failures gracefully
  
- [ ] **Trigger Email Sending**
  - After successful booking creation
  - After successful payment
  - Welcome email on user registration
  
- [ ] **Email Content**
  - Villa name and images
  - Booking dates and duration
  - Total price breakdown
  - Cancellation policy
  - Contact information

#### Current Status:
⚠️ **Forgot password email works, need booking templates**
- Resend API configured ✅
- Email sender module exists ✅
- Forgot password template works ✅
- Booking templates missing ❌
- Email triggers not implemented ❌

#### Example Template Structure:
```typescript
// src/lib/email/templates/booking-confirmation.tsx
import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components';

interface BookingConfirmationEmailProps {
  villaName: string;
  villaImage: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  guestName: string;
  bookingId: string;
}

export default function BookingConfirmationEmail(props: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Section>
            <Text>สวัสดีคุณ {props.guestName}</Text>
            <Text>ขอบคุณที่จอง {props.villaName}</Text>
            {/* ... villa details ... */}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

---

### 3. 👨‍💼 Admin Booking Management
**เวลาประมาณ:** 3-4 ชั่วโมง  
**ความสำคัญ:** 🔥🔥 HIGH

#### Files ที่ต้องแก้ไข:
```
src/app/admin/bookings/page.tsx (UPDATE)
src/components/admin/BookingList.tsx (NEW)
src/components/admin/BookingDetails.tsx (NEW)
src/app/api/admin/bookings/route.ts (UPDATE)
src/app/api/admin/bookings/[id]/route.ts (NEW)
```

#### Tasks:
- [ ] **View All Bookings**
  - List all bookings with pagination
  - Show booking status (pending, confirmed, cancelled)
  - Filter by date, status, villa
  - Search by guest name or booking ID
  
- [ ] **Update Booking Status**
  - Confirm booking
  - Mark as checked-in
  - Mark as checked-out
  - Cancel booking
  
- [ ] **Booking Details Page**
  - Full booking information
  - Guest details
  - Payment history
  - Villa information
  - Action buttons
  
- [ ] **Export & Reports**
  - Export bookings to Excel
  - Monthly revenue report
  - Occupancy rate statistics

#### Current Status:
⚠️ **Basic UI exists, need full functionality**
- Admin dashboard exists ✅
- Basic bookings page exists ✅
- No filtering/search ❌
- No status update functionality ❌
- No detailed view ❌

#### UI Components Needed:
```typescript
// src/components/admin/BookingList.tsx
interface Booking {
  id: string;
  villaName: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
}

export default function BookingList() {
  // Table with filters, search, pagination
  // Actions: View, Confirm, Cancel
}
```

---

## 🟡 MEDIUM PRIORITY - After Go-Live

### 4. ⭐ User Reviews System
**เวลาประมาณ:** 4-5 ชั่วโมง

#### Tasks:
- [ ] Review submission form
- [ ] Rating display (stars)
- [ ] Review moderation (admin)
- [ ] Display reviews on villa pages
- [ ] Average rating calculation

#### Files:
```
src/app/api/reviews/route.ts (NEW)
src/components/ReviewForm.tsx (NEW)
src/components/ReviewList.tsx (NEW)
```

---

### 5. 🌐 Multi-language Support
**เวลาประมาณ:** 6-8 ชั่วโมง

#### Languages:
- English (EN) - Primary
- Thai (TH) - Local
- Chinese (ZH) - Tourism
- Russian (RU) - Tourism

#### Tasks:
- [ ] Install next-intl or similar
- [ ] Create translation files
- [ ] Update all pages with translations
- [ ] Language switcher UI
- [ ] Persist language preference

---

### 6. 📊 Advanced Analytics
**เวลาประมาณ:** 3-4 ชั่วโมง

#### Tasks:
- [ ] Booking statistics dashboard
- [ ] Revenue charts (monthly, yearly)
- [ ] Popular villas tracking
- [ ] Occupancy rate visualization
- [ ] Export reports to PDF/Excel

---

## 🟢 LOW PRIORITY - Future Enhancements

### 7. 🔗 Channel Manager Integration
**เวลาประมาณ:** 10-15 ชั่วโมง

#### Integrations:
- [ ] Airbnb API synchronization
- [ ] Booking.com integration
- [ ] Real-time availability updates
- [ ] Automatic price sync

---

### 8. 📱 Mobile App
**เวลาประมาณ:** 40-60 ชั่วโมง

#### Platforms:
- [ ] iOS app (React Native)
- [ ] Android app (React Native)
- [ ] Push notifications
- [ ] Offline mode

---

## 📅 แผนการทำงานแนะนำ (Recommended Timeline)

### Week 1 (31 ธ.ค. - 5 ม.ค.)
- **Day 1-2:** Payment Integration (Stripe)
- **Day 3:** Booking Confirmation Email
- **Day 4-5:** Admin Booking Management

### Week 2 (6-12 ม.ค.)
- **Testing & Bug Fixes**
- **Performance Optimization**
- **Security Audit**
- **Go-Live Preparation**

### Week 3+ (After Go-Live)
- User Reviews System
- Multi-language Support
- Advanced Analytics

---

## 🚀 การเริ่มต้นงานแต่ละหัวข้อ

### Option 1: เริ่มจาก Payment Integration
```bash
# 1. Review current code
code src/app/api/payments/create-intent/route.ts

# 2. Test Stripe webhook locally
stripe listen --forward-to localhost:3000/api/payments/webhook

# 3. Update payment confirmation flow
code src/components/booking/payment-form.tsx
```

### Option 2: เริ่มจาก Email Templates
```bash
# 1. Install React Email components (if not installed)
npm install @react-email/components

# 2. Create booking confirmation template
code src/lib/email/templates/booking-confirmation.tsx

# 3. Test email sending
npm run dev
# Test from booking form
```

### Option 3: เริ่มจาก Admin Bookings
```bash
# 1. Check current admin page
code src/app/admin/bookings/page.tsx

# 2. Create BookingList component
code src/components/admin/BookingList.tsx

# 3. Add API endpoints for booking management
code src/app/api/admin/bookings/route.ts
```

---

## 🎯 คำแนะนำ (Recommendations)

### ลำดับความสำคัญแนะนำ:
1. **Payment Integration** - จำเป็นที่สุดสำหรับ revenue
2. **Email System** - ปรับปรุง customer experience
3. **Admin Bookings** - จัดการ operations

### เหตุผล:
- ไม่มี payment system → ไม่สามารถเก็บเงินได้
- ไม่มี email → customer confused หลังจอง
- ไม่มี admin management → ยากต่อการ operate

### เวลารวมทั้งหมด:
- High Priority: 9-12 ชั่วโมง (1-2 วันทำงาน)
- Medium Priority: 13-17 ชั่วโมง (2-3 วันทำงาน)
- Low Priority: 50+ ชั่วโมง (2-3 สัปดาห์)

---

## ✅ Checklist ก่อนเริ่มงานแต่ละ Task

### สำหรับ Payment Integration:
- [ ] Stripe API keys ครบถ้วน
- [ ] Stripe CLI ติดตั้งแล้ว
- [ ] เข้าใจ Stripe payment flow
- [ ] ทดสอบด้วย test card numbers

### สำหรับ Email System:
- [ ] Resend API key active
- [ ] Sender domain verified
- [ ] React Email installed
- [ ] Email templates designed (mockup)

### สำหรับ Admin Bookings:
- [ ] เข้าใจ booking data structure
- [ ] ออกแบบ UI/UX (wireframe)
- [ ] กำหนด permissions (role-based)
- [ ] เตรียม test data

---

**🎯 ข้อเสนะนำ:** เริ่มจาก **Payment Integration** เพราะเป็น critical path สำหรับ revenue generation และมี impact สูงสุดต่อ business

**⏰ เวลาโดยรวมถึง Go-Live:** 1-2 สัปดาห์ (หากทำ high priority tasks ทั้งหมด)

# Channel Manager Integration - Current Status & Roadmap

**Date:** October 27, 2025  
**Project:** Exclusive Villa Samui  
**Purpose:** แผนการเชื่อมต่อ Channel Manager เพื่อดึงข้อมูลวิลล่าและราคา real-time

---

## 🎯 Priority Villas for Phase 1 Integration

**Total:** 9 villas (excluding "The One" - not found in Excel)  
**Status:** ✅ All verified in database  
**Configuration:** `src/lib/config/priority-villas.ts`

### Priority Villa List

| # | Website Name | Real Name (Excel) | Bedrooms | Location | Slug |
|---|--------------|-------------------|----------|----------|------|
| 1 | 5 Stars beachfront Villa | 5 House (5BR) | 5 | Maret | `5-stars-beachfront-villa` |
| 2 | Alicia Serenity A3 | Ariya Residence A3 (5BR) | 5 | Maret | `alicia-serenity-a3` |
| 3 | Anzhu Serenity | Anzhu Seamate (3BR) | 3 | Lamai | `anzhu-serenity` |
| 4 | La Mirage | La Moon (4BR) | 3* | Plailaem | `kieren-villa-mirage` |
| 5 | Kieren Villa Grace | Kerem Villa Gamay (Upper) | 3 | Plailaem | `kieren-villa-grace` |
| 6 | The Wavora 1 - Deluxe Sea View 3BR | The Wave 1 - Deluxe Sea View 3BR | 3 | Chaweng Noi | `the-wavora-1-deluxe-sea-view-3br` |
| 7 | Millennial Residence Villa Solara | Miskawaan Residence Villa Sila | 7 | Maenam | `millennial-residence-villa-solara` |
| 8 | The Clay Haven | Tish: Clay Hut (2BR) | 2 | Plailaem | `the-clay-haven` |
| 9 | Zulu Vista A1 | Zog Villas A1 Banana Fan (2BR) | 2 | Maenam | `zulu-vista-a1` |

*Note: La Mirage shows 4BR in Excel but 3BR in database - needs verification*

### Distribution Summary
- **Locations:** Maret (2), Lamai (1), Plailaem (3), Chaweng Noi (1), Maenam (2)
- **Bedrooms:** 2BR (2 villas), 3BR (4 villas), 5BR (2 villas), 7BR (1 villa)
- **Average Size:** 3.8 bedrooms

### Current Integration Status
- ❌ **Airbnb URLs:** 0/9 villas have Airbnb URL in database
- ❌ **Agoda URLs:** 0/9 villas have Agoda URL in database  
- ❌ **Official Websites:** 0/9 villas have official website URL
- ⏳ **Needs:** Platform URLs and channel manager mapping IDs

---

## 📊 Current System Status

### ✅ COMPLETED FEATURES

#### 1. **Airbnb Calendar Sync (iCal Feed)** ✅
**Status:** Fully Implemented & Tested  
**Files:**
- `src/lib/calendar/ical-sync.ts` - iCal parsing utilities
- `sync-airbnb-calendar.js` - Sync script
- `test-airbnb-sync.js` - Test script

**What It Does:**
- ✅ Fetches iCal feed from Airbnb URL
- ✅ Parses VEVENT entries (bookings)
- ✅ Stores blocked dates as date ranges in database
- ✅ Updates BlockedDate table automatically

**Current Capabilities:**
- ✅ Single villa sync (5 Stars beachfront Villa)
- ✅ 7 blocked periods imported successfully
- ✅ Date range: Oct 2025 - Oct 2026
- ✅ Source tracking: `airbnb` tag

**Limitations:**
- ⚠️ Manual execution only (no cron job)
- ⚠️ Hardcoded villa slug
- ⚠️ No pricing data (only availability)
- ⚠️ One-way sync (Airbnb → Database only)

**Test Results:**
```
✅ Parsed 7 events successfully
✅ Created 7 BlockedDate records
✅ Storage: 94% more efficient (7 vs 112 records)
✅ Query performance: <1ms with indexes
```

---

#### 2. **Database Schema for Availability** ✅
**Status:** Production Ready  
**File:** `prisma/schema.prisma`

**BlockedDate Model:**
```prisma
model BlockedDate {
  id         String   @id @default(cuid())
  villaId    String
  villa      Villa    @relation(fields: [villaId], references: [id])
  startDate  DateTime
  endDate    DateTime
  reason     String?
  source     String   @default("manual")  // airbnb, booking.com, vrbo, manual
  externalId String?                       // For sync tracking
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([villaId])
  @@index([startDate, endDate])
}
```

**What's Ready:**
- ✅ Supports multiple sources (airbnb, booking.com, vrbo, manual)
- ✅ Date range storage (efficient)
- ✅ External ID for sync management
- ✅ Indexed for fast queries

**What's Missing:**
- ❌ No pricing data model
- ❌ No seasonal rate structure
- ❌ No minimum stay requirements
- ❌ No booking rules (lead time, etc.)

---

#### 3. **Villa Data Management** ✅
**Status:** Completed with Excel Import

**Villa Model (Current):**
```prisma
model Villa {
  id                String    @id @default(cuid())
  slug              String    @unique
  name              String
  location          String
  bedrooms          String    // "3-4", "5-6", etc.
  bathrooms         String
  guests            String
  size              String?
  beachfront        Boolean   @default(false)
  description       String?
  amenities         Json?
  images            Json?
  cloudinaryImages  Json?
  forRent           Boolean   @default(true)
  forSale           Boolean   @default(false)
  salePrice         String?
  excelRowNumber    Int?
  airbnbUrl         String?
  bookingUrl        String?
  vrboUrl           String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  blockedDates      BlockedDate[]
  bookings          Booking[]
}
```

**Current Data:**
- ✅ 226 villas imported from Excel
- ✅ Fixed bedroom/bathroom data (was showing date serial numbers)
- ✅ Cloudinary images uploaded
- ✅ Amenities structured
- ✅ Platform URLs stored (airbnbUrl, bookingUrl, vrboUrl)

**What's Available for Channel Manager:**
- ✅ Villa basic info (name, location, capacity)
- ✅ Platform URLs (can be used for API mapping)
- ✅ Images (Cloudinary)
- ❌ No pricing structure
- ❌ No channel mapping IDs
- ❌ No rate plans

---

### ❌ NOT IMPLEMENTED YET

#### 1. **Real-Time Pricing from Channel Manager** ❌
**Status:** Not Started

**What's Missing:**
- ❌ No PriceRate table/model
- ❌ No API integration with any channel manager
- ❌ No pricing sync script
- ❌ No seasonal rate structure
- ❌ No dynamic pricing logic

**Current Workaround:**
- Static price display only
- No real-time rate updates
- Manual price management

**What's Needed:**
```prisma
// PROPOSED: PriceRate model
model PriceRate {
  id          String   @id @default(cuid())
  villaId     String
  villa       Villa    @relation(fields: [villaId], references: [id])
  startDate   DateTime
  endDate     DateTime
  pricePerNight Int    // In THB
  currency    String   @default("THB")
  minStay     Int?     // Minimum nights
  source      String   // channel-manager, manual, airbnb, booking
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([villaId])
  @@index([startDate, endDate])
}
```

---

#### 2. **Channel Manager API Integration** ❌
**Status:** Not Started

**Popular Channel Managers for Villa Rentals:**

**Option A: Guesty** (Recommended for luxury villas)
- API: REST API, webhooks
- Features: Pricing, availability, bookings, messaging
- Platforms: Airbnb, Booking.com, VRBO, Expedia
- Pricing: ~$9-39/listing/month
- Documentation: https://docs.guesty.com/

**Option B: Hostaway**
- API: REST API, webhooks
- Features: Full PMS, channel management
- Platforms: 100+ OTAs
- Pricing: ~$5-15/listing/month
- Documentation: https://api.hostaway.com/

**Option C: Lodgify**
- API: REST API
- Features: Website builder + channel manager
- Best for: Small to medium properties
- Pricing: ~$16-39/month
- Documentation: https://docs.lodgify.com/

**Option D: Beds24**
- API: REST/JSON API
- Features: Basic channel manager
- Best for: Budget option
- Pricing: ~€2-5/property/month
- Documentation: https://www.beds24.com/api/

**What We Need:**
1. Choose channel manager platform
2. Get API credentials
3. Map villa IDs to channel manager property IDs
4. Implement OAuth/API key authentication
5. Create sync endpoints

---

#### 3. **Availability API Endpoint** ❌
**Status:** Not Implemented

**Needed For:**
- Booking form validation
- Calendar display
- Real-time availability check

**Proposed Implementation:**
```typescript
// src/app/api/villas/[slug]/availability/route.ts
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { checkIn, checkOut } = await request.json();
  
  const villa = await prisma.villa.findUnique({
    where: { slug: params.slug },
    include: {
      blockedDates: {
        where: {
          startDate: { lte: new Date(checkOut) },
          endDate: { gte: new Date(checkIn) }
        }
      }
    }
  });
  
  return Response.json({
    available: villa.blockedDates.length === 0,
    blockedPeriods: villa.blockedDates
  });
}
```

**Current Status:** ❌ File doesn't exist

---

#### 4. **Pricing API Endpoint** ❌
**Status:** Not Implemented

**Needed For:**
- Display nightly rates on villa pages
- Calculate booking totals
- Show seasonal pricing

**Proposed Implementation:**
```typescript
// src/app/api/villas/[slug]/pricing/route.ts
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { checkIn, checkOut } = await request.json();
  
  // Get pricing for date range
  const priceRates = await prisma.priceRate.findMany({
    where: {
      villa: { slug: params.slug },
      startDate: { lte: new Date(checkOut) },
      endDate: { gte: new Date(checkIn) }
    }
  });
  
  // Calculate total
  const total = calculateTotalPrice(priceRates, checkIn, checkOut);
  
  return Response.json({
    pricePerNight: total.avgPerNight,
    totalPrice: total.total,
    nights: total.nights,
    breakdown: total.breakdown
  });
}
```

**Current Status:** ❌ File doesn't exist

---

#### 5. **Booking Form Integration** ❌
**Status:** Basic form exists, no real-time validation

**Current BookingForm.tsx:**
- ✅ Date picker
- ✅ Guest count
- ✅ Contact info
- ❌ No availability check before submit
- ❌ No price calculation
- ❌ No blocked date highlighting in calendar

**What's Needed:**
```typescript
// Before booking submission
const checkAvailability = async () => {
  const response = await fetch(`/api/villas/${slug}/availability`, {
    method: 'POST',
    body: JSON.stringify({ checkIn, checkOut })
  });
  
  const { available, blockedPeriods } = await response.json();
  
  if (!available) {
    setError('Selected dates are not available');
    return false;
  }
  
  // Get pricing
  const priceResponse = await fetch(`/api/villas/${slug}/pricing`, {
    method: 'POST',
    body: JSON.stringify({ checkIn, checkOut })
  });
  
  const { totalPrice, pricePerNight } = await priceResponse.json();
  setBookingTotal(totalPrice);
  
  return true;
};
```

---

#### 6. **Automated Calendar Sync (Cron Job)** ❌
**Status:** Manual execution only

**What's Missing:**
- ❌ No scheduled execution
- ❌ No error monitoring
- ❌ No sync history logging
- ❌ No alert system for failed syncs

**Options for Implementation:**

**Option A: Vercel Cron** (If hosting on Vercel)
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-airbnb",
      "schedule": "0 */6 * * *"  // Every 6 hours
    },
    {
      "path": "/api/cron/sync-channel-manager",
      "schedule": "0 */1 * * *"  // Every hour
    }
  ]
}
```

**Option B: GitHub Actions**
```yaml
# .github/workflows/sync-calendars.yml
name: Sync Calendars
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npx tsx sync-airbnb-calendar.js
      - run: npx tsx sync-channel-manager.js
```

**Option C: Node-Cron (Self-hosted)**
```javascript
// server/cron.js
const cron = require('node-cron');
const { syncAirbnb } = require('./sync-airbnb');
const { syncChannelManager } = require('./sync-channel-manager');

// Every 6 hours for Airbnb (iCal updates slowly)
cron.schedule('0 */6 * * *', async () => {
  console.log('Running Airbnb sync...');
  await syncAirbnb();
});

// Every hour for Channel Manager (real-time pricing)
cron.schedule('0 * * * *', async () => {
  console.log('Running Channel Manager sync...');
  await syncChannelManager();
});
```

**Current Status:** ❌ Not implemented

---

#### 7. **Multi-Villa Calendar Sync** ❌
**Status:** Single villa only

**Current Implementation:**
- Hardcoded: `VILLA_SLUG = '5-stars-beachfront-villa'`
- Hardcoded: Single iCal URL

**What's Needed:**
```javascript
// sync-all-villas.js
const villas = await prisma.villa.findMany({
  where: {
    OR: [
      { airbnbUrl: { not: null } },
      { bookingUrl: { not: null } },
      { vrboUrl: { not: null } }
    ]
  }
});

for (const villa of villas) {
  // Sync Airbnb
  if (villa.airbnbIcalUrl) {
    await syncICalFeed(villa.id, villa.airbnbIcalUrl, 'airbnb');
  }
  
  // Sync Booking.com
  if (villa.bookingIcalUrl) {
    await syncICalFeed(villa.id, villa.bookingIcalUrl, 'booking');
  }
  
  // Sync VRBO
  if (villa.vrboIcalUrl) {
    await syncICalFeed(villa.id, villa.vrboIcalUrl, 'vrbo');
  }
}
```

**Database Changes Needed:**
```prisma
model Villa {
  // Add iCal URLs for each platform
  airbnbIcalUrl   String?
  bookingIcalUrl  String?
  vrboIcalUrl     String?
  
  // Add Channel Manager mapping
  channelManagerId String?
  channelManagerPropertyId String?
}
```

---

#### 8. **Sync History & Monitoring** ❌
**Status:** No logging system

**What's Missing:**
- ❌ No sync execution history
- ❌ No error tracking
- ❌ No success/failure reporting
- ❌ No admin dashboard for sync status

**Proposed SyncLog Model:**
```prisma
model SyncLog {
  id          String   @id @default(cuid())
  villaId     String?
  villa       Villa?   @relation(fields: [villaId], references: [id])
  source      String   // airbnb, booking, channel-manager
  syncType    String   // availability, pricing, both
  status      String   // success, failed, partial
  recordsAdded Int     @default(0)
  recordsUpdated Int   @default(0)
  recordsDeleted Int   @default(0)
  errorMessage String?
  duration    Int?     // Milliseconds
  createdAt   DateTime @default(now())
  
  @@index([source])
  @@index([createdAt])
}
```

---

## 🎯 CHANNEL MANAGER INTEGRATION ROADMAP

### Phase 1: Foundation (Week 1-2)
**Goal:** Prepare system for Channel Manager integration

**Tasks:**
1. ✅ Database schema ready (BlockedDate exists)
2. ❌ Create PriceRate model
3. ❌ Add Channel Manager fields to Villa model
4. ❌ Add SyncLog model for monitoring
5. ❌ Run Prisma migration

**Estimated Time:** 4-6 hours

---

### Phase 2: Choose & Setup Channel Manager (Week 2-3)
**Goal:** Select platform and get API access

**Decision Criteria:**
- Budget: How much per villa/month?
- API Quality: REST? Webhooks? Rate limits?
- Platforms: Covers Airbnb, Booking.com, VRBO?
- Features: Pricing sync? Messaging? Reports?

**Recommended: Guesty or Hostaway**
- Best API documentation
- Proven for luxury villas
- Real-time pricing & availability
- Webhook support

**Tasks:**
1. ❌ Sign up for trial account
2. ❌ Map 5-10 test villas
3. ❌ Get API credentials
4. ❌ Test API endpoints in Postman
5. ❌ Review rate limits & quotas

**Estimated Time:** 1 week (includes trial period)

---

### Phase 3: Build API Integration (Week 3-4)
**Goal:** Create sync scripts for availability + pricing

**File Structure:**
```
src/
├── lib/
│   └── channel-manager/
│       ├── client.ts              # API client
│       ├── availability-sync.ts   # Sync blocked dates
│       ├── pricing-sync.ts        # Sync rates
│       └── types.ts               # TypeScript types
├── app/
│   └── api/
│       ├── cron/
│       │   ├── sync-availability/
│       │   │   └── route.ts
│       │   └── sync-pricing/
│       │       └── route.ts
│       └── villas/
│           └── [slug]/
│               ├── availability/
│               │   └── route.ts
│               └── pricing/
│                   └── route.ts
└── scripts/
    ├── sync-channel-availability.js
    └── sync-channel-pricing.js
```

**Tasks:**
1. ❌ Create API client with authentication
2. ❌ Implement availability sync
3. ❌ Implement pricing sync
4. ❌ Test with 1 villa
5. ❌ Add error handling & retries
6. ❌ Add logging to SyncLog

**Estimated Time:** 12-16 hours

---

### Phase 4: Create Frontend APIs (Week 4)
**Goal:** Expose availability & pricing to booking form

**Endpoints Needed:**
```
POST /api/villas/[slug]/availability
- Input: { checkIn, checkOut }
- Output: { available, blockedPeriods }

POST /api/villas/[slug]/pricing
- Input: { checkIn, checkOut, guests }
- Output: { pricePerNight, total, breakdown }

GET /api/villas/[slug]/calendar
- Output: { availableDates, blockedDates, priceCalendar }
```

**Tasks:**
1. ❌ Create availability endpoint
2. ❌ Create pricing endpoint
3. ❌ Create calendar data endpoint
4. ❌ Add caching (Redis or Next.js cache)
5. ❌ Test with Thunder Client

**Estimated Time:** 6-8 hours

---

### Phase 5: Update Booking Form (Week 4-5)
**Goal:** Show real-time availability & pricing

**Features to Add:**
1. ❌ Fetch availability on date change
2. ❌ Block unavailable dates in calendar picker
3. ❌ Display price per night
4. ❌ Calculate & show total price
5. ❌ Show seasonal pricing breakdown
6. ❌ Prevent booking if dates unavailable

**Components to Update:**
- `src/components/BookingForm.tsx`
- `src/components/VillaCard.tsx` (add "from ฿X/night")
- `src/app/villa/[slug]/page.tsx` (show pricing section)

**Estimated Time:** 8-10 hours

---

### Phase 6: Automated Sync (Week 5)
**Goal:** Schedule automatic updates

**Implementation:**
1. ❌ Create Vercel cron jobs OR GitHub Actions
2. ❌ Availability sync: Every 6 hours
3. ❌ Pricing sync: Every 1 hour
4. ❌ Add Sentry for error monitoring
5. ❌ Email alerts on sync failures

**Estimated Time:** 4-6 hours

---

### Phase 7: Admin Dashboard (Week 6)
**Goal:** Monitor sync status

**Features:**
1. ❌ Sync history table (SyncLog)
2. ❌ Last sync time per villa
3. ❌ Error logs
4. ❌ Manual trigger buttons
5. ❌ Villa-to-channel mapping UI

**File:** `src/app/admin/sync-status/page.tsx`

**Estimated Time:** 8-10 hours

---

## 📋 COMPLETE TASK CHECKLIST

### Database & Schema ⏳
- [x] BlockedDate model created
- [x] Priority villa configuration file created
- [ ] PriceRate model created
- [ ] SyncLog model created
- [ ] Villa model updated (add channel manager fields)
- [ ] Run Prisma migration
- [ ] Add database indexes for performance
- [ ] Add platform URLs to priority villas (URGENT)

### Channel Manager Setup 🔴
- [ ] Choose platform (Guesty/Hostaway/Lodgify/Beds24)
- [ ] Create trial account
- [ ] Map 5 test villas
- [ ] Get API credentials
- [ ] Store credentials in .env
### Availability Sync 🟡
- [x] Airbnb iCal sync (single villa) ✅
- [x] Priority villa configuration (9 villas)
- [ ] Gather platform URLs for priority villas (CRITICAL)
- [ ] Convert to multi-villa sync
- [ ] Add Booking.com iCal sync
- [ ] Add VRBO iCal sync
- [ ] Create Channel Manager availability sync
- [ ] Add sync logging
- [ ] Add error handlingager availability sync
- [ ] Add sync logging
- [ ] Add error handling

### Pricing Sync 🔴
- [ ] Create pricing sync script
- [ ] Map channel manager rate plans
- [ ] Handle seasonal pricing
- [ ] Handle minimum stay rules
- [ ] Store in PriceRate table
- [ ] Add sync logging

### API Endpoints 🔴
- [ ] POST /api/villas/[slug]/availability
- [ ] POST /api/villas/[slug]/pricing
- [ ] GET /api/villas/[slug]/calendar
- [ ] POST /api/cron/sync-availability
- [ ] POST /api/cron/sync-pricing
- [ ] Add API rate limiting
- [ ] Add caching

### Frontend Integration 🔴
- [ ] Update BookingForm with availability check
- [ ] Update BookingForm with pricing display
- [ ] Block unavailable dates in date picker
- [ ] Show total price calculation
- [ ] Add loading states
- [ ] Add error messages
- [ ] Update VillaCard with "from ฿X/night"

### Automation 🔴
- [ ] Setup Vercel cron OR GitHub Actions
- [ ] Schedule availability sync (6 hours)
- [ ] Schedule pricing sync (1 hour)
- [ ] Add error monitoring (Sentry)
- [ ] Add email alerts
- [ ] Test cron execution

### Admin Dashboard 🔴
- [ ] Create sync status page
- [ ] Show sync history table
- [ ] Show last sync time per villa
- [ ] Manual sync trigger buttons
- [ ] Villa mapping UI
- [ ] Error log viewer

### Testing & Documentation 🟡
- [x] Test Airbnb sync ✅
- [ ] Test pricing sync
- [ ] Test availability API
- [ ] Test booking form integration
- [ ] Test cron jobs
- [ ] Write API documentation
- [ ] Create admin user guide

---

## 💰 ESTIMATED COSTS

### Channel Manager Subscription
**Guesty:** ~฿300-1,300/villa/month  
**Hostaway:** ~฿150-500/villa/month  
**Beds24:** ~฿70-180/villa/month  

**For 226 villas:**
- Budget option (Beds24): ~฿15,820 - 40,680/month
- Mid-tier (Hostaway): ~฿33,900 - 113,000/month
- Premium (Guesty): ~฿67,800 - 293,800/month

### Development Time
**Total Estimated:** 50-70 hours
**At ฿2,000/hour:** ฿100,000 - 140,000

### Infrastructure
- Vercel Pro (for cron): ~฿600/month
- Sentry (error monitoring): ~฿800/month
- Database (if scaling): ~฿0 (current Supabase free tier OK)

---

## 🚀 RECOMMENDED NEXT STEPS

### Immediate (This Week)
1. **Gather Platform URLs for Priority Villas** - CRITICAL
   - Collect Airbnb listing URLs
   - Collect Booking.com property URLs
   - Collect VRBO/Agoda URLs if available
   - Update database via admin panel or script

2. **Create PriceRate model** - 1 hour
   - Add to Prisma schema
   - Run migration
   - Test with sample data

3. **Choose Channel Manager** - Research 2-3 options
   - Trial sign-up for Guesty/Hostaway
   - Test with 1-2 priority villas
   - Compare pricing and features

### Short Term (Next 2 Weeks)
1. **Implement pricing sync** - 8 hours
   - Build channel manager API client
   - Create pricing sync script
   - Test with priority villas

2. **Create API endpoints** - 6 hours
   - POST /api/villas/[slug]/availability
   - POST /api/villas/[slug]/pricing
   - Add caching layer

3. **Test with real data** - 4 hours
   - Validate sync accuracy
   - Check price calculations
   - Test edge cases

### Medium Term (Next Month)
1. **Update booking form** - 8 hours
   - Real-time availability check
   - Price display and calculation
   - Block unavailable dates in picker

2. **Setup automated sync** - 6 hours
   - Vercel cron or GitHub Actions
   - Error monitoring with Sentry
   - Email alerts on failures

3. **Create admin dashboard** - 10 hours
   - Sync status monitoring
   - Manual trigger buttons
   - Error log viewer

---

## 📋 COMPLETE TASK CHECKLIST

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Pricing API | HIGH | Medium | 🔴 CRITICAL |
| Availability API | HIGH | Low | 🔴 CRITICAL |
| Booking form integration | HIGH | Medium | 🟠 HIGH |
| Multi-villa iCal sync | Medium | Low | 🟠 HIGH |
| Channel Manager sync | HIGH | High | 🟡 MEDIUM |
| Automated cron | Medium | Low | 🟡 MEDIUM |
| Admin dashboard | Low | Medium | 🟢 LOW |

---

## ⚠️ RISKS & MITIGATIONS

### Risk 1: Channel Manager API Limits
**Risk:** Rate limiting breaks sync  
**Mitigation:** Batch requests, add delays, implement queue system

### Risk 2: Price Data Mismatch
**Risk:** Different prices on different platforms  
**Mitigation:** Log all price changes, show source in admin dashboard

### Risk 3: Sync Failures
**Risk:** Silent failures cause outdated availability  
**Mitigation:** Email alerts, sync history logging, manual override

### Risk 4: Cost Overrun
**Risk:** 226 villas × ฿500/month = ฿113,000/month  
**Mitigation:** Start with popular villas only, phase rollout

## 📞 QUESTIONS TO ANSWER

1. **Platform URLs for Priority Villas - URGENT**
   - ✅ Identified 9 priority villas in database
   - ❌ Missing: Airbnb/Booking.com/VRBO URLs for all 9 villas
   - **Action:** Collect and add URLs to database
   - **Priority:** CRITICAL (blocks all integration work)

2. **Which Channel Manager to use?**
   - Budget: Beds24 (~฿70-180/villa/month)
   - Quality: Guesty/Hostaway (~฿150-1,300/villa/month)
   - DIY: Continue with iCal only (no cost, more work)
   - **Recommendation:** Start with iCal for Phase 1 (9 villas)

3. **Pricing display strategy:**
   - Show exact nightly rate? OR
   - Show "from ฿X/night" range?
   - Hide prices until inquiry?
   - **Recommendation:** Show range, exact on inquiry

4. **Booking confirmation:**
   - Instant booking? OR
   - Request to book (manual approval)?
## 📁 FILES STATUS SUMMARY

### ✅ Completed Files
```
✅ prisma/schema.prisma (BlockedDate model)
✅ src/lib/calendar/ical-sync.ts
✅ src/lib/config/priority-villas.ts (NEW)
✅ sync-airbnb-calendar.js
✅ test-airbnb-sync.js
✅ package.json (node-ical installed)
✅ check-priority-villas-db.js (verification script)
✅ analyze-priority-villas.js (Excel analysis)
```

## 📁 FILES STATUS SUMMARY

### ✅ Completed Files
```
✅ prisma/schema.prisma (BlockedDate model)
✅ src/lib/calendar/ical-sync.ts
✅ sync-airbnb-calendar.js
✅ test-airbnb-sync.js
✅ package.json (node-ical installed)
```

### ❌ Not Created Yet
```
❌ src/lib/channel-manager/client.ts
❌ src/lib/channel-manager/availability-sync.ts
❌ src/lib/channel-manager/pricing-sync.ts
❌ src/app/api/villas/[slug]/availability/route.ts
❌ src/app/api/villas/[slug]/pricing/route.ts
❌ src/app/api/cron/sync-availability/route.ts
❌ src/app/api/cron/sync-pricing/route.ts
❌ src/app/admin/sync-status/page.tsx
❌ sync-channel-manager.js
❌ sync-all-villas.js
```

### 🟡 Needs Update
```
🟡 prisma/schema.prisma (add PriceRate, SyncLog)
🟡 src/components/BookingForm.tsx (add real-time checks)
🟡 src/components/VillaCard.tsx (add pricing display)
🟡 src/app/villa/[slug]/page.tsx (add pricing section)
🟡 .env (add channel manager credentials)
🟡 vercel.json (add cron jobs)
```

---

**END OF STATUS REPORT**

**Next Action Required:** Choose Channel Manager platform and create trial account

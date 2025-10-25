# 🗄️ Database Naming Conventions - Exclusive Villa Samui

## 📋 General Rules

1. **Language**: Use English for all database objects
2. **Case**: snake_case for all PostgreSQL objects
3. **Pluralization**: Tables use plural nouns (users, villas, bookings)
4. **Clarity**: Names should be self-documenting
5. **Consistency**: Follow patterns throughout the schema

## 📊 Table Naming

### Core Tables
```sql
-- ✅ Correct: Plural, descriptive names
CREATE TABLE villas (...)
CREATE TABLE users (...)
CREATE TABLE bookings (...)
CREATE TABLE reviews (...)
CREATE TABLE amenities (...)

-- ❌ Incorrect: Singular or unclear
CREATE TABLE villa (...)
CREATE TABLE user_table (...)
CREATE TABLE tbl_booking (...)
```

### Junction Tables (Many-to-Many)
```sql
-- Pattern: [table1]_[table2] (alphabetical order)
CREATE TABLE villa_amenities (
  villa_id UUID REFERENCES villas(id),
  amenity_id UUID REFERENCES amenities(id),
  PRIMARY KEY (villa_id, amenity_id)
);

CREATE TABLE booking_services (
  booking_id UUID REFERENCES bookings(id),
  service_id UUID REFERENCES services(id),
  PRIMARY KEY (booking_id, service_id)
);
```

### Lookup/Reference Tables
```sql
-- Prefix with 'ref_' for static reference data
CREATE TABLE ref_countries (...)
CREATE TABLE ref_currencies (...)
CREATE TABLE ref_languages (...)

-- Prefix with 'enum_' for enumeration tables
CREATE TABLE enum_booking_status (...)
CREATE TABLE enum_payment_methods (...)
CREATE TABLE enum_villa_types (...)
```

## 🔤 Column Naming

### Primary Keys
```sql
-- Always use 'id' for primary keys
CREATE TABLE villas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ...
);
```

### Foreign Keys
```sql
-- Pattern: [referenced_table_singular]_id
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  villa_id UUID REFERENCES villas(id),
  user_id UUID REFERENCES users(id),
  payment_id UUID REFERENCES payments(id)
);
```

### Boolean Columns
```sql
-- Prefix with is_, has_, or can_
CREATE TABLE villas (
  is_available BOOLEAN DEFAULT true,
  has_pool BOOLEAN DEFAULT false,
  has_beach_access BOOLEAN DEFAULT false,
  can_host_events BOOLEAN DEFAULT false,
  is_pet_friendly BOOLEAN DEFAULT false
);
```

### Date/Time Columns
```sql
-- Suffix with _at for timestamps, _date for dates only
CREATE TABLE bookings (
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ, -- Soft delete
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);
```

### Status/Type Columns
```sql
-- Suffix with _status or _type
CREATE TABLE bookings (
  booking_status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  cancellation_type VARCHAR(50)
);

CREATE TABLE villas (
  villa_type VARCHAR(50), -- 'beachfront', 'hillside', 'garden'
  property_type VARCHAR(50) -- 'villa', 'apartment', 'house'
);
```

### Numeric Columns
```sql
-- Be specific about units
CREATE TABLE villas (
  price_per_night_thb DECIMAL(10, 2),
  size_sqm INTEGER,
  max_guests INTEGER,
  bedrooms_count INTEGER,
  bathrooms_count INTEGER,
  distance_to_beach_meters INTEGER
);

-- Percentage as decimal (0.15 = 15%)
CREATE TABLE bookings (
  discount_percentage DECIMAL(5, 4),
  commission_rate DECIMAL(5, 4)
);
```

### JSON/JSONB Columns
```sql
-- Suffix with _data or _json
CREATE TABLE villas (
  amenities_data JSONB,
  location_data JSONB,
  metadata_json JSONB
);

-- Example structure
-- amenities_data: {
--   "kitchen": ["refrigerator", "microwave", "dishwasher"],
--   "entertainment": ["smart_tv", "netflix", "sound_system"],
--   "outdoor": ["bbq", "garden", "pool"]
-- }
```

## 🔑 Index Naming

### Pattern: idx_[table]_[column(s)]
```sql
-- Single column index
CREATE INDEX idx_villas_price ON villas(price_per_night_thb);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);

-- Composite index
CREATE INDEX idx_bookings_villa_dates ON bookings(villa_id, check_in_date, check_out_date);
CREATE INDEX idx_villas_location_type ON villas(location, villa_type);

-- Unique index
CREATE UNIQUE INDEX uniq_users_email ON users(email);
CREATE UNIQUE INDEX uniq_villas_slug ON villas(slug);

-- Partial index
CREATE INDEX idx_bookings_active ON bookings(villa_id) 
WHERE booking_status != 'cancelled';

-- GIN/GIST index for full-text search
CREATE INDEX idx_villas_search ON villas 
USING gin(to_tsvector('english', name || ' ' || description));
```

## 🔐 Constraint Naming

### Pattern: [constraint_type]_[table]_[column(s)]_[suffix]
```sql
-- Primary Key: pk_[table]
ALTER TABLE villas ADD CONSTRAINT pk_villas PRIMARY KEY (id);

-- Foreign Key: fk_[table]_[referenced_table]
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_villas 
FOREIGN KEY (villa_id) REFERENCES villas(id);

-- Unique: uniq_[table]_[column]
ALTER TABLE users 
ADD CONSTRAINT uniq_users_email UNIQUE (email);

-- Check: chk_[table]_[description]
ALTER TABLE bookings 
ADD CONSTRAINT chk_bookings_dates 
CHECK (check_out_date > check_in_date);

ALTER TABLE villas 
ADD CONSTRAINT chk_villas_price_positive 
CHECK (price_per_night_thb > 0);

-- Exclusion constraint for no overlapping bookings
ALTER TABLE bookings 
ADD CONSTRAINT excl_bookings_no_overlap 
EXCLUDE USING gist (
  villa_id WITH =,
  daterange(check_in_date, check_out_date, '[)') WITH &&
) WHERE (booking_status != 'cancelled');
```

## 🔄 Trigger and Function Naming

### Triggers: trg_[table]_[action]_[when]
```sql
-- Update timestamp trigger
CREATE TRIGGER trg_villas_update_timestamp
  BEFORE UPDATE ON villas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger
CREATE TRIGGER trg_bookings_audit_insert
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION audit_booking_changes();
```

### Functions: fn_[action]_[description]
```sql
-- Utility functions
CREATE FUNCTION fn_update_timestamp() RETURNS TRIGGER...
CREATE FUNCTION fn_calculate_booking_total(booking_id UUID) RETURNS DECIMAL...
CREATE FUNCTION fn_check_villa_availability(
  villa_id UUID, 
  check_in DATE, 
  check_out DATE
) RETURNS BOOLEAN...

-- Business logic functions
CREATE FUNCTION fn_apply_seasonal_pricing(
  base_price DECIMAL,
  booking_date DATE
) RETURNS DECIMAL...
```

## 📝 Prisma Schema Example

```prisma
// schema.prisma
model Villa {
  id                    String   @id @default(uuid())
  slug                  String   @unique
  name                  String   @db.VarChar(255)
  description           String   @db.Text
  
  // Location
  address               String   @db.VarChar(500)
  latitude              Float
  longitude             Float
  distanceToBeachMeters Int?     @map("distance_to_beach_meters")
  
  // Specifications
  villaType             VillaType
  maxGuests             Int      @map("max_guests")
  bedroomsCount         Int      @map("bedrooms_count")
  bathroomsCount        Int      @map("bathrooms_count")
  sizeSqm               Int?     @map("size_sqm")
  
  // Pricing
  pricePerNightThb      Decimal  @map("price_per_night_thb") @db.Decimal(10, 2)
  cleaningFeeThb        Decimal? @map("cleaning_fee_thb") @db.Decimal(10, 2)
  
  // Features
  hasPool               Boolean  @default(false) @map("has_pool")
  hasBeachAccess        Boolean  @default(false) @map("has_beach_access")
  hasSeaview            Boolean  @default(false) @map("has_seaview")
  isPetFriendly         Boolean  @default(false) @map("is_pet_friendly")
  
  // Status
  isAvailable           Boolean  @default(true) @map("is_available")
  isFeatured            Boolean  @default(false) @map("is_featured")
  
  // Relationships
  bookings              Booking[]
  reviews               Review[]
  images                VillaImage[]
  amenities             VillaAmenity[]
  
  // Audit fields
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")
  deletedAt             DateTime? @map("deleted_at")
  
  @@index([slug])
  @@index([pricePerNightThb])
  @@index([villaType, isAvailable])
  @@map("villas")
}

model Booking {
  id                String   @id @default(uuid())
  bookingNumber     String   @unique @map("booking_number")
  
  // References
  villaId           String   @map("villa_id")
  villa             Villa    @relation(fields: [villaId], references: [id])
  userId            String   @map("user_id")
  user              User     @relation(fields: [userId], references: [id])
  
  // Dates
  checkInDate       DateTime @map("check_in_date") @db.Date
  checkOutDate      DateTime @map("check_out_date") @db.Date
  
  // Guests
  adultsCount       Int      @map("adults_count")
  childrenCount     Int      @default(0) @map("children_count")
  infantsCount      Int      @default(0) @map("infants_count")
  
  // Pricing
  nightlyRate       Decimal  @map("nightly_rate") @db.Decimal(10, 2)
  totalNights       Int      @map("total_nights")
  subtotalAmount    Decimal  @map("subtotal_amount") @db.Decimal(10, 2)
  cleaningFee       Decimal? @map("cleaning_fee") @db.Decimal(10, 2)
  serviceFee        Decimal? @map("service_fee") @db.Decimal(10, 2)
  taxAmount         Decimal? @map("tax_amount") @db.Decimal(10, 2)
  totalAmount       Decimal  @map("total_amount") @db.Decimal(10, 2)
  
  // Status
  bookingStatus     BookingStatus @default(PENDING) @map("booking_status")
  paymentStatus     PaymentStatus @default(UNPAID) @map("payment_status")
  
  // Additional Info
  specialRequests   String?  @map("special_requests") @db.Text
  internalNotes     String?  @map("internal_notes") @db.Text
  
  // OTA Integration
  otaSource         String?  @map("ota_source") // 'booking.com', 'expedia', etc
  otaBookingId      String?  @map("ota_booking_id")
  otaSyncedAt       DateTime? @map("ota_synced_at")
  
  // Timestamps
  confirmedAt       DateTime? @map("confirmed_at")
  cancelledAt       DateTime? @map("cancelled_at")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  @@index([villaId, checkInDate, checkOutDate])
  @@index([userId])
  @@index([bookingStatus])
  @@index([bookingNumber])
  @@map("bookings")
}

enum VillaType {
  BEACHFRONT
  HILLSIDE
  GARDEN
  URBAN
  @@map("enum_villa_type")
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
  @@map("enum_booking_status")
}

enum PaymentStatus {
  UNPAID
  PARTIALLY_PAID
  PAID
  REFUNDED
  @@map("enum_payment_status")
}
```

## 🎯 Audit Fields Standard

Every table should include these audit fields:
```sql
CREATE TABLE [table_name] (
  -- ... other columns ...
  
  -- Audit fields (always at the end)
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ, -- For soft delete
  deleted_by UUID REFERENCES users(id),
  version INTEGER DEFAULT 1 -- For optimistic locking
);
```

## 📚 Views and Materialized Views

### Naming: vw_[description] or mv_[description]
```sql
-- Regular view
CREATE VIEW vw_available_villas AS
SELECT * FROM villas 
WHERE is_available = true 
  AND deleted_at IS NULL;

-- Materialized view for performance
CREATE MATERIALIZED VIEW mv_villa_availability_calendar AS
SELECT 
  v.id as villa_id,
  v.name as villa_name,
  generate_series(
    CURRENT_DATE, 
    CURRENT_DATE + INTERVAL '365 days', 
    '1 day'::interval
  )::date as date,
  CASE 
    WHEN b.id IS NOT NULL THEN false 
    ELSE true 
  END as is_available
FROM villas v
LEFT JOIN bookings b ON ...
WITH DATA;

-- Refresh strategy
CREATE INDEX idx_mv_villa_availability ON mv_villa_availability_calendar(villa_id, date);
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_villa_availability_calendar;
```

## ✅ Naming Checklist

- [ ] Tables use plural nouns in snake_case
- [ ] Primary keys are named 'id'
- [ ] Foreign keys follow [table]_id pattern
- [ ] Boolean columns start with is_, has_, or can_
- [ ] Timestamps end with _at
- [ ] Dates end with _date
- [ ] All constraints are explicitly named
- [ ] Indexes follow idx_ naming pattern
- [ ] Functions follow fn_ naming pattern
- [ ] Triggers follow trg_ naming pattern
- [ ] Audit fields are consistently included
- [ ] No reserved keywords used as names

---
Last Updated: 2024-12-26
Version: 1.0.0
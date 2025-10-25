-- CreateEnum
CREATE TYPE "public"."enum_user_role" AS ENUM ('USER', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "public"."enum_villa_type" AS ENUM ('BEACHFRONT', 'HILLSIDE', 'GARDEN', 'URBAN');

-- CreateEnum
CREATE TYPE "public"."enum_booking_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."enum_payment_status" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."enum_payment_method" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'CASH');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "role" "public"."enum_user_role" NOT NULL DEFAULT 'USER',
    "preferred_language" TEXT NOT NULL DEFAULT 'en',
    "preferred_currency" TEXT NOT NULL DEFAULT 'THB',
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."villas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distance_to_beach_meters" INTEGER,
    "area" VARCHAR(100),
    "villa_type" "public"."enum_villa_type" NOT NULL,
    "max_guests" INTEGER NOT NULL,
    "bedrooms_count" INTEGER NOT NULL,
    "bathrooms_count" INTEGER NOT NULL,
    "size_sqm" INTEGER,
    "floors" INTEGER NOT NULL DEFAULT 1,
    "year_built" INTEGER,
    "price_per_night_thb" DECIMAL(10,2) NOT NULL,
    "cleaning_fee_thb" DECIMAL(10,2),
    "security_deposit_thb" DECIMAL(10,2),
    "weekly_discount" DECIMAL(5,4),
    "monthly_discount" DECIMAL(5,4),
    "has_pool" BOOLEAN NOT NULL DEFAULT false,
    "has_beach_access" BOOLEAN NOT NULL DEFAULT false,
    "has_seaview" BOOLEAN NOT NULL DEFAULT false,
    "has_kitchen" BOOLEAN NOT NULL DEFAULT true,
    "has_wifi" BOOLEAN NOT NULL DEFAULT true,
    "has_aircon" BOOLEAN NOT NULL DEFAULT true,
    "has_parking" BOOLEAN NOT NULL DEFAULT true,
    "is_pet_friendly" BOOLEAN NOT NULL DEFAULT false,
    "can_host_events" BOOLEAN NOT NULL DEFAULT false,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "check_in_time" TEXT NOT NULL DEFAULT '15:00',
    "check_out_time" TEXT NOT NULL DEFAULT '11:00',
    "min_stay_nights" INTEGER NOT NULL DEFAULT 2,
    "meta_title" VARCHAR(255),
    "meta_description" VARCHAR(500),
    "amenities_data" JSONB,
    "house_rules" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "villas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "booking_number" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "check_in_date" DATE NOT NULL,
    "check_out_date" DATE NOT NULL,
    "adults_count" INTEGER NOT NULL,
    "children_count" INTEGER NOT NULL DEFAULT 0,
    "infants_count" INTEGER NOT NULL DEFAULT 0,
    "nightly_rate" DECIMAL(10,2) NOT NULL,
    "total_nights" INTEGER NOT NULL,
    "subtotal_amount" DECIMAL(10,2) NOT NULL,
    "cleaning_fee" DECIMAL(10,2),
    "service_fee" DECIMAL(10,2),
    "tax_amount" DECIMAL(10,2),
    "discount_amount" DECIMAL(10,2),
    "total_amount" DECIMAL(10,2) NOT NULL,
    "booking_status" "public"."enum_booking_status" NOT NULL DEFAULT 'PENDING',
    "payment_status" "public"."enum_payment_status" NOT NULL DEFAULT 'UNPAID',
    "guest_name" VARCHAR(255),
    "guest_email" VARCHAR(255),
    "guest_phone" VARCHAR(50),
    "special_requests" TEXT,
    "internal_notes" TEXT,
    "cancellation_reason" TEXT,
    "ota_source" TEXT,
    "ota_booking_id" TEXT,
    "ota_synced_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "payment_number" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'THB',
    "payment_method" "public"."enum_payment_method" NOT NULL,
    "payment_status" "public"."enum_payment_status" NOT NULL,
    "transaction_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "stripe_charge_id" TEXT,
    "description" TEXT,
    "receipt_url" TEXT,
    "failure_reason" TEXT,
    "paid_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "cleanliness_rating" INTEGER,
    "accuracy_rating" INTEGER,
    "check_in_rating" INTEGER,
    "communication_rating" INTEGER,
    "location_rating" INTEGER,
    "value_rating" INTEGER,
    "title" VARCHAR(255),
    "comment" TEXT NOT NULL,
    "response" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."amenities" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(50),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."villa_amenities" (
    "villa_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,

    CONSTRAINT "villa_amenities_pkey" PRIMARY KEY ("villa_id","amenity_id")
);

-- CreateTable
CREATE TABLE "public"."villa_images" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT,
    "caption" VARCHAR(255),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."favorite_villas" (
    "user_id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_villas_pkey" PRIMARY KEY ("user_id","villa_id")
);

-- CreateTable
CREATE TABLE "public"."seasonal_pricing" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "price_per_night_thb" DECIMAL(10,2) NOT NULL,
    "min_stay_nights" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasonal_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."login_attempts" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "user_id" TEXT,
    "ip_address" VARCHAR(45) NOT NULL,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "user_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "villas_slug_key" ON "public"."villas"("slug");

-- CreateIndex
CREATE INDEX "villas_slug_idx" ON "public"."villas"("slug");

-- CreateIndex
CREATE INDEX "villas_price_per_night_thb_idx" ON "public"."villas"("price_per_night_thb");

-- CreateIndex
CREATE INDEX "villas_villa_type_is_available_idx" ON "public"."villas"("villa_type", "is_available");

-- CreateIndex
CREATE INDEX "villas_max_guests_idx" ON "public"."villas"("max_guests");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_number_key" ON "public"."bookings"("booking_number");

-- CreateIndex
CREATE INDEX "bookings_villa_id_check_in_date_check_out_date_idx" ON "public"."bookings"("villa_id", "check_in_date", "check_out_date");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "public"."bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_booking_status_idx" ON "public"."bookings"("booking_status");

-- CreateIndex
CREATE INDEX "bookings_booking_number_idx" ON "public"."bookings"("booking_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_number_key" ON "public"."payments"("payment_number");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "public"."payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_payment_status_idx" ON "public"."payments"("payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "public"."reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_villa_id_idx" ON "public"."reviews"("villa_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "public"."reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_overall_rating_idx" ON "public"."reviews"("overall_rating");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "public"."amenities"("name");

-- CreateIndex
CREATE INDEX "amenities_category_idx" ON "public"."amenities"("category");

-- CreateIndex
CREATE INDEX "villa_images_villa_id_idx" ON "public"."villa_images"("villa_id");

-- CreateIndex
CREATE INDEX "seasonal_pricing_villa_id_start_date_end_date_idx" ON "public"."seasonal_pricing"("villa_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "login_attempts_email_idx" ON "public"."login_attempts"("email");

-- CreateIndex
CREATE INDEX "login_attempts_user_id_idx" ON "public"."login_attempts"("user_id");

-- CreateIndex
CREATE INDEX "login_attempts_created_at_idx" ON "public"."login_attempts"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "public"."audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "public"."audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "public"."accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "public"."sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."villa_amenities" ADD CONSTRAINT "villa_amenities_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."villa_amenities" ADD CONSTRAINT "villa_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."villa_images" ADD CONSTRAINT "villa_images_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_villas" ADD CONSTRAINT "favorite_villas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_villas" ADD CONSTRAINT "favorite_villas_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seasonal_pricing" ADD CONSTRAINT "seasonal_pricing_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

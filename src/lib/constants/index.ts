import type { Language, Currency, SortOption } from '@/types'

// Application Info
export const APP_NAME = 'Exclusive Villa Samui'
export const APP_DESCRIPTION = 'Luxury villa rentals in Koh Samui, Thailand'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
export const API_VERSION = 'v1'

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Booking Rules
export const MIN_BOOKING_NIGHTS = 2
export const MAX_BOOKING_NIGHTS = 30
export const MAX_FUTURE_BOOKING_DAYS = 365
export const MAX_GUESTS_DEFAULT = 10
export const BOOKING_CANCELLATION_HOURS = 48
export const CHECK_IN_TIME = '15:00'
export const CHECK_OUT_TIME = '11:00'

// Pricing
export const DEFAULT_CURRENCY = 'THB'
export const TAX_RATE = 0.07 // 7% VAT in Thailand
export const SERVICE_FEE_RATE = 0.05 // 5% service fee
export const WEEKLY_DISCOUNT_RATE = 0.05 // 5% for 7+ nights
export const MONTHLY_DISCOUNT_RATE = 0.10 // 10% for 28+ nights

// Languages
export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

export const DEFAULT_LANGUAGE = 'en'

// Currencies
export const CURRENCIES: Currency[] = [
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
]

// Villa Types
export const VILLA_TYPES = [
  { value: 'BEACHFRONT', label: 'Beachfront' },
  { value: 'HILLSIDE', label: 'Hillside' },
  { value: 'GARDEN', label: 'Garden' },
  { value: 'URBAN', label: 'Urban' },
]

// Booking Status
export const BOOKING_STATUS = [
  { value: 'PENDING', label: 'Pending', color: 'warning' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'danger' },
  { value: 'COMPLETED', label: 'Completed', color: 'secondary' },
  { value: 'NO_SHOW', label: 'No Show', color: 'danger' },
]

// Payment Status
export const PAYMENT_STATUS = [
  { value: 'UNPAID', label: 'Unpaid', color: 'warning' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid', color: 'info' },
  { value: 'PAID', label: 'Paid', color: 'success' },
  { value: 'REFUNDED', label: 'Refunded', color: 'secondary' },
]

// Sort Options
export const VILLA_SORT_OPTIONS: SortOption[] = [
  { label: 'Featured', value: 'featured', direction: 'desc' },
  { label: 'Price: Low to High', value: 'price', direction: 'asc' },
  { label: 'Price: High to Low', value: 'price', direction: 'desc' },
  { label: 'Rating: High to Low', value: 'rating', direction: 'desc' },
  { label: 'Newest First', value: 'created', direction: 'desc' },
  { label: 'Name: A to Z', value: 'name', direction: 'asc' },
]

// Amenities Categories
export const AMENITY_CATEGORIES = [
  { value: 'essentials', label: 'Essentials' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'safety', label: 'Safety' },
  { value: 'services', label: 'Services' },
]

// Popular Amenities (for quick filters)
export const POPULAR_AMENITIES = [
  'wifi',
  'pool',
  'air_conditioning',
  'kitchen',
  'parking',
  'beach_access',
  'sea_view',
  'pet_friendly',
]

// Areas in Koh Samui
export const SAMUI_AREAS = [
  { value: 'chaweng', label: 'Chaweng' },
  { value: 'lamai', label: 'Lamai' },
  { value: 'bophut', label: 'Bophut' },
  { value: 'maenam', label: 'Maenam' },
  { value: 'bangrak', label: 'Bang Rak (Big Buddha)' },
  { value: 'choengmon', label: 'Choeng Mon' },
  { value: 'taling-ngam', label: 'Taling Ngam' },
  { value: 'nathon', label: 'Nathon' },
  { value: 'lipa-noi', label: 'Lipa Noi' },
  { value: 'bang-por', label: 'Bang Por' },
]

// Guest Count Options
export const GUEST_COUNT_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} ${i === 0 ? 'Guest' : 'Guests'}`,
}))

// Bedroom Count Options
export const BEDROOM_COUNT_OPTIONS = [
  { value: 1, label: '1 Bedroom' },
  { value: 2, label: '2 Bedrooms' },
  { value: 3, label: '3 Bedrooms' },
  { value: 4, label: '4 Bedrooms' },
  { value: 5, label: '5 Bedrooms' },
  { value: 6, label: '6+ Bedrooms' },
]

// Price Range Options (THB)
export const PRICE_RANGE_OPTIONS = [
  { min: 0, max: 5000, label: 'Under ฿5,000' },
  { min: 5000, max: 10000, label: '฿5,000 - ฿10,000' },
  { min: 10000, max: 20000, label: '฿10,000 - ฿20,000' },
  { min: 20000, max: 50000, label: '฿20,000 - ฿50,000' },
  { min: 50000, max: null, label: 'Over ฿50,000' },
]

// Date Format
export const DATE_FORMAT = 'MMM dd, yyyy'
export const TIME_FORMAT = 'HH:mm'
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm'

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGES_PER_VILLA = 20

// Rate Limiting
export const RATE_LIMIT_WINDOW = '1h'
export const RATE_LIMIT_MAX_REQUESTS = {
  anonymous: 100,
  authenticated: 1000,
  premium: 5000,
}

// Session
export const SESSION_MAX_AGE = 30 * 60 // 30 minutes in seconds
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

// Password Rules
export const PASSWORD_MIN_LENGTH = 12
export const PASSWORD_RULES = {
  minLength: PASSWORD_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
}

// SEO
export const DEFAULT_SEO = {
  title: 'Exclusive Villa Samui - Luxury Villa Rentals in Koh Samui',
  description: 'Discover luxury villa rentals in Koh Samui. Premium beachfront villas with private pools, stunning sea views, and world-class amenities.',
  keywords: 'koh samui villas, luxury villa rental, beachfront villa, samui accommodation, thailand villa',
  image: '/images/og-image.jpg',
}

// Social Media
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/exclusivevillasamui',
  instagram: 'https://instagram.com/exclusivevillasamui',
  twitter: 'https://twitter.com/villasamui',
  youtube: 'https://youtube.com/exclusivevillasamui',
  tripadvisor: 'https://tripadvisor.com/exclusivevillasamui',
}

// Contact Information
export const CONTACT_INFO = {
  email: 'info@exclusivevillasamui.com',
  phone: '+66 77 123 456',
  whatsapp: '+66 98 765 4321',
  address: '123 Beach Road, Chaweng, Koh Samui, 84320, Thailand',
  workingHours: {
    weekdays: '09:00 - 18:00',
    weekends: '10:00 - 17:00',
  },
}

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  VALIDATION: 'Please check your input and try again.',
  AUTHENTICATION: 'Please login to continue.',
  AUTHORIZATION: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  BOOKING_CONFLICT: 'These dates are no longer available.',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: 'Your booking has been successfully created!',
  BOOKING_CANCELLED: 'Your booking has been cancelled.',
  PAYMENT_COMPLETED: 'Payment completed successfully!',
  PROFILE_UPDATED: 'Your profile has been updated.',
  PASSWORD_CHANGED: 'Your password has been changed.',
  EMAIL_SENT: 'Email has been sent successfully.',
  REVIEW_SUBMITTED: 'Thank you for your review!',
}

// OTA Platforms
export const OTA_PLATFORMS = [
  { code: 'BOOKING_COM', name: 'Booking.com' },
  { code: 'EXPEDIA', name: 'Expedia' },
  { code: 'AGODA', name: 'Agoda' },
  { code: 'AIRBNB', name: 'Airbnb' },
]
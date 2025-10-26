// Re-export Prisma types
// Prisma types available based on current schema (User, LoginAttempt, AuditLog, enums UserRole, EntityType)
import type { User, UserRole } from '@prisma/client'

export type { User, UserRole }

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  pagination?: PaginationMeta
  meta?: ResponseMeta
}

export interface ApiError {
  code: string
  message: string
  details?: ErrorDetail[]
  timestamp?: string
  path?: string
  requestId?: string
}

export interface ErrorDetail {
  field: string
  message: string
  code: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ResponseMeta {
  timestamp: string
  version: string
  [key: string]: unknown
}

// Search and Filter types
export interface SearchParams {
  query?: string
  checkIn?: Date | string
  checkOut?: Date | string
  guests?: number
  minPrice?: number
  maxPrice?: number
  villaType?: string
  amenities?: string[]
  location?: string
  page?: number
  limit?: number
  sort?: string
}

export interface VillaFilters {
  priceRange?: [number, number] | { min: number; max: number; display: string }
  bedroomsCount?: number
  bathroomsCount?: number
  maxGuests?: number
  villaType?: string[]
  amenities?: string[]
  features?: {
    hasPool?: boolean
    hasBeachAccess?: boolean
    hasSeaview?: boolean
    isPetFriendly?: boolean
  }
  location?: {
    area?: string
    maxDistanceToBeach?: number
  }
}

// Booking types
export interface BookingFormData {
  checkInDate: Date
  checkOutDate: Date
  guests: number
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests?: string
}

export interface BookingSubmissionData extends BookingFormData {
  villaId: string
  pricing: {
    basePrice: number
    cleaningFee: number
    serviceFee: number
    taxes: number
    totalPrice: number
  }
}

export interface BookingCalculation {
  nightlyRate: number
  totalNights: number
  subtotal: number
  cleaningFee: number
  serviceFee: number
  taxAmount: number
  discount?: number
  total: number
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
  preferredLanguage?: string
}

export interface SessionUser {
  id: string
  email: string
  name?: string
  image?: string
  role: string
}

// Villa types
// Placeholder interface (original depended on models not yet in schema)
export interface VillaWithDetails {
  id: string
  title?: string
  averageRating?: number
  reviewCount?: number
  // Extend when corresponding Prisma models (Villa, Amenity, Review, etc.) are added
}

export interface VillaAvailability {
  villaId: string
  date: Date
  isAvailable: boolean
  price?: number
  minStay?: number
}

// Date range type
export interface DateRange {
  from: Date
  to: Date
}

// Language options
export interface Language {
  code: string
  name: string
  flag: string
}

// Currency options
export interface Currency {
  code: string
  symbol: string
  name: string
}

// OTA Integration types
export interface OTASyncData {
  platform: 'BOOKING_COM' | 'EXPEDIA' | 'AGODA' | 'AIRBNB'
  bookingId: string
  status: string
  lastSyncedAt: Date
}

// Upload types
export interface UploadedFile {
  url: string
  publicId: string
  format: string
  width?: number
  height?: number
  size: number
}

// Analytics types
export interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  createdAt: Date
  read: boolean
}

// Form validation types
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: unknown) => boolean | string
}

export interface FormField {
  name: string
  label: string
  type: string
  placeholder?: string
  defaultValue?: unknown
  rules?: ValidationRule
}

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface LoadingStatus {
  state: LoadingState
  message?: string
  progress?: number
}

// Sort options
export interface SortOption {
  label: string
  value: string
  direction: 'asc' | 'desc'
}

// Menu item type
export interface MenuItem {
  label: string
  href?: string
  icon?: string
  children?: MenuItem[]
  badge?: string | number
  requiresAuth?: boolean
  roles?: string[]
}

// Dashboard stats
export interface DashboardStats {
  totalBookings: number
  totalRevenue: number
  occupancyRate: number
  averageStayLength: number
  upcomingCheckIns: number
  upcomingCheckOuts: number
}

// Review stats
export interface ReviewStats {
  averageRating: number
  totalReviews: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  categories: {
    cleanliness: number
    accuracy: number
    checkIn: number
    communication: number
    location: number
    value: number
  }
}
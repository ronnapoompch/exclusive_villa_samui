/**
 * Application constants following MASTER PROMPT requirements
 */

// Authentication constants
export const PASSWORD_MIN_LENGTH = 8
export const TOKEN_EXPIRY_HOURS = 1
export const MAX_LOGIN_ATTEMPTS = 5
export const LOCKOUT_DURATION_MINUTES = 15

// Password rules
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARS: '@$!%*?&'
}

// Supported languages (i18n)
export const SUPPORTED_LOCALES = ['th', 'en', 'ru', 'zh'] as const
export const DEFAULT_LOCALE = 'th'

// Supported currencies  
export const SUPPORTED_CURRENCIES = ['THB', 'USD', 'EUR', 'CNY', 'RUB'] as const
export const DEFAULT_CURRENCY = 'THB'

// User roles
export const USER_ROLES = {
  GUEST: 'GUEST',
  USER: 'USER', 
  ADMIN: 'ADMIN'
} as const

// Rate limiting
export const RATE_LIMIT = {
  AUTH: 10, // 10 attempts per window
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
} as const

// Email settings
export const EMAIL_FROM = 'noreply@villasamui.com'
export const EMAIL_REPLY_TO = 'support@villasamui.com'

// App metadata
export const APP_NAME = 'Exclusive Villa Samui'
export const APP_DESCRIPTION = 'Luxury villa booking platform for Samui with 100+ properties'
export const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Session settings
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days
export const SESSION_UPDATE_AGE = 24 * 60 * 60 // 1 day

// Type exports
export type Locale = typeof SUPPORTED_LOCALES[number]
export type Currency = typeof SUPPORTED_CURRENCIES[number]
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
import { z } from 'zod'
import { PASSWORD_MIN_LENGTH } from '@/lib/constants'

/**
 * Authentication validation schemas following OWASP A03:2021 - Injection
 * All inputs are validated and sanitized using Zod
 */

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .toLowerCase()
  .trim()

/**
 * Password validation for login
 */
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')

/**
 * Strong password validation for registration
 * Following MASTER PROMPT requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter  
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const strongPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional().default(false)
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Registration schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .trim(),
  phone: z
    .string()
    .regex(/^(\+66|0)[0-9]{8,9}$/, 'Invalid Thai phone number format')
    .optional()
    .nullable(),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
  preferredLanguage: z
    .enum(['en', 'th', 'ru', 'zh', 'es'])
    .optional()
    .default('en')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

/**
 * Change password schema (for logged-in users)
 */
export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .trim(),
  phone: z
    .string()
    .regex(/^(\+66|0)[0-9]{8,9}$/, 'Invalid Thai phone number format')
    .optional()
    .nullable(),
  preferredLanguage: z
    .enum(['en', 'th', 'ru', 'zh', 'es'])
    .optional(),
  preferredCurrency: z
    .enum(['THB', 'USD', 'EUR', 'GBP', 'RUB', 'CNY'])
    .optional()
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

/**
 * Two-factor authentication verification schema
 */
export const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^[0-9]+$/, 'Verification code must contain only numbers')
})

export type TwoFactorInput = z.infer<typeof twoFactorSchema>

/**
 * Email verification schema
 */
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
})

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>
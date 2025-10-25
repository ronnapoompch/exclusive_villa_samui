// Stripe Server Configuration - Professional Implementation
import Stripe from 'stripe'

// Use a placeholder for build time when no secret key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build'

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.warn('Warning: STRIPE_SECRET_KEY not found. Stripe functionality will be disabled.')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const STRIPE_CONFIG = {
  currency: 'thb' as const,
  minAmount: 100, // Minimum amount in THB
  maxAmount: 100000000, // Maximum amount in THB (1,000,000 THB)
}

export default stripe

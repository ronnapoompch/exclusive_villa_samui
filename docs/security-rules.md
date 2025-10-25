# 🔐 Security Standards - Exclusive Villa Samui

## 🛡️ OWASP Top 10 2021 Implementation

### 1. A01:2021 – Broken Access Control

#### ✅ Implementation
```typescript
// middleware.ts - Route protection
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname
      
      // Admin routes
      if (path.startsWith('/admin')) {
        return token?.role === 'ADMIN'
      }
      
      // User dashboard
      if (path.startsWith('/dashboard')) {
        return !!token
      }
      
      return true
    }
  }
})

// API Route protection
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Check resource ownership
  const booking = await prisma.booking.findUnique({
    where: { id: params.id }
  })
  
  if (booking.userId !== session.user.id) {
    return new Response('Forbidden', { status: 403 })
  }
  
  return Response.json(booking)
}
```

### 2. A02:2021 – Cryptographic Failures

#### ✅ Implementation
```typescript
// Password hashing with bcrypt
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Sensitive data encryption
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const algorithm = 'aes-256-gcm'
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(algorithm, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

// Environment variables validation
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'ENCRYPTION_KEY',
  'STRIPE_SECRET_KEY'
]

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
})
```

### 3. A03:2021 – Injection

#### ✅ Implementation
```typescript
// Use Prisma ORM (prevents SQL injection)
// ❌ NEVER do this
const query = `SELECT * FROM villas WHERE name = '${userInput}'`

// ✅ Always use parameterized queries
const villas = await prisma.villa.findMany({
  where: {
    name: {
      contains: userInput // Prisma sanitizes automatically
    }
  }
})

// Input validation with Zod
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9\s\-\_]+$/, 'Invalid characters'),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().min(1).max(20)
})

// API route with validation
export async function POST(req: Request) {
  const body = await req.json()
  
  // Validate input
  const validation = searchSchema.safeParse(body)
  if (!validation.success) {
    return Response.json(
      { error: validation.error.flatten() },
      { status: 400 }
    )
  }
  
  // Safe to use validated data
  const results = await searchVillas(validation.data)
  return Response.json(results)
}
```

### 4. A04:2021 – Insecure Design

#### ✅ Implementation
```typescript
// Rate limiting
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true
})

export async function middleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString()
      }
    })
  }
}

// Booking limits
const MAX_BOOKINGS_PER_USER_PER_DAY = 5
const MAX_FUTURE_BOOKINGS = 10

export async function createBooking(userId: string, data: BookingData) {
  // Check daily limit
  const todayBookings = await prisma.booking.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  })
  
  if (todayBookings >= MAX_BOOKINGS_PER_USER_PER_DAY) {
    throw new Error('Daily booking limit exceeded')
  }
  
  // Check future bookings limit
  const futureBookings = await prisma.booking.count({
    where: {
      userId,
      checkIn: { gte: new Date() },
      status: { not: 'CANCELLED' }
    }
  })
  
  if (futureBookings >= MAX_FUTURE_BOOKINGS) {
    throw new Error('Maximum future bookings exceeded')
  }
  
  // Create booking with transaction
  return prisma.$transaction(async (tx) => {
    // Lock villa to prevent double booking
    const villa = await tx.villa.findUnique({
      where: { id: data.villaId },
      select: { id: true }
    })
    
    // Check availability
    const conflictingBooking = await tx.booking.findFirst({
      where: {
        villaId: data.villaId,
        status: { not: 'CANCELLED' },
        OR: [
          {
            checkIn: { lte: data.checkOut },
            checkOut: { gte: data.checkIn }
          }
        ]
      }
    })
    
    if (conflictingBooking) {
      throw new Error('Villa not available for selected dates')
    }
    
    // Create booking
    return tx.booking.create({ data })
  })
}
```

### 5. A05:2021 – Security Misconfiguration

#### ✅ Implementation
```typescript
// next.config.js - Security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}

// CORS configuration
export async function middleware(req: Request) {
  const res = NextResponse.next()
  
  // Configure CORS
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://admin.exclusivevillasamui.com'
  ]
  
  const origin = req.headers.get('origin')
  
  if (origin && allowedOrigins.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  return res
}
```

### 6. A06:2021 – Vulnerable and Outdated Components

#### ✅ Implementation
```json
// package.json - Audit scripts
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix",
    "deps:check": "npx npm-check-updates",
    "deps:update": "npx npm-check-updates -u"
  }
}
```

```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * MON'
  push:
    branches: [main, develop]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit
      - name: Check for outdated packages
        run: npx npm-check-updates
```

### 7. A07:2021 – Identification and Authentication Failures

#### ✅ Implementation
```typescript
// NextAuth configuration with security best practices
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Rate limit login attempts
        const attempts = await getLoginAttempts(credentials.email)
        if (attempts > 5) {
          throw new Error('Too many login attempts. Please try again later.')
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || !await verifyPassword(credentials.password, user.password)) {
          await incrementLoginAttempts(credentials.email)
          throw new Error('Invalid credentials')
        }
        
        // Reset login attempts on success
        await resetLoginAttempts(credentials.email)
        
        return user
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.sessionId = generateSessionId()
      }
      return token
    },
    async session({ session, token }) {
      // Validate session
      const isValid = await validateSession(token.sessionId)
      if (!isValid) {
        throw new Error('Invalid session')
      }
      
      session.user.id = token.id
      session.user.role = token.role
      return session
    }
  }
}

// Password requirements
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character')

// Two-factor authentication
export async function enableTwoFactor(userId: string) {
  const secret = authenticator.generateSecret()
  const qrCode = await qrcode.toDataURL(
    authenticator.keyuri(user.email, 'Exclusive Villa Samui', secret)
  )
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: encrypt(secret),
      twoFactorEnabled: false // Enable after verification
    }
  })
  
  return { secret, qrCode }
}
```

### 8. A08:2021 – Software and Data Integrity Failures

#### ✅ Implementation
```typescript
// Content Security Policy
export const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://res.cloudinary.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`

// Subresource Integrity for external scripts
<script
  src="https://js.stripe.com/v3/"
  integrity="sha384-..."
  crossorigin="anonymous"
/>

// Verify webhook signatures
export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
    // Process verified webhook
    await processWebhook(event)
    
    return Response.json({ received: true })
  } catch (err) {
    return new Response('Webhook signature verification failed', {
      status: 400
    })
  }
}
```

### 9. A09:2021 – Security Logging and Monitoring Failures

#### ✅ Implementation
```typescript
// Comprehensive logging system
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'security.log', level: 'warn' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Security event logging
export function logSecurityEvent(event: SecurityEvent) {
  logger.warn({
    type: 'SECURITY',
    event: event.type,
    userId: event.userId,
    ip: event.ip,
    userAgent: event.userAgent,
    timestamp: new Date().toISOString(),
    details: event.details
  })
}

// Audit trail for sensitive operations
export async function auditLog(action: AuditAction) {
  await prisma.auditLog.create({
    data: {
      action: action.type,
      userId: action.userId,
      targetId: action.targetId,
      targetType: action.targetType,
      changes: action.changes,
      ip: action.ip,
      userAgent: action.userAgent,
      timestamp: new Date()
    }
  })
}

// Monitor failed login attempts
export async function monitorFailedLogin(email: string, ip: string) {
  const recentAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
      }
    }
  })
  
  if (recentAttempts >= 3) {
    // Alert security team
    await sendSecurityAlert({
      type: 'MULTIPLE_FAILED_LOGINS',
      email,
      ip,
      attempts: recentAttempts
    })
  }
}
```

### 10. A10:2021 – Server-Side Request Forgery (SSRF)

#### ✅ Implementation
```typescript
// URL validation for external requests
import { URL } from 'url'

const ALLOWED_HOSTS = [
  'api.stripe.com',
  'api.booking.com',
  'api.expedia.com',
  'res.cloudinary.com'
]

export async function fetchExternalResource(url: string) {
  try {
    const parsedUrl = new URL(url)
    
    // Check protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol')
    }
    
    // Check host whitelist
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      throw new Error('Host not allowed')
    }
    
    // Prevent internal network access
    const ip = await dns.lookup(parsedUrl.hostname)
    if (isPrivateIP(ip)) {
      throw new Error('Private IP access denied')
    }
    
    // Make request with timeout
    const response = await fetch(url, {
      timeout: 5000,
      redirect: 'error' // Don't follow redirects
    })
    
    return response
  } catch (error) {
    logger.error('SSRF attempt blocked', { url, error })
    throw new Error('Invalid URL')
  }
}

function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127
  )
}
```

## 🔒 Additional Security Measures

### CSRF Protection
```typescript
// Using Next.js built-in CSRF protection
import { getCsrfToken } from 'next-auth/react'

export async function BookingForm() {
  const csrfToken = await getCsrfToken()
  
  return (
    <form method="POST">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      {/* Form fields */}
    </form>
  )
}
```

### XSS Prevention
```typescript
// Always sanitize user input for display
import DOMPurify from 'isomorphic-dompurify'

export function VillaDescription({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'li'],
    ALLOWED_ATTR: []
  })
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}
```

### File Upload Security
```typescript
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadFile(file: File) {
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large')
  }
  
  // Generate secure filename
  const extension = file.name.split('.').pop()
  const filename = `${uuidv4()}.${extension}`
  
  // Upload to secure storage
  return uploadToCloudinary(file, filename)
}
```

## 📊 Security Monitoring Dashboard

```typescript
// Monitor these metrics:
interface SecurityMetrics {
  failedLogins: number
  suspiciousActivity: number
  blockedRequests: number
  rateLimitHits: number
  errorRate: number
  responseTime: number
}

// Alert thresholds
const ALERT_THRESHOLDS = {
  failedLogins: 10, // per hour
  suspiciousActivity: 5, // per hour
  blockedRequests: 20, // per hour
  errorRate: 0.05, // 5%
  responseTime: 3000 // 3 seconds
}
```

---
Last Updated: 2024-12-26
Version: 1.0.0
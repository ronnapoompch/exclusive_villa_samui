# 🌐 API Naming Conventions - Exclusive Villa Samui

## 📋 RESTful API Standards

### Base URL Structure
```
Production: https://api.exclusivevillasamui.com/v1
Staging: https://staging-api.exclusivevillasamui.com/v1
Development: http://localhost:3000/api/v1
```

## 🔗 URL Patterns

### Resource Naming Rules
1. **Use plural nouns** for resources
2. **Use kebab-case** for multi-word resources
3. **Keep URLs lowercase**
4. **No trailing slashes**
5. **Version your APIs**

### Standard CRUD Operations
```http
# Villas Resource
GET    /api/v1/villas              # List all villas
GET    /api/v1/villas/:id          # Get specific villa
POST   /api/v1/villas              # Create new villa (admin)
PUT    /api/v1/villas/:id          # Update entire villa (admin)
PATCH  /api/v1/villas/:id          # Partial update (admin)
DELETE /api/v1/villas/:id          # Delete villa (admin)

# Bookings Resource
GET    /api/v1/bookings            # List user's bookings
GET    /api/v1/bookings/:id        # Get specific booking
POST   /api/v1/bookings            # Create new booking
PATCH  /api/v1/bookings/:id        # Update booking (limited fields)
DELETE /api/v1/bookings/:id        # Cancel booking

# Reviews Resource
GET    /api/v1/reviews             # List all reviews
GET    /api/v1/reviews/:id         # Get specific review
POST   /api/v1/reviews             # Create new review
PUT    /api/v1/reviews/:id         # Update review
DELETE /api/v1/reviews/:id         # Delete review
```

### Nested Resources
```http
# Villa-specific resources
GET    /api/v1/villas/:id/images
GET    /api/v1/villas/:id/reviews
GET    /api/v1/villas/:id/availability
GET    /api/v1/villas/:id/bookings       # Admin only

# User-specific resources
GET    /api/v1/users/:id/bookings
GET    /api/v1/users/:id/reviews
GET    /api/v1/users/:id/favorites

# Booking-specific resources
GET    /api/v1/bookings/:id/invoice
POST   /api/v1/bookings/:id/payment
POST   /api/v1/bookings/:id/confirmation
```

### Actions and Non-CRUD Operations
```http
# Use verbs for actions that don't fit CRUD
POST   /api/v1/villas/:id/check-availability
POST   /api/v1/villas/:id/calculate-price
POST   /api/v1/bookings/:id/cancel
POST   /api/v1/bookings/:id/confirm
POST   /api/v1/bookings/:id/resend-confirmation
POST   /api/v1/users/:id/reset-password
POST   /api/v1/users/:id/verify-email

# Search and filtering
GET    /api/v1/villas/search
GET    /api/v1/villas/featured
GET    /api/v1/villas/nearby
```

## 🔍 Query Parameters

### Filtering
```http
GET /api/v1/villas?min_price=5000&max_price=20000
GET /api/v1/villas?bedrooms=3&has_pool=true
GET /api/v1/villas?villa_type=beachfront&is_available=true
GET /api/v1/bookings?status=confirmed&check_in_date=2024-12-25
```

### Sorting
```http
# Use 'sort' parameter with +/- prefix
GET /api/v1/villas?sort=-price_per_night    # Descending
GET /api/v1/villas?sort=+created_at         # Ascending
GET /api/v1/villas?sort=-rating,+price      # Multiple sorts
```

### Pagination
```http
# Use page and limit
GET /api/v1/villas?page=2&limit=20

# Response includes pagination metadata
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Field Selection
```http
# Use 'fields' parameter for sparse fieldsets
GET /api/v1/villas?fields=id,name,price,mainImage
GET /api/v1/bookings?fields=id,checkInDate,totalAmount,status
```

### Searching
```http
# Use 'q' for general search
GET /api/v1/villas?q=beachfront+pool

# Use specific search parameters
GET /api/v1/villas?location=chaweng&amenities=pool,gym
```

### Date Ranges
```http
# Use ISO 8601 format
GET /api/v1/villas/availability?check_in=2024-12-25&check_out=2024-12-31
GET /api/v1/bookings?created_after=2024-01-01&created_before=2024-12-31
```

## 📤 Request Standards

### Headers
```http
# Required headers
Content-Type: application/json
Accept: application/json
Accept-Language: en,th,ru,zh,es     # For i18n
X-Request-ID: uuid-v4               # For tracking
Authorization: Bearer <token>       # When authenticated

# Optional headers
X-Device-Type: mobile|desktop|tablet
X-App-Version: 1.0.0
X-Client-Version: 2.3.1
```

### Request Body Examples
```json
// POST /api/v1/bookings
{
  "villaId": "uuid-here",
  "checkInDate": "2024-12-25",
  "checkOutDate": "2024-12-31",
  "guests": {
    "adults": 2,
    "children": 1,
    "infants": 0
  },
  "specialRequests": "Late check-in please",
  "addOns": ["airport_transfer", "welcome_basket"]
}

// PATCH /api/v1/villas/:id (partial update)
{
  "pricePerNight": 15000,
  "isAvailable": true
}
```

## 📥 Response Standards

### Success Responses

#### Single Resource
```json
// GET /api/v1/villas/123
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Sunset Beach Villa",
    "pricePerNight": 15000,
    "location": {
      "address": "123 Beach Road, Chaweng",
      "latitude": 9.5320,
      "longitude": 100.0619
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-12-20T14:45:00Z"
  },
  "meta": {
    "timestamp": "2024-12-26T12:00:00Z",
    "version": "1.0"
  }
}
```

#### Collection Resource
```json
// GET /api/v1/villas
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "Sunset Beach Villa",
      "pricePerNight": 15000
    },
    {
      "id": "124",
      "name": "Ocean View Villa",
      "pricePerNight": 20000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2024-12-26T12:00:00Z",
    "version": "1.0"
  }
}
```

#### Created Resource
```json
// POST /api/v1/bookings
// Status: 201 Created
{
  "success": true,
  "data": {
    "id": "789",
    "bookingNumber": "BK-2024-001234",
    "status": "pending",
    "totalAmount": 105000,
    "createdAt": "2024-12-26T12:00:00Z"
  },
  "message": "Booking created successfully"
}
```

#### No Content
```http
// DELETE /api/v1/bookings/123
// Status: 204 No Content
// (No response body)
```

### Error Responses

#### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "details": [
      {
        "field": "checkOutDate",
        "message": "Check-out date must be after check-in date",
        "code": "INVALID_DATE_RANGE"
      },
      {
        "field": "guests.adults",
        "message": "At least 1 adult is required",
        "code": "MIN_VALUE"
      }
    ],
    "timestamp": "2024-12-26T12:00:00Z",
    "path": "/api/v1/bookings",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### Error Codes
```typescript
enum ErrorCode {
  // Client errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Business logic errors
  VILLA_NOT_AVAILABLE = 'VILLA_NOT_AVAILABLE',
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  BOOKING_EXPIRED = 'BOOKING_EXPIRED',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}
```

## 🔄 HTTP Status Codes

### Success Codes
```typescript
200 OK                  // GET, PUT, PATCH success
201 Created            // POST success with new resource
204 No Content         // DELETE success
206 Partial Content    // Partial GET (with Range header)
```

### Client Error Codes
```typescript
400 Bad Request        // Invalid request data
401 Unauthorized       // No/invalid authentication
403 Forbidden          // Authenticated but not authorized
404 Not Found          // Resource doesn't exist
405 Method Not Allowed // Wrong HTTP method
409 Conflict           // Duplicate or conflicting resource
422 Unprocessable Entity // Validation errors
429 Too Many Requests  // Rate limit exceeded
```

### Server Error Codes
```typescript
500 Internal Server Error  // Generic server error
502 Bad Gateway           // External service error
503 Service Unavailable   // Maintenance or overload
504 Gateway Timeout       // External service timeout
```

## 🔐 API Authentication

### JWT Token Structure
```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1703592000,
  "exp": 1703595600,
  "jti": "token-uuid"
}
```

### Authentication Flow
```http
# 1. Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "secure-password"
}

# Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}

# 2. Use token in requests
GET /api/v1/bookings
Authorization: Bearer eyJhbGc...

# 3. Refresh token
POST /api/v1/auth/refresh
{
  "refreshToken": "eyJhbGc..."
}
```

## 📊 Rate Limiting

### Headers
```http
# Response headers
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703595600
X-RateLimit-Reset-After: 3600

# When limit exceeded
HTTP/1.1 429 Too Many Requests
Retry-After: 3600
```

### Rate Limit Tiers
```typescript
interface RateLimits {
  anonymous: {
    requests: 100,
    window: '1h'
  },
  authenticated: {
    requests: 1000,
    window: '1h'
  },
  premium: {
    requests: 5000,
    window: '1h'
  }
}
```

## 🔄 Versioning Strategy

### URL Versioning (Recommended)
```http
/api/v1/villas
/api/v2/villas  # New version
```

### Version Deprecation
```http
# Deprecation headers
Sunset: Sat, 31 Dec 2024 23:59:59 GMT
Deprecation: true
Link: </api/v2/villas>; rel="successor-version"
```

## 🏗️ API Implementation Example

```typescript
// app/api/v1/villas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  hasPool: z.coerce.boolean().optional()
})

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams)
    const params = querySchema.parse(query)
    
    // Build database query
    const where = {
      ...(params.minPrice && { pricePerNight: { gte: params.minPrice } }),
      ...(params.maxPrice && { pricePerNight: { lte: params.maxPrice } }),
      ...(params.bedrooms && { bedroomsCount: params.bedrooms }),
      ...(params.hasPool !== undefined && { hasPool: params.hasPool })
    }
    
    // Fetch data with pagination
    const [villas, total] = await Promise.all([
      prisma.villa.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: parseSort(params.sort)
      }),
      prisma.villa.count({ where })
    ])
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      data: villas,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
        hasNext: params.page < Math.ceil(total / params.limit),
        hasPrev: params.page > 1
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.errors
        }
      }, { status: 400 })
    }
    
    // Log error and return generic response
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: 'Admin access required'
      }
    }, { status: 403 })
  }
  
  // Validate request body
  const body = await request.json()
  const validation = villaSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid villa data',
        details: validation.error.errors
      }
    }, { status: 400 })
  }
  
  // Create villa
  const villa = await prisma.villa.create({
    data: validation.data
  })
  
  return NextResponse.json({
    success: true,
    data: villa,
    message: 'Villa created successfully'
  }, { status: 201 })
}
```

## 🧪 API Testing Checklist

- [ ] All endpoints follow RESTful conventions
- [ ] Proper HTTP methods used
- [ ] Status codes are appropriate
- [ ] Response format is consistent
- [ ] Error messages are helpful
- [ ] Pagination works correctly
- [ ] Sorting works as expected
- [ ] Filtering is properly implemented
- [ ] Authentication is enforced
- [ ] Rate limiting is active
- [ ] CORS is configured
- [ ] API is versioned
- [ ] Documentation is updated

---
Last Updated: 2024-12-26
Version: 1.0.0
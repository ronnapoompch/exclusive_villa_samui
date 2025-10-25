# 🏝️ Exclusive Villa Samui - Project Constitution

## 📋 Project Overview
Luxury villa booking platform with 100+ properties in Samui, Thailand. Focus on premium user experience with multi-language support and seamless OTA integration.

## 🎯 Core Principles
1. **Performance First**: Every feature must load under 3 seconds
2. **Mobile First**: Design for mobile, enhance for desktop
3. **Type Safety**: 100% TypeScript coverage
4. **SEO Optimized**: SSR/SSG for all public pages
5. **Accessibility**: WCAG 2.1 AA compliance

## 🛠 Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 14.2+ | Full-stack React framework |
| **Language** | TypeScript | 5.3+ | Type safety |
| **Database** | PostgreSQL | 16+ | Primary database |
| **ORM** | Prisma | 5.10+ | Type-safe database access |
| **State Management** | Zustand | 4.5+ | Client state |
| **Server State** | TanStack Query | 5.20+ | Server state & caching |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Accessible components |
| **Animation** | Framer Motion | 11+ | Smooth animations |
| **Forms** | React Hook Form | 7.50+ | Form handling |
| **Validation** | Zod | 3.22+ | Schema validation |
| **Auth** | NextAuth.js | 5.0+ | Authentication |
| **Payment** | Stripe | Latest | Payment processing |
| **i18n** | next-intl | 3.9+ | Internationalization |
| **Testing** | Jest + RTL | Latest | Unit/Integration tests |
| **E2E Testing** | Playwright | Latest | End-to-end tests |

## 📁 Project Structure

```
exclusive-villa-samui/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/              # Internationalized routes
│   │   │   ├── (public)/          # Public routes group
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── villas/
│   │   │   │   └── about/
│   │   │   ├── (protected)/       # Auth required routes
│   │   │   │   ├── dashboard/
│   │   │   │   └── bookings/
│   │   │   └── admin/             # Admin panel
│   │   └── api/                   # API routes
│   │
│   ├── features/                  # Feature modules
│   │   ├── villas/
│   │   ├── booking/
│   │   ├── search/
│   │   ├── calendar/
│   │   └── payment/
│   │
│   ├── components/                # Shared components
│   │   ├── ui/                    # Base UI components
│   │   └── common/                # Business components
│   │
│   ├── lib/                       # Core utilities
│   │   ├── db/                    # Database utilities
│   │   ├── api/                   # API clients
│   │   └── utils/                 # Helper functions
│   │
│   ├── hooks/                     # Custom React hooks
│   ├── stores/                    # Zustand stores
│   ├── types/                     # TypeScript types
│   └── styles/                    # Global styles
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   ├── locales/                   # Translation files
│   └── assets/                    # Static assets
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/                          # Documentation
    ├── CLAUDE.md                  # This file
    ├── coding-standards.md
    ├── security-rules.md
    ├── database-naming-conventions.md
    └── api-naming-conventions.md
```

## 🎨 Design Patterns

### Repository Pattern
```typescript
// All database operations go through repositories
interface IRepository<T> {
  findAll(filters?: any): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: any): Promise<T>
  update(id: string, data: any): Promise<T>
  delete(id: string): Promise<void>
}
```

### Service Layer Pattern
```typescript
// Business logic separated from controllers
class VillaService {
  constructor(private repo: VillaRepository) {}
  // Business logic here
}
```

### Custom Hooks Pattern
```typescript
// Encapsulate component logic in hooks
const useVillaSearch = () => {
  // Hook implementation
}
```

## 📝 Commit Message Convention

Format: `<type>(<scope>): <subject>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat(booking): add calendar integration
fix(search): resolve date picker issue
docs(api): update endpoint documentation
```

## 🔗 Related Documentation

- [Coding Standards](./coding-standards.md) - TypeScript, React, Next.js conventions
- [Security Rules](./security-rules.md) - OWASP compliance and security patterns
- [Database Naming](./database-naming-conventions.md) - PostgreSQL schema conventions
- [API Conventions](./api-naming-conventions.md) - RESTful API standards

## 🚀 Development Workflow

1. **Branch Strategy**: Git Flow
   - `main`: Production
   - `develop`: Development
   - `feature/*`: New features
   - `fix/*`: Bug fixes
   - `release/*`: Release preparation

2. **Code Review Requirements**:
   - TypeScript strict mode pass
   - 80% test coverage
   - No console.logs
   - Lighthouse score > 90

3. **Pre-commit Hooks** (Husky):
   - ESLint
   - Prettier
   - Type checking
   - Test suite

## 🎯 Performance Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Bundle Size**: < 200KB (First Load JS)

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Payment
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# OTA Integration
BOOKING_COM_API_KEY=
EXPEDIA_API_KEY=
AGODA_API_KEY=

# Email
RESEND_API_KEY=

# Storage
CLOUDINARY_URL=

# Analytics
NEXT_PUBLIC_GA_ID=
```

## 📞 Contact & Support

- **Project Lead**: [Your Name]
- **Tech Lead**: [Tech Lead Name]
- **Repository**: [GitHub URL]
- **Documentation**: [Docs URL]

---
Last Updated: 2024-12-26
Version: 1.0.0
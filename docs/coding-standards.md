# 📝 Coding Standards - Exclusive Villa Samui

## 🔷 TypeScript Conventions

### Type vs Interface
```typescript
// ✅ Use interface for objects that can be extended
interface Villa {
  id: string
  name: string
  location: Location
}

// ✅ Use type for unions, primitives, and utilities
type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
type VillaWithBookings = Villa & { bookings: Booking[] }
```

### Naming Conventions
```typescript
// PascalCase: Components, Types, Interfaces, Enums
interface UserProfile {}
enum BookingStatus {}
const VillaCard: React.FC = () => {}

// camelCase: Variables, Functions, Methods
const searchVillas = () => {}
let isLoading = false

// UPPER_SNAKE_CASE: Constants
const MAX_GUESTS_PER_VILLA = 10
const API_TIMEOUT = 5000

// Boolean naming: use is/has/should prefixes
const isAvailable = true
const hasPool = false
const shouldRefetch = true
```

### Strict TypeScript Rules
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Assertions
```typescript
// ❌ Avoid type assertions
const villa = data as Villa

// ✅ Use type guards
function isVilla(data: unknown): data is Villa {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  )
}
```

## ⚛️ React Best Practices

### Component Structure
```typescript
// ✅ Correct component structure
import { FC, memo } from 'react'
import { cn } from '@/lib/utils'

interface VillaCardProps {
  villa: Villa
  onSelect?: (id: string) => void
  className?: string
}

export const VillaCard: FC<VillaCardProps> = memo(({
  villa,
  onSelect,
  className
}) => {
  // 1. Hooks first
  const { t } = useTranslation()
  const router = useRouter()
  
  // 2. State and refs
  const [isLoading, setIsLoading] = useState(false)
  
  // 3. Computed values
  const formattedPrice = useMemo(() => 
    formatCurrency(villa.price), [villa.price]
  )
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [])
  
  // 5. Handlers
  const handleClick = useCallback(() => {
    onSelect?.(villa.id)
  }, [villa.id, onSelect])
  
  // 6. Render
  return (
    <div className={cn('villa-card', className)}>
      {/* Component JSX */}
    </div>
  )
})

VillaCard.displayName = 'VillaCard'
```

### Custom Hooks Pattern
```typescript
// ✅ Custom hook with proper return type
interface UseVillaSearchReturn {
  villas: Villa[]
  isLoading: boolean
  error: Error | null
  search: (params: SearchParams) => Promise<void>
  reset: () => void
}

export function useVillaSearch(): UseVillaSearchReturn {
  const [villas, setVillas] = useState<Villa[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const search = useCallback(async (params: SearchParams) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await villaService.search(params)
      setVillas(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const reset = useCallback(() => {
    setVillas([])
    setError(null)
  }, [])
  
  return { villas, isLoading, error, search, reset }
}
```

### Performance Optimization
```typescript
// ✅ Memoization strategies
const ExpensiveComponent = memo(({ data }) => {
  // Memoize expensive computations
  const processedData = useMemo(() => 
    expensiveOperation(data), [data]
  )
  
  // Memoize callbacks
  const handleAction = useCallback((id: string) => {
    // Action logic
  }, [/* dependencies */])
  
  return <div>{/* Render */}</div>
})

// ✅ Code splitting
const AdminDashboard = lazy(() => 
  import('@/features/admin/Dashboard')
)

// ✅ Image optimization
import Image from 'next/image'

<Image
  src={villa.image}
  alt={villa.name}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

## 🚀 Next.js Patterns

### Server Components (Default)
```typescript
// app/[locale]/villas/page.tsx
export default async function VillasPage() {
  // ✅ Fetch data on server
  const villas = await prisma.villa.findMany()
  
  return <VillasList villas={villas} />
}
```

### Client Components (When Needed)
```typescript
'use client'

// Only use for:
// - Interactivity (onClick, onChange)
// - Browser APIs
// - State management
// - Effects
```

### Metadata Management
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const villa = await getVilla(params.id)
  
  return {
    title: `${villa.name} | Exclusive Villa Samui`,
    description: villa.description,
    openGraph: {
      images: [villa.mainImage]
    }
  }
}
```

### Loading & Error States
```typescript
// loading.tsx
export default function Loading() {
  return <VillasSkeleton />
}

// error.tsx
'use client'

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return <ErrorBoundary error={error} retry={reset} />
}
```

## 🎨 UI Component Standards

### shadcn/ui Usage
```typescript
// ✅ Extend shadcn components properly
import { Button, ButtonProps } from '@/components/ui/button'

interface BookingButtonProps extends ButtonProps {
  villaId: string
  dates: DateRange
}

export const BookingButton: FC<BookingButtonProps> = ({
  villaId,
  dates,
  ...props
}) => {
  return (
    <Button
      {...props}
      className={cn('booking-button', props.className)}
    >
      {props.children}
    </Button>
  )
}
```

### Form Handling
```typescript
// ✅ React Hook Form + Zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const bookingSchema = z.object({
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().min(1).max(10),
  specialRequests: z.string().optional()
})

type BookingFormData = z.infer<typeof bookingSchema>

export function BookingForm() {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: 2
    }
  })
  
  const onSubmit = async (data: BookingFormData) => {
    // Handle submission
  }
  
  return (
    <Form {...form}>
      {/* Form fields */}
    </Form>
  )
}
```

## 📦 Import Organization

```typescript
// 1. React/Next imports
import { FC, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 2. Third-party libraries
import { format } from 'date-fns'
import { motion } from 'framer-motion'

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/button'
import { useVillaSearch } from '@/hooks/useVillaSearch'
import { villaService } from '@/services/villa.service'

// 4. Types
import type { Villa } from '@/types/villa'

// 5. Styles (if any)
import styles from './VillaCard.module.css'
```

## 🧪 Testing Standards

### Unit Testing
```typescript
// villa.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { VillaCard } from './VillaCard'

describe('VillaCard', () => {
  const mockVilla = {
    id: '1',
    name: 'Beach Villa',
    price: 5000
  }
  
  it('should render villa information', () => {
    render(<VillaCard villa={mockVilla} />)
    
    expect(screen.getByText('Beach Villa')).toBeInTheDocument()
    expect(screen.getByText('฿5,000')).toBeInTheDocument()
  })
  
  it('should call onSelect when clicked', () => {
    const handleSelect = jest.fn()
    render(
      <VillaCard villa={mockVilla} onSelect={handleSelect} />
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleSelect).toHaveBeenCalledWith('1')
  })
})
```

## 🚫 Anti-Patterns to Avoid

```typescript
// ❌ Don't use any
const data: any = fetchData()

// ❌ Don't use console.log in production
console.log('Debug:', data)

// ❌ Don't mutate state directly
state.villas.push(newVilla)

// ❌ Don't use inline styles
<div style={{ color: 'red' }}>

// ❌ Don't use document.querySelector
document.querySelector('.villa-card')

// ❌ Don't forget error boundaries
throw new Error('Unhandled')

// ❌ Don't use magic numbers
if (guests > 10)

// ❌ Don't ignore TypeScript errors
// @ts-ignore
```

## ✅ Code Review Checklist

- [ ] TypeScript strict mode passes
- [ ] No `any` types
- [ ] All functions have return types
- [ ] Components are memoized where appropriate
- [ ] Custom hooks follow naming convention
- [ ] Forms use React Hook Form + Zod
- [ ] No console.logs
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Accessibility attributes present
- [ ] Responsive design implemented
- [ ] i18n keys used for all text
- [ ] Tests written and passing
- [ ] Documentation updated

---
Last Updated: 2024-12-26
Version: 1.0.0
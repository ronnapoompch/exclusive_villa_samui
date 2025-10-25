import * as React from 'react'
import { cn } from '@/lib/utils'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning'
}

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-md border p-3 text-sm flex gap-2 items-start',
        variant === 'default' && 'bg-background',
        variant === 'destructive' && 'border-destructive/50 text-destructive bg-destructive/10',
        variant === 'success' && 'border-green-500/50 text-green-600 bg-green-500/10',
        variant === 'warning' && 'border-amber-500/50 text-amber-600 bg-amber-500/10',
        className
      )}
      {...props}
    />
  )
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('font-medium leading-none tracking-tight', className)} {...props} />
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn('text-xs opacity-90', className)} {...props} />
}

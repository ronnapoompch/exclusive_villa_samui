import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  requiredMark?: boolean
}

export function Label({ className, requiredMark, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {requiredMark && <span className="text-destructive" aria-hidden>*</span>}
      </span>
    </label>
  )
}

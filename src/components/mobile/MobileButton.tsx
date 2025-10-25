'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'default' | 'large';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    className,
    size = 'default', 
    variant = 'primary',
    fullWidth = false,
    children,
    ...props 
  }, ref) => {
    // Size classes with minimum touch targets
    const sizeClasses = {
      small: 'px-3 py-2 text-sm min-h-[40px]',
      default: 'px-4 py-3 text-base min-h-[44px]',
      large: 'px-6 py-4 text-lg min-h-[48px]'
    };

    // Variant classes
    const variantClasses = {
      primary: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md hover:shadow-lg',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
      ghost: 'text-gray-700 hover:bg-gray-100'
    };

    // Base classes for mobile optimization
    const baseClasses = `
      relative inline-flex items-center justify-center
      font-semibold rounded-xl transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500
      active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
      touch-manipulation select-none
    `;

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

MobileButton.displayName = 'MobileButton';

// Specialized button components for common use cases
export function MobileFloatingActionButton({ 
  children, 
  onClick,
  className,
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-14 h-14 rounded-full',
        'bg-cyan-600 hover:bg-cyan-700 text-white',
        'shadow-lg hover:shadow-xl',
        'flex items-center justify-center',
        'transition-all duration-300',
        'active:scale-95 focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function MobileCardButton({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'w-full p-4 text-left',
        'bg-white hover:bg-gray-50',
        'border border-gray-200 rounded-xl',
        'transition-all duration-200',
        'focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
        'active:scale-98',
        'touch-target',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function MobileIconButton({
  children,
  size = 'default',
  className,
  ...props
}: {
  children: React.ReactNode;
  size?: 'small' | 'default' | 'large';
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizeClasses = {
    small: 'w-10 h-10 p-2',
    default: 'w-11 h-11 p-2.5', 
    large: 'w-12 h-12 p-3'
  };

  return (
    <button
      className={cn(
        'rounded-full',
        'bg-gray-100 hover:bg-gray-200',
        'flex items-center justify-center',
        'transition-all duration-200',
        'focus:ring-2 focus:ring-cyan-500',
        'active:scale-95',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default MobileButton;
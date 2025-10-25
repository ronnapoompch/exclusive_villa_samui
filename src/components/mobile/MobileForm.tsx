'use client';

import { useState, forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ 
    className,
    label,
    error,
    success, 
    hint,
    fullWidth = true,
    type,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `mobile-input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              // Base mobile-optimized styles
              'w-full border border-gray-300 rounded-xl px-4 py-3',
              'text-base', // 16px to prevent iOS zoom
              'placeholder-gray-500',
              'transition-all duration-200',
              'touch-manipulation',
              
              // Focus states
              'focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
              'focus:outline-none',
              
              // Error/Success states
              error && 'border-red-300 focus:ring-red-500',
              success && 'border-green-300 focus:ring-green-500',
              
              // Password input padding
              isPassword && 'pr-12',
              
              className
            )}
            style={{ 
              fontSize: '16px', // Explicit font size to prevent iOS zoom
              WebkitAppearance: 'none', // Remove iOS input styling
              borderRadius: '12px' // Ensure consistent border radius
            }}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 touch-target"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="min-h-[20px] space-y-1">
          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {success && !error && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}
          
          {hint && !error && !success && (
            <p className="text-sm text-gray-500">{hint}</p>
          )}
        </div>
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';

// Mobile-optimized textarea
interface MobileTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  fullWidth?: boolean;
  minRows?: number;
}

export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ 
    className,
    label,
    error,
    success,
    hint,
    fullWidth = true,
    minRows = 3,
    id,
    ...props 
  }, ref) => {
    const textareaId = id || `mobile-textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          rows={minRows}
          className={cn(
            // Base mobile-optimized styles
            'w-full border border-gray-300 rounded-xl px-4 py-3',
            'text-base', // 16px to prevent iOS zoom
            'placeholder-gray-500',
            'transition-all duration-200',
            'touch-manipulation',
            'resize-y',
            
            // Focus states
            'focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
            'focus:outline-none',
            
            // Error/Success states
            error && 'border-red-300 focus:ring-red-500',
            success && 'border-green-300 focus:ring-green-500',
            
            className
          )}
          style={{ 
            fontSize: '16px', // Explicit font size to prevent iOS zoom
            WebkitAppearance: 'none', // Remove iOS styling
            borderRadius: '12px' // Ensure consistent border radius
          }}
          {...props}
        />

        {/* Messages */}
        <div className="min-h-[20px] space-y-1">
          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {success && !error && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}
          
          {hint && !error && !success && (
            <p className="text-sm text-gray-500">{hint}</p>
          )}
        </div>
      </div>
    );
  }
);

MobileTextarea.displayName = 'MobileTextarea';

// Mobile-optimized select
interface MobileSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const MobileSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(
  ({ 
    className,
    label,
    error,
    success,
    hint,
    fullWidth = true,
    id,
    children,
    ...props 
  }, ref) => {
    const selectId = id || `mobile-select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        {/* Select */}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            // Base mobile-optimized styles
            'w-full border border-gray-300 rounded-xl px-4 py-3',
            'text-base bg-white', // 16px to prevent iOS zoom
            'transition-all duration-200',
            'touch-manipulation',
            
            // Focus states
            'focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
            'focus:outline-none',
            
            // Error/Success states
            error && 'border-red-300 focus:ring-red-500',
            success && 'border-green-300 focus:ring-green-500',
            
            className
          )}
          style={{ 
            fontSize: '16px', // Explicit font size to prevent iOS zoom
            WebkitAppearance: 'none', // Remove iOS styling
            borderRadius: '12px' // Ensure consistent border radius
          }}
          {...props}
        >
          {children}
        </select>

        {/* Messages */}
        <div className="min-h-[20px] space-y-1">
          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {success && !error && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}
          
          {hint && !error && !success && (
            <p className="text-sm text-gray-500">{hint}</p>
          )}
        </div>
      </div>
    );
  }
);

MobileSelect.displayName = 'MobileSelect';

export default { MobileInput, MobileTextarea, MobileSelect };
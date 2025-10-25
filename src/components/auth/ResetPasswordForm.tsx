'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: ''
    }
  })

  // If no token, show error state
  if (!token) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Invalid reset link. Please request a new password reset.
        </AlertDescription>
      </Alert>
    )
  }

  // If successful reset, show success state
  if (isSuccess) {
    return (
      <Card className="border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Password Reset Successful</CardTitle>
          <CardDescription className="text-green-600">
            Your password has been updated successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => router.push('/auth/login')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Continue to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Failed to reset password')
        return
      }

      // Success
      toast.success('Password reset successfully!')
      setIsSuccess(true)

    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Hidden token field */}
      <input type="hidden" {...form.register('token')} />

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
            {...form.register('password')}
            className={form.formState.errors.password ? 'border-red-300' : ''}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-600">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your new password"
            {...form.register('confirmPassword')}
            className={form.formState.errors.confirmPassword ? 'border-red-300' : ''}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-600">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Password Requirements */}
      <div className="rounded-md bg-gray-50 p-3">
        <p className="text-xs text-gray-600 mb-2">Password must contain:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• At least 8 characters</li>
          <li>• One uppercase letter (A-Z)</li>
          <li>• One lowercase letter (a-z)</li>
          <li>• One number (0-9)</li>
          <li>• One special character (!@#$%^&*)</li>
        </ul>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting Password...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>
    </form>
  )
}
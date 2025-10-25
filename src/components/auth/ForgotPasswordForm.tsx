'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { Loader2, Mail, CheckCircle } from 'lucide-react'

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  // If form was submitted successfully, show success message
  if (isSubmitted) {
    return (
      <Card className="border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Check Your Email</CardTitle>
          <CardDescription className="text-green-600">
            If an account with this email exists, we&apos;ve sent you a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the email? Check your spam folder or try again in a few minutes.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsSubmitted(false)
              form.reset()
            }}
            className="w-full"
          >
            Send Another Email
          </Button>
        </CardContent>
      </Card>
    )
  }

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || result.message || 'Failed to send reset email')
        return
      }
      
      if (!result.success) {
        toast.error(result.error || 'Failed to send reset email')
        return
      }

      // Success - always show success message for security
      toast.success('Password reset email sent!')
      setIsSubmitted(true)

    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            className="pl-10"
            {...form.register('email')}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Info Text */}
      <div className="rounded-md bg-blue-50 p-3">
        <p className="text-sm text-blue-800">
          We&apos;ll send a secure link to reset your password. The link will expire in 1 hour for security.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-cyan-600 hover:bg-cyan-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Reset Link...
          </>
        ) : (
          'Send Reset Link'
        )}
      </Button>
    </form>
  )
}
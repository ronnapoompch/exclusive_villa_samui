"use client";
import * as React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthService } from '@/services/auth.service'
import { cn } from '@/lib/utils'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      acceptTerms: false,
      preferredLanguage: 'en'
    }
  })

  async function onSubmit(values: RegisterInput) {
    setFormError(null)
    setSuccessMessage(null)
    setLoading(true)
    try {
      const result = await AuthService.register(values)
      if (result.success) {
        setSuccessMessage(result.message || 'Registration successful. Please check your email to verify your account.')
        onSuccess?.()
      } else {
        setFormError(result.error?.message || 'Unable to register. Please try again.')
      }
    } catch (err: any) {
      setFormError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" requiredMark>Name</Label>
          <Input id="name" placeholder="John Doe" {...form.register('name')} error={form.formState.errors.name?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" requiredMark>Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register('email')} error={form.formState.errors.email?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+1 555 555 5555" {...form.register('phone')} error={form.formState.errors.phone?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" requiredMark>Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...form.register('password')} error={form.formState.errors.password?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" requiredMark>Confirm Password</Label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...form.register('confirmPassword')} error={form.formState.errors.confirmPassword?.message} />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="acceptTerms"
            type="checkbox"
            className={cn('h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary')}
            {...form.register('acceptTerms')}
          />
          <Label htmlFor="acceptTerms" className="font-normal">I accept the Terms & Privacy Policy</Label>
        </div>
      </div>
      <Button type="submit" className="w-full" isLoading={loading}>Create Account</Button>
    </form>
  )
}

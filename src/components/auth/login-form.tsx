"use client";
import * as React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthService } from '@/services/auth.service'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  async function onSubmit(values: LoginInput) {
    setFormError(null)
    setSuccessMessage(null)
    setLoading(true)
    try {
      const result = await AuthService.login(values)
      if (result?.ok) {
        setSuccessMessage('Login successful')
        onSuccess?.()
        // Optional navigation (let calling page handle route push if needed)
      } else if (result?.error) {
        setFormError(result.error)
      } else {
        setFormError('Unable to login. Please try again.')
      }
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed')
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
          <Label htmlFor="email" requiredMark>Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" requiredMark>Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register('password')}
            error={form.formState.errors.password?.message}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="rememberMe"
            type="checkbox"
            className={cn('h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary')}
            {...form.register('rememberMe')}
          />
          <Label htmlFor="rememberMe" className="font-normal">Remember me</Label>
        </div>
      </div>
      <Button type="submit" className="w-full" isLoading={loading}>Sign In</Button>
    </form>
  )
}

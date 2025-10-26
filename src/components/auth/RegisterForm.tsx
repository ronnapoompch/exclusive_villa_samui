'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  acceptTerms: boolean
}

interface PasswordStrength {
  score: number
  text: string
  color: string
}

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false
  })
  
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) return { score: 0, text: '', color: '' }
    if (password.length < 6) return { score: 1, text: 'Weak', color: 'text-red-500' }
    if (password.length < 8) return { score: 2, text: 'Fair', color: 'text-yellow-500' }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { score: 2, text: 'Fair', color: 'text-yellow-500' }
    return { score: 3, text: 'Strong', color: 'text-green-500' }
  }

  const passwordStrength = checkPasswordStrength(formData.password)

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Please enter your full name')
      return false
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/en/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone?.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.')
      }

      toast.success('Registration successful! Please check your email to verify your account.')
      router.push('/auth/login?message=registration-success')
      
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="transition-colors"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="transition-colors"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="transition-colors pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
          {formData.password && (
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    passwordStrength.score === 1 ? 'bg-red-500 w-1/3' :
                    passwordStrength.score === 2 ? 'bg-yellow-500 w-2/3' :
                    passwordStrength.score === 3 ? 'bg-green-500 w-full' : 'bg-gray-200 w-0'
                  }`}
                />
              </div>
              <span className={`text-sm font-medium ${passwordStrength.color}`}>
                {passwordStrength.text}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="transition-colors pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Passwords match
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+66xxxxxxxxx"
            value={formData.phone}
            onChange={handleChange}
            disabled={isLoading}
            className="transition-colors"
          />
          <p className="text-sm text-gray-500">Thai phone number format</p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="acceptTerms" className="text-sm">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-2.5 transition-all duration-200" 
          disabled={isLoading || passwordStrength.score < 2 || !formData.acceptTerms}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </div>
  )
}
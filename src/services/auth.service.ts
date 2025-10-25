import { signIn, signOut } from 'next-auth/react'
import type { 
  LoginInput, 
  RegisterInput, 
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput 
} from '@/lib/validations/auth'
import type { ApiResponse } from '@/types'

/**
 * Authentication service following Service Layer Pattern
 * from claude-md.md design patterns
 */

export class AuthService {
  /**
   * User login
   */
  static async login(data: LoginInput): Promise<any> {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  /**
   * User registration
   */
  static async register(data: RegisterInput): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Registration failed')
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  /**
   * User logout
   */
  static async logout(): Promise<void> {
    await signOut({ redirect: true, callbackUrl: '/' })
  }
  
  /**
   * Forgot password
   */
  static async forgotPassword(data: ForgotPasswordInput): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send reset email')
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Reset password
   */
  static async resetPassword(data: ResetPasswordInput): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to reset password')
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Change password (for logged-in users)
   */
  static async changePassword(data: ChangePasswordInput): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to change password')
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to verify email')
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Resend verification email
   */
  static async resendVerificationEmail(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to resend verification email')
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Check if email exists
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/v1/auth/check-email?email=${encodeURIComponent(email)}`)
      const result = await response.json()
      return result.exists
    } catch (error) {
      return false
    }
  }
  
  /**
   * Get current session
   */
  static async getSession() {
    return await fetch('/api/auth/session').then(res => res.json())
  }
  
  /**
   * Enable two-factor authentication
   */
  static async enableTwoFactor(): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/v1/auth/two-factor/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to enable two-factor authentication')
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Verify two-factor code
   */
  static async verifyTwoFactor(code: string): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/v1/auth/two-factor/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Invalid verification code')
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
}
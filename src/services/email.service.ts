import { Resend } from 'resend'

/**
 * Email service using Resend following coding-standards.md service layer patterns
 * Implements email verification and notification system
 */

const resend = new Resend(process.env.RESEND_API_KEY || 'fake-api-key-for-build')

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface SendEmailOptions {
  to: string
  template: EmailTemplate
  from?: string
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(
  to: string, 
  verificationUrl: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const template = generateVerificationTemplate(verificationUrl, userName)
    
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@exclusive-villa-samui.com',
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    return {
      success: true,
      messageId: result.data?.id
    }
  } catch (error: any) {
    console.error('Verification email send error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send verification email'
    }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string, 
  resetUrl: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const template = generatePasswordResetTemplate(resetUrl, userName)
    
    // Development mode: just log the email content
    if (process.env.NODE_ENV === 'development' && (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_placeholder_for_build_only')) {
      // eslint-disable-next-line no-console
      console.log('\n🚀 [DEV MODE] Password Reset Email:')
      // eslint-disable-next-line no-console
      console.log(`📧 To: ${to}`)
      // eslint-disable-next-line no-console
      console.log(`🔗 Reset URL: ${resetUrl}`)
      // eslint-disable-next-line no-console
      console.log(`👤 User: ${userName || 'Unknown'}`)
      // eslint-disable-next-line no-console
      console.log('\n--- Email Content ---')
      // eslint-disable-next-line no-console
      console.log(template.text)
      // eslint-disable-next-line no-console
      console.log('--- End Email ---\n')
      
      return {
        success: true,
        messageId: 'dev-mode-' + Date.now()
      }
    }
    
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@exclusive-villa-samui.com',
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    return {
      success: true,
      messageId: result.data?.id
    }
  } catch (error: any) {
    console.error('Password reset email send error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send password reset email'
    }
  }
}

/**
 * Generate email verification template
 */
function generateVerificationTemplate(verificationUrl: string, userName?: string): EmailTemplate {
  const name = userName ? `Hello ${userName}` : 'Hello'
  
  return {
    subject: 'Verify Your Email - Exclusive Villa Samui',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Exclusive Villa Samui</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 16px;">Luxury Villa Bookings</p>
        </div>
        
        <div style="padding: 40px 20px;">
          <h2 style="color: #1f2937; margin-bottom: 16px;">${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 32px;">
            Thank you for creating an account with Exclusive Villa Samui. Please verify your email address to complete your registration and start booking our luxury villas.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background: #0ea5e9; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
            If you didn't create this account, please ignore this email. The verification link will expire in 24 hours.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 24px;">
            If the button above doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all;">${verificationUrl}</span>
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2025 Exclusive Villa Samui. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      ${name}!
      
      Thank you for creating an account with Exclusive Villa Samui. Please verify your email address to complete your registration.
      
      Verify your email: ${verificationUrl}
      
      If you didn't create this account, please ignore this email. The verification link will expire in 24 hours.
      
      © 2025 Exclusive Villa Samui
    `.trim()
  }
}

/**
 * Generate password reset template
 */
function generatePasswordResetTemplate(resetUrl: string, userName?: string): EmailTemplate {
  const name = userName ? `Hello ${userName}` : 'Hello'
  
  return {
    subject: 'Password Reset - Exclusive Villa Samui',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 16px;">Exclusive Villa Samui</p>
        </div>
        
        <div style="padding: 40px 20px;">
          <h2 style="color: #1f2937; margin-bottom: 16px;">${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 32px;">
            We received a request to reset your password for your Exclusive Villa Samui account. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
            If you didn't request a password reset, please ignore this email. The reset link will expire in 1 hour for security.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 24px;">
            If the button above doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all;">${resetUrl}</span>
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2025 Exclusive Villa Samui. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      ${name}!
      
      We received a request to reset your password for your Exclusive Villa Samui account.
      
      Reset your password: ${resetUrl}
      
      If you didn't request a password reset, please ignore this email. The reset link will expire in 1 hour.
      
      © 2025 Exclusive Villa Samui
    `.trim()
  }
}

/**
 * Send custom email with template
 */
export async function sendCustomEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: options.from || process.env.RESEND_FROM_EMAIL || 'noreply@exclusive-villa-samui.com',
      to: options.to,
      subject: options.template.subject,
      html: options.template.html,
      text: options.template.text
    })

    return {
      success: true,
      messageId: result.data?.id
    }
  } catch (error: any) {
    console.error('Custom email send error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send email'
    }
  }
}
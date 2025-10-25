'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyRequestPage() {
  const handleResend = () => {
    window.location.reload()
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <div className="text-3xl">📧</div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Check Your Email</CardTitle>
          <CardDescription className="text-gray-600">
            We've sent you a secure sign-in link
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              A magic link has been sent to your email address. Click the link to sign in to your account.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-lg">ℹ️</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-800 mb-1">Important Notes:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• The link will expire in 24 hours</li>
                    <li>• Check your spam folder if you don't see it</li>
                    <li>• Only works for registered email addresses</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Didn't receive the email?
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={handleResend} className="w-full">
                Resend Magic Link
              </Button>
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
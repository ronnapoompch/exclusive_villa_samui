'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Loader2, Shield } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    console.log('🔍 AdminGuard: Checking session...', { 
      status, 
      session,
      sessionUser: session?.user,
      sessionUserRole: session?.user ? (session.user as any).role : 'NO_USER'
    })
    
    if (status === 'loading') {
      console.log('⏳ AdminGuard: Still loading session...')
      return
    }

    setIsChecking(false)

    if (status === 'unauthenticated' || !session?.user) {
      console.log('❌ AdminGuard: No session found, forcing redirect to admin login')
      console.log('❌ Session data:', { status, session, user: session?.user })
      setRedirecting(true)
      // Force redirect without NextAuth interference  
      setTimeout(() => {
        window.location.replace('/admin/login')
      }, 100)
      return
    }

    const userRole = (session.user as any).role
    console.log('👤 AdminGuard: User role detected:', userRole)
    console.log('📊 Full session data:', JSON.stringify(session, null, 2))

    if (userRole !== 'ADMIN') {
      console.log('🚫 AdminGuard: Access denied - not admin role')
      console.log('🚫 Expected: ADMIN, Got:', userRole)
      setRedirecting(true)
      setTimeout(() => {
        window.location.replace('/admin/unauthorized')  
      }, 100)
      return
    }

    console.log('✅ AdminGuard: Admin access GRANTED for:', session.user.email)
    setHasAccess(true)
  }, [session, status])

  // Block rendering until session is checked
  if (isChecking || status === 'loading') {
    console.log('🔄 AdminGuard: Showing loading state...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
          <div className="mt-4 text-xs text-gray-500">
            Status: {status} | Session: {session ? 'EXISTS' : 'NULL'}
          </div>
        </div>
      </div>
    )
  }

  // Block rendering if redirecting
  if (redirecting || !hasAccess) {
    console.log('🛑 AdminGuard: Access blocked - redirecting...')
    console.log('🛑 Redirect reason:', { redirecting, hasAccess, status, userRole: session?.user ? (session.user as any).role : 'NO_USER' })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Verification</h2>
          <p className="text-gray-600 mb-4">Checking admin credentials...</p>
          <div className="text-xs text-gray-500">
            Status: {status} | Redirecting: {redirecting ? 'YES' : 'NO'} | Access: {hasAccess ? 'GRANTED' : 'DENIED'}
          </div>
        </div>
      </div>
    )
  }

  console.log('🎯 AdminGuard: Rendering admin content')
  
  // Show admin content if authenticated and authorized
  return <>{children}</>
}

export default AdminGuard
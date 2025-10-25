'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2, Shield, AlertCircle } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      console.log('🔍 AdminGuard: Checking access...', {
        status,
        pathname,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        userRole: (session?.user as any)?.role
      })

      // ยัง loading อยู่
      if (status === 'loading') {
        console.log('⏳ AdminGuard: Session loading...')
        return
      }

      setIsChecking(false)

      // ไม่มี session หรือไม่ได้ login
      if (status === 'unauthenticated' || !session?.user) {
        console.log('❌ AdminGuard: No authentication, redirecting to login')
        if (pathname !== '/admin/login') {
          router.replace('/admin/login')
        }
        return
      }

      // ตรวจสอบ role
      const userRole = (session.user as any)?.role
      console.log('👤 AdminGuard: Checking role:', userRole)

      if (userRole !== 'ADMIN') {
        console.log('🚫 AdminGuard: Access denied - not admin role')
        setAccessDenied(true)
        return
      }

      console.log('✅ AdminGuard: Access granted for admin user:', session.user.email)
    }

    checkAccess()
  }, [session, status, router, pathname])

  // แสดง loading
  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">กำลังตรวจสอบสิทธิ์...</h2>
          <p className="text-gray-500">กรุณารอสักครู่</p>
        </div>
      </div>
    )
  }

  // ไม่ได้ login หรือไม่มีสิทธิ์
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">กำลังเปลี่ยนเส้นทาง...</h2>
          <p className="text-gray-600">กรุณาเข้าสู่ระบบ Admin</p>
        </div>
      </div>
    )
  }

  // ไม่มีสิทธิ์ Admin
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าใช้งาน</h2>
          <p className="text-gray-600 mb-4">คุณไม่มีสิทธิ์เข้าใช้งานระบบ Admin</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    )
  }

  // มีสิทธิ์ Admin - แสดงเนื้อหา
  console.log('🎯 AdminGuard: Rendering admin content for:', session.user.email)
  return <>{children}</>
}

export default AdminGuard
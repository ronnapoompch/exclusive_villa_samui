'use client'

import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminNavigation from '@/components/admin/AdminNavigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Don't show navigation on login and unauthorized pages
  const hideNavigation = pathname === '/admin/login' || pathname === '/admin/unauthorized'

  if (hideNavigation) {
    return (
      <SessionProvider>
        {children}
      </SessionProvider>
    )
  }

  return (
    <SessionProvider>
      <AdminGuard>
        <div className="min-h-screen bg-gray-50">
          <AdminNavigation />
          
          {/* Main content */}
          <div className="lg:pl-64">
            <div className="flex flex-col flex-1">
              <main className="flex-1">
                {children}
              </main>
            </div>
          </div>
        </div>
      </AdminGuard>
    </SessionProvider>
  )
}
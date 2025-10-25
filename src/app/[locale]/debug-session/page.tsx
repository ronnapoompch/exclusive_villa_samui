'use client'

import { useSession } from 'next-auth/react'

function DebugContent() {
  const { data: session, status } = useSession()
  
  console.log('🔥 DEBUG SESSION PAGE:', {
    status,
    session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    userRole: (session?.user as any)?.role
  })

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔍 Session Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Status:</h2>
          <p className="font-mono text-lg">{status}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Session Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(session, null, 2) || 'null'}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">User Info:</h2>
          <p><strong>Has User:</strong> {session?.user ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
          <p><strong>Role:</strong> {(session?.user as any)?.role || 'N/A'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Actions:</h2>
          <div className="space-x-2">
            <a href="/admin/login" className="bg-blue-500 text-white px-4 py-2 rounded">
              Go to Admin Login
            </a>
            <a href="/admin/dashboard" className="bg-green-500 text-white px-4 py-2 rounded">
              Go to Admin Dashboard
            </a>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DebugSessionPage() {
  return <DebugContent />
}
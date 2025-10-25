'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function AdminTestPage() {
  const { data: session, status } = useSession()
  const [loginData, setLoginData] = useState({
    email: 'admin@exclusivevillasamui.com',
    password: 'admin123'
  })

  const handleLogin = async () => {
    console.log('🔐 Attempting login...')
    const result = await signIn('credentials', {
      email: loginData.email,
      password: loginData.password,
      redirect: false
    })
    
    console.log('📊 Login result:', result)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">🔧 Admin System Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">📊 Session Status</h2>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>User:</strong> {session?.user ? 'Logged In' : 'Not Logged In'}</p>
            <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
            <p><strong>Role:</strong> {(session?.user as any)?.role || 'N/A'}</p>
          </div>
          
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">🔍 Full Session Data</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          {!session?.user ? (
            <div className="p-4 border rounded">
              <h2 className="font-semibold mb-2">🔐 Login Test</h2>
              <div className="space-y-2">
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Email"
                />
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Password"
                />
                <button
                  onClick={handleLogin}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Test Login
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded">
              <h2 className="font-semibold mb-2">🚪 Logout</h2>
              <button
                onClick={() => signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          )}
          
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">🎯 Navigation</h2>
            <div className="space-x-2">
              <a href="/admin/login" className="bg-gray-500 text-white px-3 py-1 rounded text-sm">
                Admin Login
              </a>
              <a href="/admin/dashboard" className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                Admin Dashboard  
              </a>
              <a href="/" className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
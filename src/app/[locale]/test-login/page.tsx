'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function TestPage() {
  const { data: session, status } = useSession()
  const [loginData, setLoginData] = useState({
    email: 'admin@exclusivevillasamui.com',
    password: 'admin123'
  })
  const [loginResult, setLoginResult] = useState<string | null>(null)

  const handleLogin = async () => {
    console.log('🔐 Attempting login...')
    setLoginResult('Logging in...')
    
    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false
      })
      
      console.log('📊 Login result:', result)
      setLoginResult(JSON.stringify(result, null, 2))
      
      if (result?.ok) {
        console.log('✅ Login successful! Redirecting to dashboard...')
        setTimeout(() => {
          window.location.href = '/admin/dashboard'
        }, 1000)
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setLoginResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">🔧 Login System Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded bg-blue-50">
            <h2 className="font-semibold mb-2">📊 Current Session Status</h2>
            <p><strong>Status:</strong> <span className="font-mono">{status}</span></p>
            <p><strong>Authenticated:</strong> <span className="font-mono">{session?.user ? '✅ Yes' : '❌ No'}</span></p>
            <p><strong>Email:</strong> <span className="font-mono">{session?.user?.email || 'N/A'}</span></p>
            <p><strong>Role:</strong> <span className="font-mono">{(session?.user as any)?.role || 'N/A'}</span></p>
          </div>
          
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-semibold mb-2">🔍 Full Session Object</h2>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40 border">
              {JSON.stringify(session, null, 2) || 'null'}
            </pre>
          </div>
          
          {!session?.user ? (
            <div className="p-4 border rounded bg-green-50">
              <h2 className="font-semibold mb-2">🔐 Admin Login Test</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Email:</label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full p-2 border rounded focus:border-blue-500"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password:</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full p-2 border rounded focus:border-blue-500"
                    placeholder="Password"
                  />
                </div>
                <button
                  onClick={handleLogin}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                >
                  🚀 Test Admin Login
                </button>
                
                {loginResult && (
                  <div className="mt-3 p-3 bg-gray-100 rounded">
                    <h3 className="font-medium mb-2">Login Result:</h3>
                    <pre className="text-xs">{loginResult}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded bg-yellow-50">
              <h2 className="font-semibold mb-2">🎉 Logged In Successfully!</h2>
              <p className="mb-3">You are logged in as: <strong>{session.user.email}</strong></p>
              <div className="space-y-2">
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
                >
                  🚪 Sign Out
                </button>
                <button
                  onClick={() => window.location.href = '/admin/dashboard'}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  🎯 Go to Admin Dashboard
                </button>
              </div>
            </div>
          )}
          
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">🔗 Quick Links</h2>
            <div className="space-x-2 space-y-1">
              <a href="/admin/login" className="inline-block bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
                Admin Login Page
              </a>
              <a href="/admin/dashboard" className="inline-block bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                Admin Dashboard  
              </a>
              <a href="/" className="inline-block bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                Home Page
              </a>
            </div>
          </div>
          
          <div className="p-4 border rounded bg-orange-50">
            <h2 className="font-semibold mb-2">📝 Test Instructions</h2>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Use the login form above with admin credentials</li>
              <li>Check the session status after login</li>
              <li>Look for AdminGuard debug logs in browser console</li>
              <li>Try accessing admin dashboard after successful login</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
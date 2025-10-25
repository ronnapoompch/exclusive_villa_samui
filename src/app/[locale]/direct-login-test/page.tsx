'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'

export default function DirectLoginTest() {
  const [email, setEmail] = useState('me.shlk,ki5')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testLogin = async () => {
    setLoading(true)
    setResult(null)
    
    console.log('🔐 Testing direct signIn...')
    
    try {
      // ทดสอบ signIn
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      console.log('📝 signIn result:', signInResult)
      
      if (signInResult?.ok) {
        // ถ้า signIn สำเร็จ ลองดึง session
        const session = await getSession()
        console.log('✅ Session after login:', session)
        
        setResult({
          signInResult,
          session,
          status: 'success'
        })
      } else {
        setResult({
          signInResult,
          session: null,
          status: 'failed',
          error: signInResult?.error
        })
      }
    } catch (error) {
      console.error('❌ Login test error:', error)
      setResult({
        status: 'error',
        error: (error as Error).message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔑 Direct Login Test</h1>
      
      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing Login...' : 'Test Direct Login'}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Test Results:</h2>
          
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="mb-2">
              <strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                result.status === 'success' ? 'bg-green-100 text-green-800' :
                result.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {result.status}
              </span>
            </div>
            
            <div className="mt-4">
              <strong>Full Result:</strong>
              <pre className="mt-2 bg-white p-3 rounded border text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t">
        <h3 className="font-semibold mb-2">Quick Actions:</h3>
        <div className="space-x-2">
          <a href="/admin/dashboard" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Go to Dashboard
          </a>
          <a href="/debug-session" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Debug Session
          </a>
        </div>
      </div>
    </div>
  )
}
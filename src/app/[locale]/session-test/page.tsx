'use client'

import { useEffect, useState } from 'react'

export default function SessionTestPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔄 Fetching session directly...')
    
    fetch('/api/auth/session')
      .then(res => {
        console.log('📡 Session response status:', res.status)
        return res.json()
      })
      .then(data => {
        console.log('📄 Session data received:', data)
        setSessionData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('❌ Session fetch error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🧪 Direct Session Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Loading State:</h2>
          <p className="font-mono text-lg">{loading ? 'Loading...' : 'Completed'}</p>
        </div>
        
        {error && (
          <div className="p-4 border border-red-300 rounded bg-red-50">
            <h2 className="font-semibold mb-2 text-red-600">Error:</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Direct Session Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(sessionData, null, 2) || 'null'}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Actions:</h2>
          <div className="space-x-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Refresh Page
            </button>
            <a href="/debug-session" className="bg-blue-500 text-white px-4 py-2 rounded">
              Go to useSession Test
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
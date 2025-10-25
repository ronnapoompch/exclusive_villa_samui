'use client'

import { getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function BasicSessionTest() {
  const [result, setResult] = useState<string>('Testing...')

  useEffect(() => {
    console.log('🔍 Testing getSession...')
    
    getSession()
      .then(session => {
        console.log('✅ getSession result:', session)
        setResult(`getSession works: ${JSON.stringify(session, null, 2)}`)
      })
      .catch(err => {
        console.error('❌ getSession error:', err)
        setResult(`getSession error: ${err.message}`)
      })
  }, [])

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">⚡ Basic Session Test</h1>
      
      <div className="p-4 border rounded">
        <h2 className="font-semibold mb-2">getSession() Result:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm whitespace-pre-wrap">
          {result}
        </pre>
      </div>

      <div className="mt-4">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Refresh Test
        </button>
      </div>
    </div>
  )
}
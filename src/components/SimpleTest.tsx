'use client'

import { useState } from 'react'

export default function SimpleTest() {
  const [count, setCount] = useState(0)
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      margin: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 99999,
      position: 'relative'
    }}>
      <h2>Simple Test Component</h2>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          margin: '4px'
        }}
      >
        Increment
      </button>
      <button 
        onClick={() => alert('Alert works!')}
        style={{
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          margin: '4px'
        }}
      >
        Alert Test
      </button>
      <input 
        type="text" 
        placeholder="Type here..."
        style={{
          border: '1px solid #d1d5db',
          padding: '8px',
          borderRadius: '4px',
          margin: '4px'
        }}
        onChange={(e) => console.warn('Input:', e.target.value)}
      />
    </div>
  )
}
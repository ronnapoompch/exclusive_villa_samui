export default function TestPage() {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1>✅ Test Page Working</h1>
      <p>If you see this, Next.js is running correctly.</p>
      <div>
        <h2>Environment Check:</h2>
        <ul>
          <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || '❌ Missing'}</li>
          <li>DATABASE_URL: {process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}</li>
          <li>BLOB_TOKEN: {process.env.BLOB_READ_WRITE_TOKEN ? '✅ Set' : '❌ Missing'}</li>
        </ul>
      </div>
    </div>
  )
}

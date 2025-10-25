// Test current session and admin access
async function testSession() {
  console.log('🧪 Testing Current Admin Session...')
  
  try {
    // Test session endpoint
    const sessionResponse = await fetch('/api/auth/session')
    const sessionData = await sessionResponse.json()
    
    console.log('Current session:', sessionData)
    
    if (sessionData?.user) {
      console.log('User found:', sessionData.user.email)
      console.log('Role:', sessionData.user.role)
      
      if (sessionData.user.role === 'ADMIN') {
        console.log('✅ Admin session valid')
      } else {
        console.log('❌ User is not admin')
      }
    } else {
      console.log('❌ No session found')
    }
    
    return sessionData
  } catch (error) {
    console.error('Session test error:', error)
  }
}

// Test in browser console
testSession()
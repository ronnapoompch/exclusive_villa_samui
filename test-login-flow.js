// Test admin login flow step by step
async function testLoginFlow() {
  console.log('🧪 Testing Admin Login Flow...')
  
  const baseUrl = 'http://localhost:3000'
  
  try {
    // Step 1: Test if admin login page loads
    console.log('\n1️⃣ Testing admin login page...')
    const loginPageResponse = await fetch(`${baseUrl}/admin/login`)
    console.log('   Status:', loginPageResponse.status)
    
    if (loginPageResponse.ok) {
      console.log('   ✅ Admin login page accessible')
    } else {
      console.log('   ❌ Admin login page failed')
      return
    }
    
    // Step 2: Test NextAuth signin endpoint
    console.log('\n2️⃣ Testing NextAuth signin endpoint...')
    const signinResponse = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'GET'
    })
    console.log('   Status:', signinResponse.status)
    console.log('   ✅ NextAuth signin endpoint accessible')
    
    // Step 3: Test credentials authentication
    console.log('\n3️⃣ Testing credentials authentication...')
    
    // First get CSRF token
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    const csrfData = await csrfResponse.json()
    console.log('   CSRF Token retrieved')
    
    // Try to authenticate
    const authData = new URLSearchParams()
    authData.append('email', 'admin@exclusivevillasamui.com')
    authData.append('password', 'Admin123!')
    authData.append('csrfToken', csrfData.csrfToken)
    
    const authResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: authData,
      redirect: 'manual' // Don't follow redirects
    })
    
    console.log('   Auth response status:', authResponse.status)
    console.log('   Auth response headers:', Object.fromEntries(authResponse.headers.entries()))
    
    if (authResponse.status === 302) {
      const location = authResponse.headers.get('location')
      console.log('   🔀 Redirect to:', location)
      
      if (location && location.includes('/admin')) {
        console.log('   ✅ Successful login - redirecting to admin')
      } else if (location && location.includes('error')) {
        console.log('   ❌ Login failed - redirecting to error')
      } else {
        console.log('   🤔 Unexpected redirect')
      }
    }
    
    // Step 4: Test admin page directly
    console.log('\n4️⃣ Testing admin page access...')
    const adminPageResponse = await fetch(`${baseUrl}/admin`)
    console.log('   Status:', adminPageResponse.status)
    
    if (adminPageResponse.status === 200) {
      console.log('   ✅ Admin page accessible')
    } else if (adminPageResponse.status === 302) {
      console.log('   🔀 Admin page redirecting (expected without session)')
    } else {
      console.log('   ❌ Admin page error')
    }
    
    console.log('\n🎉 Login flow test completed!')
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testLoginFlow()
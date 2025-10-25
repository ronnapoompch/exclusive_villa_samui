// Test admin login redirect issue
async function testAdminRedirect() {
  console.log('🔍 Testing Admin Login Redirect Issue...')
  
  const baseUrl = 'http://localhost:3000'
  
  try {
    // Test 1: Direct admin page access (should redirect to admin login)
    console.log('\n1️⃣ Testing direct /admin access...')
    const adminResponse = await fetch(`${baseUrl}/admin`, { redirect: 'manual' })
    console.log('   Status:', adminResponse.status)
    
    if (adminResponse.status === 302) {
      const location = adminResponse.headers.get('location')
      console.log('   Redirect to:', location)
      
      if (location && location.includes('/admin/login')) {
        console.log('   ✅ Correctly redirects to admin login')
      } else if (location && location.includes('/auth/login')) {
        console.log('   ❌ PROBLEM: Redirects to user login instead!')
      } else {
        console.log('   🤔 Unexpected redirect:', location)
      }
    }
    
    // Test 2: Admin login page access
    console.log('\n2️⃣ Testing /admin/login access...')
    const loginResponse = await fetch(`${baseUrl}/admin/login`)
    console.log('   Status:', loginResponse.status)
    
    if (loginResponse.ok) {
      console.log('   ✅ Admin login page accessible')
    } else {
      console.log('   ❌ Admin login page failed')
    }
    
    // Test 3: Check NextAuth session endpoint
    console.log('\n3️⃣ Testing session endpoint...')
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`)
    const sessionData = await sessionResponse.json()
    console.log('   Current session:', sessionData)
    
    // Test 4: Test admin login attempt
    console.log('\n4️⃣ Testing admin login process...')
    
    // Get CSRF token
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    const csrfData = await csrfResponse.json()
    
    // Attempt login
    const formData = new URLSearchParams()
    formData.append('email', 'admin@exclusivevillasamui.com')
    formData.append('password', 'Admin123!')
    formData.append('csrfToken', csrfData.csrfToken)
    formData.append('callbackUrl', `${baseUrl}/admin`)
    
    const loginAttempt = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
      redirect: 'manual'
    })
    
    console.log('   Login attempt status:', loginAttempt.status)
    
    if (loginAttempt.status === 302) {
      const loginLocation = loginAttempt.headers.get('location')
      console.log('   Login redirect to:', loginLocation)
      
      if (loginLocation && loginLocation.includes('/admin')) {
        console.log('   ✅ Login successful - redirecting to admin')
      } else if (loginLocation && loginLocation.includes('error')) {
        console.log('   ❌ Login failed')
        const errorUrl = new URL(loginLocation)
        console.log('   Error:', errorUrl.searchParams.get('error'))
      } else {
        console.log('   🤔 Unexpected login redirect')
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testAdminRedirect()
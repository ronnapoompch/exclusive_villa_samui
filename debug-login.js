// Debug admin login process
const fetch = require('node-fetch')

async function debugLogin() {
  console.log('🔍 Debugging Admin Login Process...')
  
  const baseUrl = 'http://localhost:3000'
  let cookies = ''
  
  try {
    console.log('\n📍 Step 1: Get login page')
    const loginPage = await fetch(`${baseUrl}/admin/login`)
    console.log('   Status:', loginPage.status)
    
    // Get cookies from login page
    const setCookieHeaders = loginPage.headers.raw()['set-cookie'] || []
    cookies = setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ')
    console.log('   Cookies received:', cookies ? 'Yes' : 'No')
    
    console.log('\n📍 Step 2: Get CSRF token')
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`, {
      headers: { Cookie: cookies }
    })
    const csrfData = await csrfResponse.json()
    console.log('   CSRF token:', csrfData.csrfToken ? 'Received' : 'Missing')
    
    console.log('\n📍 Step 3: Test signin endpoint')
    const signinTest = await fetch(`${baseUrl}/api/auth/signin`, {
      headers: { Cookie: cookies }
    })
    console.log('   Signin endpoint status:', signinTest.status)
    
    console.log('\n📍 Step 4: Test credentials provider')
    const providers = await fetch(`${baseUrl}/api/auth/providers`, {
      headers: { Cookie: cookies }
    })
    const providersData = await providers.json()
    console.log('   Providers:', Object.keys(providersData))
    
    console.log('\n📍 Step 5: Attempt login')
    const formData = new URLSearchParams()
    formData.append('email', 'admin@exclusivevillasamui.com')
    formData.append('password', 'Admin123!')
    formData.append('csrfToken', csrfData.csrfToken)
    formData.append('callbackUrl', `${baseUrl}/admin`)
    formData.append('json', 'true')
    
    const loginAttempt = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies
      },
      body: formData,
      redirect: 'manual'
    })
    
    console.log('   Login attempt status:', loginAttempt.status)
    console.log('   Login response headers:', Object.fromEntries(loginAttempt.headers.entries()))
    
    if (loginAttempt.status === 302) {
      const location = loginAttempt.headers.get('location')
      console.log('   🔀 Redirect location:', location)
      
      if (location.includes('error')) {
        console.log('   ❌ Login failed with error')
        const errorUrl = new URL(location)
        console.log('   Error:', errorUrl.searchParams.get('error'))
      } else if (location.includes('/admin')) {
        console.log('   ✅ Login successful - redirecting to admin')
      }
    }
    
    console.log('\n📍 Step 6: Check session after login')
    const newCookies = loginAttempt.headers.raw()['set-cookie'] || []
    const allCookies = [...setCookieHeaders, ...newCookies].map(cookie => cookie.split(';')[0]).join('; ')
    
    const sessionCheck = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { Cookie: allCookies }
    })
    const sessionData = await sessionCheck.json()
    console.log('   Session data:', sessionData)
    
  } catch (error) {
    console.error('❌ Debug error:', error.message)
  }
}

debugLogin()
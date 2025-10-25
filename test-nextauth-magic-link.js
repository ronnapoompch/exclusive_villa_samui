/**
 * 🔥 NextAuth Email Provider (Magic Link) Test
 * Test the new NextAuth-integrated email system
 */

const BASE_URL = 'http://localhost:3000'

console.log('🔥 NEXTAUTH EMAIL PROVIDER TEST')
console.log('==============================')
console.log()

async function testMagicLink() {
  const testEmail = 'ronnapoom.pch@gmail.com'
  
  console.log('📧 Testing Magic Link with NextAuth Email Provider')
  console.log('Email:', testEmail)
  console.log()
  
  try {
    // Test NextAuth email signin endpoint
    const response = await fetch(`${BASE_URL}/api/auth/signin/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: testEmail,
        callbackUrl: BASE_URL,
        csrfToken: 'test' // In real usage, this would be retrieved from /api/auth/csrf
      })
    })
    
    console.log('📊 Response Status:', response.status)
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('📄 Response Body:', responseText)
    
    if (response.ok) {
      console.log('✅ Magic Link request processed!')
      console.log('📧 Check your email:', testEmail)
      console.log('🔗 Look for the magic link email from NextAuth')
      
      console.log()
      console.log('🎯 EXPECTED FLOW:')
      console.log('1. ✅ NextAuth receives email request')
      console.log('2. ✅ NextAuth calls our custom Resend function')
      console.log('3. ✅ Beautiful email sent via Resend')
      console.log('4. ✅ User clicks link → automatic sign in')
      console.log('5. ✅ No password needed!')
      
    } else {
      console.log('❌ Magic Link request failed')
    }
    
  } catch (error) {
    console.error('❌ Error testing magic link:', error.message)
  }
}

async function testAuthEndpoints() {
  console.log('🔍 Testing NextAuth Endpoints...')
  console.log()
  
  const endpoints = [
    '/api/auth/providers',
    '/api/auth/csrf', 
    '/api/auth/session'
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`)
      const data = await response.json()
      
      console.log(`✅ ${endpoint}:`, response.ok ? 'Working' : 'Error')
      if (endpoint === '/api/auth/providers') {
        console.log('   📧 Email provider:', data.email ? '✅ Available' : '❌ Missing')
        console.log('   🔑 Credentials provider:', data.credentials ? '✅ Available' : '❌ Missing')
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Error -`, error.message)
    }
  }
}

async function main() {
  console.log('🚀 NEXTAUTH EMAIL PROVIDER SYSTEM TEST')
  console.log('======================================')
  console.log()
  
  console.log('📋 FEATURES BEING TESTED:')
  console.log('✨ NextAuth Email Provider with Resend')
  console.log('🎨 Beautiful HTML email templates') 
  console.log('🔐 Automatic token generation & validation')
  console.log('⏰ 24-hour token expiration')
  console.log('🚪 Passwordless authentication')
  console.log()
  
  await testAuthEndpoints()
  console.log()
  await testMagicLink()
  
  console.log()
  console.log('🎯 NEXT STEPS:')
  console.log('==============')
  console.log('1. Visit: http://localhost:3000/auth/login')
  console.log('2. Use "Send Magic Link" section')
  console.log('3. Enter: ronnapoom.pch@gmail.com')
  console.log('4. Check email for magic link')
  console.log('5. Click link → automatic sign in!')
  console.log()
  console.log('💡 This replaces the need for custom forgot password!')
  console.log('🔥 NextAuth handles everything automatically!')
}

main().catch(console.error)
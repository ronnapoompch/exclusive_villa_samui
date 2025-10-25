const { chromium } = require('playwright')

async function testAdminLogin() {
  console.log('🚀 Starting Admin Login Test...')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  })
  
  try {
    const page = await browser.newPage()
    
    // Navigate to admin login
    console.log('📍 Navigating to admin login page...')
    await page.goto('http://localhost:3002/admin/login')
    await page.waitForTimeout(2000)
    
    // Fill login form
    console.log('📝 Filling login form...')
    await page.fill('input[name="email"]', 'admin@exclusivevillasamui.com')
    await page.fill('input[name="password"]', 'Admin123!')
    await page.waitForTimeout(1000)
    
    // Submit form
    console.log('🔐 Submitting login form...')
    await page.click('button[type="submit"]')
    
    // Wait for navigation
    console.log('⏳ Waiting for navigation...')
    await page.waitForTimeout(3000)
    
    // Check current URL
    const currentUrl = page.url()
    console.log('📍 Current URL:', currentUrl)
    
    // Check if redirected to admin page
    if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
      console.log('✅ Login successful - Redirected to admin area')
      
      // Take screenshot
      await page.screenshot({ path: 'admin-login-success.png' })
      console.log('📸 Screenshot saved as admin-login-success.png')
      
    } else if (currentUrl.includes('/admin/login')) {
      console.log('❌ Login failed - Still on login page')
      
      // Check for error messages
      const errorElements = await page.locator('.text-red-500, [role="alert"], .error').count()
      if (errorElements > 0) {
        const errorText = await page.locator('.text-red-500, [role="alert"], .error').first().textContent()
        console.log('🚨 Error message:', errorText)
      }
      
      // Take screenshot
      await page.screenshot({ path: 'admin-login-failed.png' })
      console.log('📸 Screenshot saved as admin-login-failed.png')
      
    } else {
      console.log('🤔 Unexpected redirect:', currentUrl)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  } finally {
    await browser.close()
    console.log('🏁 Test completed')
  }
}

// Run without Playwright if not available
async function simpleTest() {
  console.log('🧪 Testing with simple HTTP requests...')
  
  try {
    // Test login endpoint
    const response = await fetch('http://localhost:3002/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@exclusivevillasamui.com',
        password: 'Admin123!'
      })
    })
    
    console.log('📡 Login response status:', response.status)
    
    if (response.ok) {
      console.log('✅ Login API working')
    } else {
      console.log('❌ Login API failed')
    }
    
  } catch (error) {
    console.error('❌ Simple test error:', error.message)
  }
}

// Try Playwright first, fall back to simple test
testAdminLogin().catch(() => {
  console.log('⚠️ Playwright not available, running simple test...')
  simpleTest()
})
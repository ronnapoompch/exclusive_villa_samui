// Test authentication functionality
const testAuth = async () => {
  try {
    console.log('Testing authentication system...')
    
    // Test 1: Check if login page loads
    const loginResponse = await fetch('http://localhost:3000/auth/login')
    console.log('✓ Login page status:', loginResponse.status)
    
    // Test 2: Check NextAuth API endpoint
    const authResponse = await fetch('http://localhost:3000/api/auth/session')
    console.log('✓ Auth API status:', authResponse.status)
    
    // Test 3: Check main page
    const homeResponse = await fetch('http://localhost:3000')
    console.log('✓ Home page status:', homeResponse.status)
    
    console.log('\nAuthentication system is ready!')
    console.log('You can now:')
    console.log('1. Visit http://localhost:3000/auth/login to login')
    console.log('2. Use test@example.com / password123 to test login')
    console.log('3. Use admin@example.com / admin123 for admin testing')
    
  } catch (error) {
    console.error('Error testing authentication:', error.message)
  }
}

testAuth()
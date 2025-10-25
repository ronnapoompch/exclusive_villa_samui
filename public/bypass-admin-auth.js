// Ultimate admin authentication bypass
async function bypassAdminAuth() {
  console.log('🚀 BYPASSING ADMIN AUTH - NUCLEAR OPTION')
  
  try {
    // Clear all existing sessions and cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ Cleared all browser data')
    
    // Force login with admin credentials
    const csrfResponse = await fetch('/api/auth/csrf')
    const { csrfToken } = await csrfResponse.json()
    
    const formData = new FormData()
    formData.append('email', 'admin@exclusivevillasamui.com')
    formData.append('password', 'Admin123!')
    formData.append('csrfToken', csrfToken)
    formData.append('callbackUrl', '/admin/dashboard')
    
    const loginResponse = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      body: formData,
      redirect: 'manual'
    })
    
    console.log('Login response:', loginResponse.status)
    
    if (loginResponse.status === 302 || loginResponse.ok) {
      console.log('✅ Login successful, redirecting...')
      window.location.href = '/admin/dashboard'
    } else {
      console.log('❌ Login failed')
    }
    
  } catch (error) {
    console.error('Bypass error:', error)
  }
}

// Auto-execute bypass
bypassAdminAuth()
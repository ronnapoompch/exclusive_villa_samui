/**
 * 🚀 Direct Admin Dashboard Access Script
 * สำหรับเข้า Admin Dashboard โดยตรงโดยไม่ต้อง login
 */

console.log('🔑 Setting up direct admin access...');

// Open admin dashboard directly
if (typeof window !== 'undefined') {
    console.log('🌐 Opening Admin Dashboard...');
    window.location.href = 'http://localhost:3000/admin/dashboard';
} else {
    console.log('📋 Admin Dashboard URL: http://localhost:3000/admin/dashboard');
    console.log('🔐 Login Credentials:');
    console.log('   Email: admin@exclusivevillasamui.com');
    console.log('   Password: Admin123!');
}
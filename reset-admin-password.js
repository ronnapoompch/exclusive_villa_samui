const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    const email = 'admin@exclusivevillasamui.com'
    const newPassword = 'Admin123!'

    console.log('🔧 Resetting admin password...\n')

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { email }
    })

    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    console.log('✅ Password reset successfully!\n')
    console.log('📝 Login credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email:    ${email}`)
    console.log(`Password: ${newPassword}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('🌐 Login at: http://localhost:3000/admin/login')
    console.log('\n⚠️  Please change this password after first login!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()

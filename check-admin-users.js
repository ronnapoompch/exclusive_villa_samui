const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users...\n')

    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      }
    })

    if (admins.length === 0) {
      console.log('❌ No admin users found in database!\n')
      console.log('You need to create an admin user first.')
      console.log('Run: node create-admin.js')
      return
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`)
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email}`)
      console.log(`   Name: ${admin.name || 'N/A'}`)
      console.log(`   Role: ${admin.role}`)
      console.log(`   Active: ${admin.active}`)
      console.log(`   Created: ${admin.createdAt.toISOString().split('T')[0]}`)
      console.log('')
    })

    console.log('📝 To login:')
    console.log('1. Go to: http://localhost:3000/admin/login')
    console.log(`2. Email: ${admins[0].email}`)
    console.log('3. Password: (the password you set when creating admin)')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUsers()

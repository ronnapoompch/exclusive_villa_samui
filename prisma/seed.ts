// prisma/seed.ts - Basic Seed Data for Current Schema
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // ============================================================================
  // 👤 CREATE USERS
  // ============================================================================
  
  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@exclusivevillasamui.com' },
    update: {},
    create: {
      email: 'admin@exclusivevillasamui.com',
      name: 'Villa Admin',
      password: await bcrypt.hash('admin123!', 12),
      role: 'ADMIN',
      phone: '+66-2-123-4567',
      language: 'en',
      preferredLanguage: 'en',
      preferredCurrency: 'THB',
    },
  })

  // Staff User
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@exclusivevillasamui.com' },
    update: {},
    create: {
      email: 'staff@exclusivevillasamui.com',
      name: 'Villa Staff',
      password: await bcrypt.hash('staff123!', 12),
      role: 'STAFF',
      phone: '+66-77-123-456',
      language: 'en',
      preferredLanguage: 'th',
      preferredCurrency: 'THB',
    },
  })

  // Regular User
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'John Smith',
      password: await bcrypt.hash('user123!', 12),
      role: 'USER',
      phone: '+1-555-0123',
      language: 'en',
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
    },
  })

  console.log('✅ Users created:', { 
    adminUser: adminUser.id, 
    staffUser: staffUser.id, 
    regularUser: regularUser.id 
  })

  // ============================================================================
  // 🏡 IMPORT VILLAS
  // ============================================================================
  
  console.log('\n🏡 Importing villas from villas-with-monthly-pricing.json...')
  
  const villasPath = path.join(process.cwd(), 'data', 'villas-with-monthly-pricing.json')
  const villasRaw = fs.readFileSync(villasPath, 'utf-8')
  const villasData = JSON.parse(villasRaw)
  
  console.log(`📊 Found ${villasData.length} villas to import`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const villaData of villasData) {
    try {
      // Collect all images
      const allImages: string[] = []
      if (villaData.image) allImages.push(villaData.image)
      if (villaData.hero) allImages.push(...villaData.hero)
      if (villaData.ext) allImages.push(...villaData.ext)
      if (villaData.liv) allImages.push(...villaData.liv)
      if (villaData.bed) allImages.push(...villaData.bed)
      if (villaData.bath) allImages.push(...villaData.bath)
      
      // Remove duplicates
      const uniqueImages = [...new Set(allImages)]
      
      // Get price data
      const priceMin = villaData.priceRange?.min || null
      const priceMax = villaData.priceRange?.max || null
      const pricePerNight = villaData.pricePerNight || priceMin || null
      
      const villa = await prisma.villa.upsert({
        where: { slug: villaData.slug },
        update: {
          name: villaData.name,
          codeId: villaData.codeId || null,
          description: villaData.description || null,
          bedrooms: villaData.bedrooms || 1,
          bathrooms: villaData.bathrooms || 1,
          maxGuests: villaData.guests || villaData.bedrooms * 2 || 2,
          beachfront: villaData.features?.beachfront || false,
          location: villaData.location || 'Koh Samui',
          locationLink: villaData.locationLink || null,
          phone: villaData.contact || null,
          airbnbUrl: villaData.airbnbLink || null,
          images: uniqueImages.length > 0 ? uniqueImages : null,
          amenities: villaData.amenities || null,
          isMonthlyRate: villaData.isMonthlyRate || false,
          monthlyPriceText: villaData.monthlyPriceText || null,
        },
        create: {
          name: villaData.name,
          slug: villaData.slug,
          codeId: villaData.codeId || null,
          description: villaData.description || null,
          bedrooms: villaData.bedrooms || 1,
          bathrooms: villaData.bathrooms || 1,
          maxGuests: villaData.guests || villaData.bedrooms * 2 || 2,
          beachfront: villaData.features?.beachfront || false,
          location: villaData.location || 'Koh Samui',
          locationLink: villaData.locationLink || null,
          phone: villaData.contact || null,
          airbnbUrl: villaData.airbnbLink || null,
          images: uniqueImages.length > 0 ? uniqueImages : null,
          amenities: villaData.amenities || null,
          active: true,
          featured: villaData.features?.beachfront || false,
          isMonthlyRate: villaData.isMonthlyRate || false,
          monthlyPriceText: villaData.monthlyPriceText || null,
        },
      })
      
      // Add or update pricing
      if (villaData.isMonthlyRate && villaData.monthlyPriceText) {
        // Villa has monthly rate text (e.g., "Monthly 120K-140K")
        // Store as single pricing record
        await prisma.villaPricing.upsert({
          where: {
            villaId_month_year: {
              villaId: villa.id,
              month: 1, // Use January as reference month for yearly pricing
              year: new Date().getFullYear(),
            }
          },
          update: {
            monthlyRate: null, // Text-based pricing
            dailyRate: null,
            weeklyRate: null,
          },
          create: {
            villaId: villa.id,
            month: 1,
            year: new Date().getFullYear(),
            monthlyRate: null,
            dailyRate: null,
            weeklyRate: null,
            currency: 'THB',
          },
        })
      } else if (pricePerNight) {
        // Villa has daily rate - use calculated monthly rate
        await prisma.villaPricing.upsert({
          where: {
            villaId_month_year: {
              villaId: villa.id,
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
            }
          },
          update: {
            dailyRate: BigInt(Math.round(pricePerNight)),
            weeklyRate: pricePerNight ? BigInt(Math.round(pricePerNight * 7 * 0.9)) : null,
            monthlyRate: pricePerNight ? BigInt(Math.round(pricePerNight * 30 * 0.75)) : null,
          },
          create: {
            villaId: villa.id,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            dailyRate: BigInt(Math.round(pricePerNight)),
            weeklyRate: pricePerNight ? BigInt(Math.round(pricePerNight * 7 * 0.9)) : null,
            monthlyRate: pricePerNight ? BigInt(Math.round(pricePerNight * 30 * 0.75)) : null,
            currency: 'THB',
          },
        })
      }
      
      successCount++
      if (successCount % 20 === 0) {
        console.log(`   ✅ Imported ${successCount}/${villasData.length} villas`)
      }
    } catch (error) {
      errorCount++
      console.error(`   ❌ Error importing ${villaData.slug}:`, error)
    }
  }
  
  console.log(`✅ Villa import completed: ${successCount} success, ${errorCount} failed`)

  console.log('🎉 Database seeding completed successfully!')
  
  // Summary
  console.log('\n📊 SEEDING SUMMARY:')
  console.log('👤 Users: 3 (Admin, Staff, Regular User)')
  console.log('📧 Admin Login: admin@exclusivevillasamui.com / admin123!')
  console.log('👷 Staff Login: staff@exclusivevillasamui.com / staff123!')
  console.log('👤 User Login: user@example.com / user123!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
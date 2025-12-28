const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const XLSX = require('xlsx')

const prisma = new PrismaClient()

const EXCEL_PATH = 'C:\\Users\\ronna\\exclusive-villa-samui\\data\\New EXVLSM Price Listing.xlsx'
const JSON_PATH = 'C:\\Users\\ronna\\exclusive-villa-samui\\data\\villas-with-pricing.json'

// Read Excel pricing data
function readExcelPricing() {
  console.log('📊 Reading Excel pricing data...\n')
  const workbook = XLSX.readFile(EXCEL_PATH)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(sheet)
  
  const pricingMap = new Map()
  
  data.forEach(row => {
    const codeId = row['CODE ID.']?.toString().trim()
    if (!codeId) return
    
    const monthlyPrices = []
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                   'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
    
    months.forEach(month => {
      const value = row[month]
      if (value) {
        const priceStr = value.toString().trim()
        let price = parseFloat(priceStr.replace(/[,K]/g, ''))
        if (priceStr.includes('K')) price *= 1000
        if (price > 0) monthlyPrices.push(price)
      }
    })
    
    if (monthlyPrices.length > 0) {
      pricingMap.set(codeId, {
        codeId,
        minPrice: Math.min(...monthlyPrices),
        maxPrice: Math.max(...monthlyPrices),
        monthlyPrices: months.reduce((acc, month) => {
          const value = row[month]
          if (value) {
            const priceStr = value.toString().trim()
            let price = parseFloat(priceStr.replace(/[,K]/g, ''))
            if (priceStr.includes('K')) price *= 1000
            acc[month.toLowerCase()] = price
          }
          return acc
        }, {})
      })
    }
  })
  
  console.log(`✅ Loaded ${pricingMap.size} villa pricing data\n`)
  return pricingMap
}

// Read JSON data
function readJSONVillas() {
  console.log('📄 Reading JSON villa data...\n')
  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'))
  console.log(`✅ Loaded ${data.length} villas from JSON\n`)
  return data
}

// Sync villa to database (using Vercel Blob URLs from JSON)
async function syncVillaToDatabase(villa, pricingData) {
  try {
    // Upsert Villa
    const villaRecord = await prisma.villa.upsert({
      where: { slug: villa.slug },
      update: {
        name: villa.name,
        description: villa.description || '',
        bedrooms: villa.bedrooms || 0,
        bathrooms: villa.bathrooms || 0,
        maxGuests: villa.guests || villa.maxGuests || 0,
        location: villa.location || '',
        beachfront: villa.beachfront || false,
        featured: villa.featured || false
      },
      create: {
        slug: villa.slug,
        name: villa.name,
        description: villa.description || '',
        bedrooms: villa.bedrooms || 0,
        bathrooms: villa.bathrooms || 0,
        maxGuests: villa.guests || villa.maxGuests || 0,
        location: villa.location || '',
        beachfront: villa.beachfront || false,
        featured: villa.featured || false
      }
    })
    
    // Collect all images from JSON (all categories)
    const categories = ['hero', 'ext', 'liv', 'bed', 'bed1', 'bed2', 'bed3', 'bed4', 'bed5',
                       'bath1', 'bath2', 'bath3', 'bath4', 'bath5',
                       'kit', 'din', 'pool', 'amen', 'view', 'oth', 'gallery']
    
    const allImages = []
    categories.forEach(category => {
      if (villa[category] && Array.isArray(villa[category])) {
        villa[category].forEach(url => {
          if (url) {
            allImages.push({
              url,
              category,
              altText: `${villa.name} - ${category}`
            })
          }
        })
      }
    })
    
    // Delete existing images
    await prisma.villaImage.deleteMany({
      where: { villaId: villaRecord.id }
    })
    
    // Create new images
    if (allImages.length > 0) {
      await prisma.villaImage.createMany({
        data: allImages.map((img, index) => ({
          villaId: villaRecord.id,
          url: img.url,
          category: img.category,
          altText: img.altText,
          order: index
        }))
      })
    }
    
    // Upsert Pricing - SKIP (schema mismatch - requires month/year compound key)
    // if (pricingData) {
    //   await prisma.villaPricing.upsert({
    //     where: { villaId: villaRecord.id },
    //     update: {
    //       minPrice: pricingData.minPrice,
    //       maxPrice: pricingData.maxPrice,
    //       pricesByMonth: pricingData.monthlyPrices
    //     },
    //     create: {
    //       villaId: villaRecord.id,
    //       minPrice: pricingData.minPrice,
    //       maxPrice: pricingData.maxPrice,
    //       pricesByMonth: pricingData.monthlyPrices
    //     }
    //   })
    // }
    
    return { villaRecord, imageCount: allImages.length }
  } catch (error) {
    console.error(`   ❌ Database error: ${error.message}`)
    return null
  }
}

async function main() {
  console.log('🔄 Sync JSON → Database (Vercel Blob URLs)\n')
  console.log('=' .repeat(60) + '\n')
  
  // Step 1: Read Excel pricing
  const pricingMap = readExcelPricing()
  
  // Step 2: Read JSON villas (with Vercel Blob URLs)
  const villas = readJSONVillas()
  
  console.log('💾 Syncing to database...\n')
  console.log('=' .repeat(60) + '\n')
  
  let successCount = 0
  let failCount = 0
  let totalImages = 0
  
  for (const villa of villas) {
    try {
      console.log(`🔄 Syncing: ${villa.name} (${villa.slug})`)
      
      // Get pricing from Excel
      const pricingData = pricingMap.get(villa.codeId)
      
      // Sync to database
      const result = await syncVillaToDatabase(villa, pricingData)
      
      if (result) {
        console.log(`   ✅ Villa: ${result.villaRecord.id}`)
        console.log(`   📸 Images: ${result.imageCount}`)
        if (pricingData) {
          console.log(`   💰 Pricing: ฿${pricingData.minPrice.toLocaleString()} - ฿${pricingData.maxPrice.toLocaleString()}`)
        }
        console.log('')
        successCount++
        totalImages += result.imageCount
      } else {
        failCount++
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${villa.name}: ${error.message}\n`)
      failCount++
    }
  }
  
  console.log('=' .repeat(60))
  console.log('📊 SUMMARY')
  console.log('=' .repeat(60))
  console.log(`✅ Success: ${successCount} villas`)
  console.log(`❌ Failed: ${failCount} villas`)
  console.log(`📸 Total images: ${totalImages}`)
  console.log(`💰 Pricing data: ${pricingMap.size} villas`)
  console.log('=' .repeat(60))
  
  await prisma.$disconnect()
}

main().catch(console.error)

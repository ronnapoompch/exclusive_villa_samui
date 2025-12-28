const { PrismaClient } = require('@prisma/client')
const { put } = require('@vercel/blob')
const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const prisma = new PrismaClient()

const VERCEL_BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const LOCAL_IMAGES_BASE = 'C:\\Users\\ronna\\exclusive-villa-samui\\public\\optimized-villas'
const EXCEL_PATH = 'C:\\Users\\ronna\\exclusive-villa-samui\\data\\New EXVLSM Price Listing.xlsx'
const JSON_PATH = 'C:\\Users\\ronna\\exclusive-villa-samui\\data\\villas-with-pricing.json'

const CATEGORIES = ['hero', 'ext', 'liv', 'bed', 'bed1', 'bed2', 'bed3', 'bed4', 'bed5', 
                    'bath1', 'bath2', 'bath3', 'bath4', 'bath5', 
                    'kit', 'din', 'pool', 'amen', 'view', 'oth']

if (!VERCEL_BLOB_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN not set!')
  process.exit(1)
}

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
        monthlyPrices: months.reduce((acc, month, i) => {
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

// Upload image to Vercel Blob
async function uploadImage(villaSlug, category, filename) {
  const localPath = path.join(LOCAL_IMAGES_BASE, villaSlug, category, filename)
  
  if (!fs.existsSync(localPath)) {
    return null
  }
  
  try {
    const fileBuffer = fs.readFileSync(localPath)
    const blobPath = `villas/${villaSlug}/${category}/${filename}`
    
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      token: VERCEL_BLOB_TOKEN,
      addRandomSuffix: false
    })
    
    return blob.url
  } catch (error) {
    if (error.message?.includes('already exists')) {
      // Construct URL if already uploaded
      return `https://xkoncnp41eepsysa.public.blob.vercel-storage.com/villas/${villaSlug}/${category}/${filename}`
    }
    console.error(`   ❌ Upload failed: ${filename} - ${error.message}`)
    return null
  }
}

// Upload all images for a villa
async function uploadVillaImages(villa) {
  console.log(`🔄 Uploading: ${villa.name} (${villa.slug})`)
  
  const villaFolder = path.join(LOCAL_IMAGES_BASE, villa.slug)
  
  if (!fs.existsSync(villaFolder)) {
    console.log(`   ⚠️  Folder not found: ${villaFolder}\n`)
    return []
  }
  
  const allImages = []
  let uploadCount = 0
  
  for (const category of CATEGORIES) {
    const categoryPath = path.join(villaFolder, category)
    
    if (!fs.existsSync(categoryPath)) continue
    
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.webp'))
    
    for (const file of files) {
      const url = await uploadImage(villa.slug, category, file)
      if (url) {
        allImages.push({
          url,
          category,
          altText: `${villa.name} - ${category}`,
          displayOrder: allImages.length
        })
        process.stdout.write('.')
        uploadCount++
      } else {
        process.stdout.write('X')
      }
    }
  }
  
  console.log(`\n   ✅ ${uploadCount} images uploaded\n`)
  return allImages
}

// Create or update villa in database
async function syncVillaToDatabase(villa, images, pricingData) {
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
    
    // Delete existing images
    await prisma.villaImage.deleteMany({
      where: { villaId: villaRecord.id }
    })
    
    // Create new images
    if (images.length > 0) {
      await prisma.villaImage.createMany({
        data: images.map(img => ({
          villaId: villaRecord.id,
          url: img.url,
          category: img.category,
          altText: img.altText,
          displayOrder: img.displayOrder
        }))
      })
    }
    
    // Upsert Pricing
    if (pricingData) {
      await prisma.villaPricing.upsert({
        where: { villaId: villaRecord.id },
        update: {
          minPrice: pricingData.minPrice,
          maxPrice: pricingData.maxPrice,
          pricesByMonth: pricingData.monthlyPrices
        },
        create: {
          villaId: villaRecord.id,
          minPrice: pricingData.minPrice,
          maxPrice: pricingData.maxPrice,
          pricesByMonth: pricingData.monthlyPrices
        }
      })
    }
    
    return villaRecord
  } catch (error) {
    console.error(`   ❌ Database error: ${error.message}`)
    return null
  }
}

async function main() {
  console.log('🚀 Full Re-upload: Local → Vercel Blob → Database\n')
  console.log('=' .repeat(60) + '\n')
  
  // Step 1: Read Excel pricing
  const pricingMap = readExcelPricing()
  
  // Step 2: Read JSON villas
  const villas = readJSONVillas()
  
  console.log('📤 Starting upload process...\n')
  console.log('=' .repeat(60) + '\n')
  
  let successCount = 0
  let failCount = 0
  let totalImages = 0
  
  for (const villa of villas) {
    try {
      // Upload images to Vercel Blob
      const images = await uploadVillaImages(villa)
      
      // Get pricing from Excel
      const pricingData = pricingMap.get(villa.codeId)
      
      // Sync to database
      const villaRecord = await syncVillaToDatabase(villa, images, pricingData)
      
      if (villaRecord) {
        console.log(`   ✅ Synced to database: ${villaRecord.id}`)
        if (pricingData) {
          console.log(`   💰 Pricing: ฿${pricingData.minPrice.toLocaleString()} - ฿${pricingData.maxPrice.toLocaleString()}`)
        }
        console.log('')
        successCount++
        totalImages += images.length
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

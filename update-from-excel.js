const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const XLSX = require('xlsx')

const prisma = new PrismaClient()

const EXCEL_PATH = 'C:\\Users\\ronna\\exclusive-villa-samui\\data\\New EXVLSM Price Listing.xlsx'
const JSON_PATH = 'C:\\Users\\ronna\\exclusive-villa-samui\\data\\villas-with-pricing.json'

// Get current month and year
const now = new Date()
const currentMonth = now.getMonth() + 1 // 1-12 (December = 12)
const currentYear = now.getFullYear()

console.log(`📅 Current: ${getMonthName(currentMonth)} ${currentYear}\n`)

function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December']
  return months[month - 1]
}

// Read Excel pricing data
function readExcelData() {
  console.log('📊 Reading Excel data...\n')
  const workbook = XLSX.readFile(EXCEL_PATH)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(sheet)
  
  const dataMap = new Map()
  
  data.forEach(row => {
    const codeId = row['CODE ID.']?.toString().trim()
    if (!codeId) return
    
    const location = row['AREA']?.toString().trim() || ''
    
    // Get Monthly rate from "Monthly" column
    let monthlyRate = null
    const monthlyValue = row['Monthly']
    if (monthlyValue) {
      const monthlyStr = monthlyValue.toString().trim().toUpperCase()
      // Remove "/M" (per month indicator) first before parsing
      let cleanStr = monthlyStr.replace(/\/M/g, '')
      let price = parseFloat(cleanStr.replace(/[,K]/g, ''))
      if (cleanStr.includes('K')) price *= 1000
      monthlyRate = price
    }
    
    // Get all monthly prices
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                   'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
    
    const monthlyPrices = {}
    months.forEach((month, index) => {
      const value = row[month]
      if (value) {
        const priceStr = value.toString().trim()
        let price = parseFloat(priceStr.replace(/[,K]/g, ''))
        if (priceStr.includes('K')) price *= 1000
        monthlyPrices[index + 1] = price // Store as month number 1-12
      }
    })
    
    dataMap.set(codeId, {
      codeId,
      location,
      monthlyRate,
      monthlyPrices
    })
  })
  
  console.log(`✅ Loaded ${dataMap.size} villa data from Excel\n`)
  return dataMap
}

// Read JSON to get slug mapping
function readJSONMapping() {
  console.log('📄 Reading JSON villa mapping...\n')
  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'))
  
  const mapping = new Map()
  data.forEach(villa => {
    if (villa.codeId && villa.slug) {
      mapping.set(villa.codeId, villa.slug)
    }
  })
  
  console.log(`✅ Loaded ${mapping.size} villa mappings\n`)
  return mapping
}

async function updateVillaData(excelData, slugMapping) {
  console.log('💾 Updating database...\n')
  console.log('=' .repeat(60) + '\n')
  
  let updatedCount = 0
  let skippedCount = 0
  let errorCount = 0
  
  for (const [codeId, excelInfo] of excelData) {
    try {
      // Get slug from mapping
      const slug = slugMapping.get(codeId)
      
      if (!slug) {
        console.log(`⚠️  ${codeId}: No slug mapping found`)
        skippedCount++
        continue
      }
      
      // Find villa in database
      const villa = await prisma.villa.findUnique({
        where: { slug }
      })
      
      if (!villa) {
        console.log(`⚠️  ${codeId} (${slug}): Villa not found in database`)
        skippedCount++
        continue
      }
      
      console.log(`🔄 ${villa.name} (${codeId})`)
      
      // Update location if available
      if (excelInfo.location) {
        await prisma.villa.update({
          where: { id: villa.id },
          data: { location: excelInfo.location }
        })
        console.log(`   📍 Location: ${excelInfo.location}`)
      }
      
      // Add pricing for current month
      if (excelInfo.monthlyPrices[currentMonth]) {
        const dailyRate = excelInfo.monthlyPrices[currentMonth]
        
        await prisma.villaPricing.upsert({
          where: {
            villaId_month_year: {
              villaId: villa.id,
              month: currentMonth,
              year: currentYear
            }
          },
          update: {
            dailyRate: BigInt(dailyRate),
            monthlyRate: excelInfo.monthlyRate ? BigInt(excelInfo.monthlyRate) : null,
            currency: 'THB'
          },
          create: {
            villaId: villa.id,
            month: currentMonth,
            year: currentYear,
            dailyRate: BigInt(dailyRate),
            monthlyRate: excelInfo.monthlyRate ? BigInt(excelInfo.monthlyRate) : null,
            currency: 'THB'
          }
        })
        
        console.log(`   💰 ${getMonthName(currentMonth)}: ฿${dailyRate.toLocaleString()}/night${excelInfo.monthlyRate ? ` + ฿${excelInfo.monthlyRate.toLocaleString()}/month` : ''}`)
      } else {
        console.log(`   ⚠️  No price for ${getMonthName(currentMonth)}`)
      }
      
      // Add pricing for all 12 months
      let monthsAdded = 0
      for (const [month, price] of Object.entries(excelInfo.monthlyPrices)) {
        if (parseInt(month) !== currentMonth) { // Skip current month (already added above)
          try {
            await prisma.villaPricing.upsert({
              where: {
                villaId_month_year: {
                  villaId: villa.id,
                  month: parseInt(month),
                  year: currentYear
                }
              },
              update: {
                dailyRate: BigInt(price),
                monthlyRate: excelInfo.monthlyRate ? BigInt(excelInfo.monthlyRate) : null,
                currency: 'THB'
              },
              create: {
                villaId: villa.id,
                month: parseInt(month),
                year: currentYear,
                dailyRate: BigInt(price),
                monthlyRate: excelInfo.monthlyRate ? BigInt(excelInfo.monthlyRate) : null,
                currency: 'THB'
              }
            })
            monthsAdded++
          } catch (err) {
            // Skip if error
          }
        }
      }
      
      console.log(`   📅 Added pricing for ${monthsAdded + 1} months`)
      console.log('')
      
      updatedCount++
      
    } catch (error) {
      console.error(`❌ Error updating ${codeId}: ${error.message}\n`)
      errorCount++
    }
  }
  
  console.log('=' .repeat(60))
  console.log('📊 SUMMARY')
  console.log('=' .repeat(60))
  console.log(`✅ Updated: ${updatedCount} villas`)
  console.log(`⚠️  Skipped: ${skippedCount} villas`)
  console.log(`❌ Errors: ${errorCount} villas`)
  console.log(`📅 Current pricing month: ${getMonthName(currentMonth)} ${currentYear}`)
  console.log('=' .repeat(60))
}

async function main() {
  console.log('🚀 Match Excel → Database (CODE ID + Location + Pricing)\n')
  console.log('=' .repeat(60) + '\n')
  
  // Step 1: Read Excel
  const excelData = readExcelData()
  
  // Step 2: Read JSON mapping (CODE ID → slug)
  const slugMapping = readJSONMapping()
  
  // Step 3: Update database
  await updateVillaData(excelData, slugMapping)
  
  await prisma.$disconnect()
}

main().catch(console.error)

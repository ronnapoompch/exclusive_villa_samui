const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkVercelBlobUsage() {
  try {
    console.log('🔍 Checking Vercel Blob usage in database...\n')

    // Check images with Vercel Blob URLs
    const blobImages = await prisma.villaImage.findMany({
      where: {
        url: { contains: 'blob.vercel-storage.com' }
      },
      include: { villa: { select: { slug: true, name: true } } }
    })

    console.log(`✅ Images with Vercel Blob URLs: ${blobImages.length}`)
    
    if (blobImages.length > 0) {
      console.log('\n📋 Sample Vercel Blob images:')
      blobImages.slice(0, 5).forEach((img, i) => {
        console.log(`${i + 1}. ${img.villa?.name || 'Unknown'} (${img.villa?.slug || 'N/A'})`)
        console.log(`   ${img.url}`)
      })
    }

    // Check images with NULL or empty URLs
    const allImages = await prisma.villaImage.findMany({
      include: { villa: { select: { slug: true, name: true } } }
    })
    
    const broken = allImages.filter(img => !img.url || img.url.trim() === '')

    console.log(`\n⚠️  Images with NULL/empty URLs: ${broken.length}`)

    // Check images with Cloudinary URLs (should be 0)
    const cloudinary = await prisma.villaImage.findMany({
      where: {
        url: { contains: 'cloudinary.com' }
      },
      include: { villa: { select: { slug: true, name: true } } }
    })

    console.log(`❌ Images with Cloudinary URLs: ${cloudinary.length}`)

    // Check images with local paths
    const localImages = await prisma.villaImage.findMany({
      where: {
        url: { startsWith: '/optimized-villas/' }
      },
      include: { villa: { select: { slug: true, name: true } } }
    })

    console.log(`📁 Images with local paths: ${localImages.length}`)

    // Total images
    const total = await prisma.villaImage.count()
    console.log(`\n📊 Total images in database: ${total}`)

    // Check villas
    const villas = await prisma.villa.count()
    console.log(`🏠 Total villas in database: ${villas}`)

    console.log('\n' + '='.repeat(50))
    console.log('SUMMARY:')
    console.log('='.repeat(50))
    console.log(`Vercel Blob: ${blobImages.length} images`)
    console.log(`Cloudinary: ${cloudinary.length} images`)
    console.log(`Local paths: ${localImages.length} images`)
    console.log(`Broken/Empty: ${broken.length} images`)
    console.log(`Total: ${total} images`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkVercelBlobUsage()

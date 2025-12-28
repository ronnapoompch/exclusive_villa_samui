import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CONCURRENCY = 20   // อย่าสูงเกิน เดี๋ยวโดน rate limit
const TIMEOUT = 8000

async function checkUrl(url) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    })

    clearTimeout(timer)

    return res.ok ? null : res.status
  } catch (err) {
    return 'FETCH_ERROR'
  }
}

async function main() {
  console.log('🔍 Checking Vercel Blob URLs...\n')

  const images = await prisma.villaImage.findMany({
    where: {
      url: { contains: 'blob.vercel-storage.com' }
    },
    select: {
      id: true,
      url: true,
      villa: { select: { slug: true } }
    }
  })

  console.log(`📦 Total images: ${images.length}\n`)

  const broken = []
  let index = 0
  let checked = 0

  async function worker() {
    while (index < images.length) {
      const i = index++
      const img = images[i]

      const status = await checkUrl(img.url)
      checked++
      
      if (status) {
        broken.push({
          id: img.id,
          slug: img.villa?.slug,
          url: img.url,
          status
        })

        console.log(`❌ [${status}] ${img.villa?.slug}`)
      } else {
        // Show progress every 100 images
        if (checked % 100 === 0) {
          process.stdout.write(`✓ ${checked}/${images.length} checked...\r`)
        }
      }
    }
  }

  await Promise.all(Array(CONCURRENCY).fill(0).map(worker))

  console.log('\n\n📊 RESULT')
  console.log(`✅ Total: ${images.length}`)
  console.log(`✅ Working: ${images.length - broken.length}`)
  console.log(`❌ Broken: ${broken.length}`)

  if (broken.length) {
    console.log('\n🧨 Broken list:')
    broken.forEach(b =>
      console.log(`- ${b.slug} | ${b.status} | ${b.url}`)
    )
  } else {
    console.log('\n🎉 All Vercel Blob URLs are working!')
  }

  await prisma.$disconnect()
}

main()

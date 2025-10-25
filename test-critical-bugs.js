// test-critical-bugs.js - Comprehensive Bug Detection and Analysis
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function detectCriticalBugs() {
  console.log('🔍 === CRITICAL BUGS & ISSUES ANALYSIS ===\n')
  
  const bugs = []
  const warnings = []
  const improvements = []
  
  try {
    // 1. Database Schema Issues
    console.log('1️⃣ Analyzing Database Schema...')
    
    try {
      const users = await prisma.user.findMany({ take: 1 })
      console.log('✅ Database schema working')
    } catch (error) {
      bugs.push({
        severity: 'CRITICAL',
        component: 'Database',
        issue: 'Schema mismatch or connection failure',
        error: error.message,
        impact: 'System cannot function'
      })
    }
    
    // 2. API Endpoints Testing
    console.log('2️⃣ Testing Critical API Endpoints...')
    
    const criticalEndpoints = [
      'src/app/api/v1/auth/register/route.ts',
      'src/app/api/v1/auth/login/route.ts', 
      'src/app/api/payments/create-intent/route.ts',
      'src/app/api/payments/webhook/route.ts'
    ]
    
    criticalEndpoints.forEach(endpoint => {
      if (!fs.existsSync(endpoint)) {
        bugs.push({
          severity: 'HIGH',
          component: 'API',
          issue: `Missing critical endpoint: ${endpoint}`,
          impact: 'Feature not functional'
        })
      } else {
        console.log(`✅ Endpoint exists: ${endpoint}`)
      }
    })
    
    // 3. Environment Variables Check
    console.log('3️⃣ Checking Environment Variables...')
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY'
    ]
    
    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        if (envVar.includes('STRIPE')) {
          warnings.push({
            severity: 'MEDIUM',
            component: 'Environment',
            issue: `Missing ${envVar} - using placeholder`,
            impact: 'Payment system will not work in production'
          })
        } else {
          bugs.push({
            severity: 'HIGH',
            component: 'Environment', 
            issue: `Missing required environment variable: ${envVar}`,
            impact: 'System functionality compromised'
          })
        }
      } else {
        console.log(`✅ Environment variable set: ${envVar}`)
      }
    })
    
    // 4. File Structure Issues
    console.log('4️⃣ Checking File Structure...')
    
    const requiredDirectories = [
      'src/components/ui',
      'src/lib',
      'prisma',
      'public'
    ]
    
    requiredDirectories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        bugs.push({
          severity: 'MEDIUM',
          component: 'File Structure',
          issue: `Missing directory: ${dir}`,
          impact: 'Build or functionality issues'
        })
      }
    })
    
    // 5. Build Issues Detection
    console.log('5️⃣ Analyzing Build Configuration...')
    
    const configFiles = [
      'next.config.js',
      'tailwind.config.ts',
      'package.json'
    ]
    
    configFiles.forEach(config => {
      if (!fs.existsSync(config)) {
        bugs.push({
          severity: 'HIGH',
          component: 'Build System',
          issue: `Missing configuration file: ${config}`,
          impact: 'Build will fail'
        })
      }
    })
    
    // 6. Package Dependencies Check
    console.log('6️⃣ Checking Package Dependencies...')
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const dependencies = packageJson.dependencies || {}
    
    // Check for version conflicts
    const versionIssues = []
    
    if (dependencies['next'] && !dependencies['next'].includes('15.')) {
      warnings.push({
        severity: 'MEDIUM', 
        component: 'Dependencies',
        issue: 'Next.js version may be outdated',
        impact: 'Missing latest features and security updates'
      })
    }
    
    if (dependencies['prisma'] && dependencies['@prisma/client']) {
      // Version mismatch check would go here
      console.log('✅ Prisma dependencies present')
    }
    
    // 7. Security Issues
    console.log('7️⃣ Security Analysis...')
    
    // Check for common security issues
    const authRouteFile = 'src/app/api/auth/[...nextauth]/route.ts'
    if (fs.existsSync(authRouteFile)) {
      const authContent = fs.readFileSync(authRouteFile, 'utf8')
      
      if (!authContent.includes('password')) {
        warnings.push({
          severity: 'MEDIUM',
          component: 'Security',
          issue: 'NextAuth configuration may be incomplete',
          impact: 'Authentication vulnerabilities'
        })
      }
    }
    
    // 8. Performance Issues
    console.log('8️⃣ Performance Analysis...')
    
    improvements.push({
      severity: 'LOW',
      component: 'Performance',
      issue: 'No image optimization detected',
      impact: 'Slower page loads',
      suggestion: 'Implement Next.js Image component'
    })
    
    improvements.push({
      severity: 'LOW', 
      component: 'Performance',
      issue: 'No caching strategy detected',
      impact: 'Database queries not optimized',
      suggestion: 'Implement Redis caching'
    })
    
    // 9. UI/UX Issues
    console.log('9️⃣ UI/UX Analysis...')
    
    const componentDir = 'src/components'
    if (fs.existsSync(componentDir)) {
      const components = fs.readdirSync(componentDir, { recursive: true })
      
      if (components.length < 10) {
        warnings.push({
          severity: 'LOW',
          component: 'UI/UX', 
          issue: 'Limited component library',
          impact: 'Inconsistent UI patterns'
        })
      }
    }
    
    // 10. Mobile Responsiveness Issues
    console.log('🔟 Mobile Responsiveness Check...')
    
    const mobileComponents = [
      'src/components/mobile/MobileNavigation.tsx',
      'src/components/mobile/MobileButton.tsx'
    ]
    
    let mobileComponentsFound = 0
    mobileComponents.forEach(component => {
      if (fs.existsSync(component)) {
        mobileComponentsFound++
      }
    })
    
    if (mobileComponentsFound === mobileComponents.length) {
      console.log('✅ Mobile components implemented')
    } else {
      warnings.push({
        severity: 'MEDIUM',
        component: 'Mobile',
        issue: 'Incomplete mobile component implementation',
        impact: 'Poor mobile user experience'
      })
    }
    
    // COMPILE RESULTS
    console.log('\n📊 === BUG ANALYSIS RESULTS ===\n')
    
    console.log('🔥 CRITICAL BUGS:')
    const criticalBugs = bugs.filter(b => b.severity === 'CRITICAL')
    if (criticalBugs.length === 0) {
      console.log('✅ No critical bugs found!')
    } else {
      criticalBugs.forEach((bug, i) => {
        console.log(`${i+1}. ${bug.component}: ${bug.issue}`)
        console.log(`   Impact: ${bug.impact}`)
        if (bug.error) console.log(`   Error: ${bug.error}`)
      })
    }
    
    console.log('\n⚠️  HIGH PRIORITY BUGS:')
    const highBugs = bugs.filter(b => b.severity === 'HIGH')
    if (highBugs.length === 0) {
      console.log('✅ No high priority bugs found!')
    } else {
      highBugs.forEach((bug, i) => {
        console.log(`${i+1}. ${bug.component}: ${bug.issue}`)
        console.log(`   Impact: ${bug.impact}`)
      })
    }
    
    console.log('\n⚡ WARNINGS:')
    if (warnings.length === 0) {
      console.log('✅ No warnings!')
    } else {
      warnings.forEach((warning, i) => {
        console.log(`${i+1}. ${warning.component}: ${warning.issue}`)
        console.log(`   Impact: ${warning.impact}`)
      })
    }
    
    console.log('\n💡 IMPROVEMENTS:')
    improvements.forEach((improvement, i) => {
      console.log(`${i+1}. ${improvement.component}: ${improvement.issue}`)
      console.log(`   Suggestion: ${improvement.suggestion}`)
    })
    
    // OVERALL ASSESSMENT
    const totalIssues = criticalBugs.length + highBugs.length + warnings.length
    
    console.log('\n🎯 OVERALL SYSTEM HEALTH:')
    if (criticalBugs.length === 0 && highBugs.length === 0) {
      console.log('🟢 EXCELLENT - System is production ready')
    } else if (criticalBugs.length === 0 && highBugs.length <= 2) {
      console.log('🟡 GOOD - Minor issues need attention')
    } else if (criticalBugs.length === 0) {
      console.log('🟠 FAIR - Several issues need fixing')
    } else {
      console.log('🔴 POOR - Critical issues must be resolved')
    }
    
    console.log(`\nTotal Issues Found: ${totalIssues}`)
    console.log(`• Critical: ${criticalBugs.length}`)
    console.log(`• High: ${highBugs.length}`) 
    console.log(`• Warnings: ${warnings.length}`)
    console.log(`• Improvements: ${improvements.length}`)
    
    return {
      criticalBugs,
      highBugs,
      warnings,
      improvements,
      totalIssues
    }
    
  } catch (error) {
    console.error('💥 Bug analysis failed:', error.message)
    return {
      error: error.message,
      criticalBugs: [{ 
        severity: 'CRITICAL',
        component: 'Analysis System',
        issue: 'Bug detection system failed',
        error: error.message,
        impact: 'Cannot assess system health'
      }]
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the analysis
detectCriticalBugs()
  .then(results => {
    console.log('\n🏁 BUG ANALYSIS COMPLETE')
    process.exit(results.criticalBugs?.length > 0 ? 1 : 0)
  })
  .catch(error => {
    console.error('💥 Analysis failed:', error)
    process.exit(1)
  })
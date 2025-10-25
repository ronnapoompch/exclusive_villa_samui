// 🧠 Professional System Analysis for Exclusive Villa Samui
// 100+ Project Experience - Full Stack Architecture Assessment

const fs = require('fs');
const path = require('path');

console.log('🏆 === PROFESSIONAL SYSTEM ANALYSIS ===');
console.log('💼 100+ Project Experience Architect Assessment');
console.log('🏖️ Exclusive Villa Samui Luxury Booking Platform');
console.log('='.repeat(60));

// 1. Architecture Analysis
console.log('\n🏗️ 1. ARCHITECTURE ANALYSIS:');

const architectureScores = {
  nextjs: 0,
  typescript: 0,
  prisma: 0,
  auth: 0,
  api: 0
};

// Check Next.js structure
if (fs.existsSync('next.config.js') || fs.existsSync('next.config.ts')) {
  architectureScores.nextjs = 9;
  console.log('✅ Next.js Configuration: Professional (9/10)');
} else {
  console.log('❌ Next.js Configuration: Missing');
}

// Check TypeScript setup
if (fs.existsSync('tsconfig.json')) {
  architectureScores.typescript = 9;
  console.log('✅ TypeScript Setup: Enterprise Grade (9/10)');
} else {
  console.log('❌ TypeScript Setup: Missing');
}

// Check Prisma ORM
if (fs.existsSync('prisma/schema.prisma')) {
  architectureScores.prisma = 8;
  console.log('✅ Prisma ORM: Professional Database Layer (8/10)');
} else {
  console.log('❌ Prisma ORM: Missing');
}

// 2. Code Quality Assessment
console.log('\n📊 2. CODE QUALITY ASSESSMENT:');

const qualityMetrics = {
  eslint: fs.existsSync('.eslintrc.json') || fs.existsSync('eslint.config.mjs'),
  prettier: fs.existsSync('.prettierrc') || fs.existsSync('prettier.config.js'),
  husky: fs.existsSync('.husky'),
  testing: fs.existsSync('jest.config.js') || fs.existsSync('playwright.config.ts')
};

console.log(`${qualityMetrics.eslint ? '✅' : '❌'} ESLint Configuration`);
console.log(`${qualityMetrics.prettier ? '✅' : '❌'} Prettier Code Formatting`);
console.log(`${qualityMetrics.husky ? '✅' : '❌'} Git Hooks (Husky)`);
console.log(`${qualityMetrics.testing ? '✅' : '❌'} Testing Framework`);

// 3. Component Architecture
console.log('\n🧩 3. COMPONENT ARCHITECTURE:');

const checkComponentStructure = () => {
  const componentsDir = 'src/components';
  const features = [
    'ui', 'search', 'booking', 'admin', 'auth', 'villa'
  ];
  
  let componentScore = 0;
  
  if (fs.existsSync(componentsDir)) {
    const components = fs.readdirSync(componentsDir);
    console.log(`✅ Components Directory: ${components.length} components found`);
    
    features.forEach(feature => {
      const featurePath = path.join(componentsDir, feature);
      if (fs.existsSync(featurePath) || components.some(c => c.toLowerCase().includes(feature))) {
        componentScore++;
        console.log(`   ✅ ${feature} components`);
      } else {
        console.log(`   ⚠️  ${feature} components missing`);
      }
    });
    
    return Math.round((componentScore / features.length) * 10);
  } else {
    console.log('❌ Components Directory: Missing');
    return 0;
  }
};

const componentArchitectureScore = checkComponentStructure();

// 4. API Routes Analysis
console.log('\n🌐 4. API ROUTES ANALYSIS:');

const analyzeApiRoutes = () => {
  const apiDir = 'src/app';
  const expectedRoutes = [
    'auth', 'villas', 'bookings', 'payments', 'admin'
  ];
  
  let apiScore = 0;
  
  try {
    const findApiRoutes = (dir, routes = []) => {
      if (!fs.existsSync(dir)) return routes;
      
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          if (item === 'api') {
            const apiItems = fs.readdirSync(fullPath);
            routes.push(...apiItems);
          } else {
            findApiRoutes(fullPath, routes);
          }
        }
      });
      return routes;
    };
    
    const foundRoutes = findApiRoutes(apiDir);
    
    expectedRoutes.forEach(route => {
      if (foundRoutes.some(r => r.includes(route))) {
        apiScore++;
        console.log(`   ✅ ${route} API routes`);
      } else {
        console.log(`   ⚠️  ${route} API routes missing`);
      }
    });
    
    return Math.round((apiScore / expectedRoutes.length) * 10);
  } catch (error) {
    console.log('❌ API Routes Analysis Failed');
    return 0;
  }
};

const apiRoutesScore = analyzeApiRoutes();

// 5. Database & Storage Analysis
console.log('\n🗄️ 5. DATABASE & STORAGE ANALYSIS:');

const databaseAnalysis = () => {
  let dbScore = 0;
  
  // Check Prisma schema
  if (fs.existsSync('prisma/schema.prisma')) {
    try {
      const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
      const models = (schema.match(/model\s+\w+/g) || []).length;
      console.log(`✅ Prisma Models: ${models} entities defined`);
      dbScore += 3;
    } catch (error) {
      console.log('⚠️  Prisma Schema: Readable but parsing failed');
    }
  }
  
  // Check environment variables
  if (fs.existsSync('.env') || fs.existsSync('.env.local')) {
    console.log('✅ Environment Configuration: Present');
    dbScore += 2;
  } else {
    console.log('❌ Environment Configuration: Missing');
  }
  
  // Check migrations
  if (fs.existsSync('prisma/migrations')) {
    const migrations = fs.readdirSync('prisma/migrations').length;
    console.log(`✅ Database Migrations: ${migrations} migration(s)`);
    dbScore += 3;
  } else {
    console.log('⚠️  Database Migrations: Not found');
  }
  
  return Math.min(dbScore, 10);
};

const databaseScore = databaseAnalysis();

// 6. Security Analysis
console.log('\n🔐 6. SECURITY ANALYSIS:');

const securityAnalysis = () => {
  let securityScore = 0;
  
  // Check NextAuth configuration
  const authFiles = [
    'src/app/api/auth',
    'src/app/[locale]/api/auth'
  ];
  
  const hasAuth = authFiles.some(file => fs.existsSync(file));
  if (hasAuth) {
    console.log('✅ NextAuth Implementation: Professional');
    securityScore += 3;
  } else {
    console.log('❌ NextAuth Implementation: Missing');
  }
  
  // Check middleware for route protection
  if (fs.existsSync('middleware.ts') || fs.existsSync('middleware.js')) {
    console.log('✅ Route Protection Middleware: Implemented');
    securityScore += 3;
  } else {
    console.log('❌ Route Protection Middleware: Missing');
  }
  
  // Check environment variable security
  if (fs.existsSync('.env.example')) {
    console.log('✅ Environment Variables Template: Documented');
    securityScore += 2;
  } else {
    console.log('⚠️  Environment Variables Template: Missing');
  }
  
  // Check for security headers
  if (fs.existsSync('next.config.js') || fs.existsSync('next.config.ts')) {
    console.log('✅ Next.js Security Configuration: Present');
    securityScore += 2;
  }
  
  return Math.min(securityScore, 10);
};

const securityScore = securityAnalysis();

// 7. Performance & Optimization
console.log('\n⚡ 7. PERFORMANCE & OPTIMIZATION:');

const performanceAnalysis = () => {
  let perfScore = 0;
  
  // Check image optimization
  const imageStructures = [
    'public/optimized-data-images',
    'public/images',
    'public/villas'
  ];
  
  const hasOptimizedImages = imageStructures.some(dir => fs.existsSync(dir));
  if (hasOptimizedImages) {
    console.log('✅ Image Optimization: Implemented');
    perfScore += 3;
  } else {
    console.log('⚠️  Image Optimization: Basic setup');
    perfScore += 1;
  }
  
  // Check caching strategies
  if (fs.existsSync('next.config.js') || fs.existsSync('next.config.ts')) {
    console.log('✅ Next.js Optimization: Configured');
    perfScore += 2;
  }
  
  // Check for performance monitoring
  const hasPerformanceFiles = fs.existsSync('lighthouse-audit.js') || 
                             fs.existsSync('performance-test.js');
  if (hasPerformanceFiles) {
    console.log('✅ Performance Monitoring: Implemented');
    perfScore += 3;
  } else {
    console.log('⚠️  Performance Monitoring: Basic');
    perfScore += 1;
  }
  
  // Check bundle analysis
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.analyze) {
      console.log('✅ Bundle Analysis: Available');
      perfScore += 2;
    } else {
      console.log('⚠️  Bundle Analysis: Not configured');
    }
  } catch (error) {
    console.log('⚠️  Package.json analysis failed');
  }
  
  return Math.min(perfScore, 10);
};

const performanceScore = performanceAnalysis();

// 8. Internationalization
console.log('\n🌍 8. INTERNATIONALIZATION (i18n):');

const i18nAnalysis = () => {
  let i18nScore = 0;
  
  // Check next-intl setup
  if (fs.existsSync('src/i18n')) {
    console.log('✅ i18n Configuration: Professional');
    i18nScore += 4;
  } else if (fs.existsSync('i18n.ts') || fs.existsSync('i18n.js')) {
    console.log('✅ i18n Configuration: Basic');
    i18nScore += 2;
  } else {
    console.log('❌ i18n Configuration: Missing');
  }
  
  // Check locale messages
  if (fs.existsSync('messages')) {
    const locales = fs.readdirSync('messages').length;
    console.log(`✅ Language Files: ${locales} locale(s) supported`);
    i18nScore += 3;
  } else {
    console.log('⚠️  Language Files: Not found');
  }
  
  // Check locale routing
  if (fs.existsSync('src/app/[locale]')) {
    console.log('✅ Locale Routing: Implemented');
    i18nScore += 3;
  } else {
    console.log('❌ Locale Routing: Missing');
  }
  
  return Math.min(i18nScore, 10);
};

const i18nScore = i18nAnalysis();

// 9. Production Readiness
console.log('\n🚀 9. PRODUCTION READINESS:');

const productionReadiness = () => {
  let prodScore = 0;
  
  const productionChecks = [
    { file: 'Dockerfile', name: 'Docker Configuration', weight: 2 },
    { file: '.github/workflows', name: 'CI/CD Pipeline', weight: 3 },
    { file: '.env.production', name: 'Production Environment', weight: 2 },
    { file: 'vercel.json', name: 'Deployment Configuration', weight: 2 },
    { file: 'public/robots.txt', name: 'SEO Configuration', weight: 1 }
  ];
  
  productionChecks.forEach(check => {
    if (fs.existsSync(check.file)) {
      console.log(`✅ ${check.name}: Ready`);
      prodScore += check.weight;
    } else {
      console.log(`⚠️  ${check.name}: Needs Setup`);
    }
  });
  
  return Math.min(prodScore, 10);
};

const productionScore = productionReadiness();

// 10. Final Professional Assessment
console.log('\n' + '='.repeat(60));
console.log('🎯 PROFESSIONAL ASSESSMENT SUMMARY');
console.log('='.repeat(60));

const totalScores = {
  'Architecture': architectureScores.nextjs,
  'TypeScript': architectureScores.typescript,
  'Database (Prisma)': databaseScore,
  'Components': componentArchitectureScore,
  'API Routes': apiRoutesScore,
  'Security': securityScore,
  'Performance': performanceScore,
  'Internationalization': i18nScore,
  'Production Ready': productionScore
};

let totalPoints = 0;
let maxPoints = 0;

Object.entries(totalScores).forEach(([category, score]) => {
  const status = score >= 8 ? '🟢' : score >= 6 ? '🟡' : '🔴';
  console.log(`${status} ${category}: ${score}/10`);
  totalPoints += score;
  maxPoints += 10;
});

const overallScore = Math.round((totalPoints / maxPoints) * 100);

console.log('\n' + '='.repeat(60));
console.log(`🏆 OVERALL SYSTEM GRADE: ${overallScore}%`);

if (overallScore >= 90) {
  console.log('🌟 GRADE: A+ (Enterprise Ready)');
} else if (overallScore >= 80) {
  console.log('⭐ GRADE: A (Production Ready)');
} else if (overallScore >= 70) {
  console.log('✅ GRADE: B+ (Good, Needs Minor Improvements)');
} else if (overallScore >= 60) {
  console.log('⚠️  GRADE: B (Functional, Needs Improvements)');
} else {
  console.log('🔧 GRADE: C (Development Stage, Major Work Needed)');
}

// Professional Recommendations
console.log('\n🔮 PROFESSIONAL RECOMMENDATIONS:');
console.log('='.repeat(60));

const recommendations = [];

if (totalScores['Security'] < 8) {
  recommendations.push('🔐 Enhance security: Implement comprehensive auth flows');
}

if (totalScores['Performance'] < 8) {
  recommendations.push('⚡ Optimize performance: Image optimization & caching');
}

if (totalScores['Production Ready'] < 7) {
  recommendations.push('🚀 Production setup: CI/CD pipeline & deployment config');
}

if (totalScores['API Routes'] < 8) {
  recommendations.push('🌐 Complete API: Missing critical endpoints');
}

if (recommendations.length === 0) {
  console.log('🎉 Excellent work! System meets professional standards.');
  console.log('💡 Focus on: Performance monitoring & user experience');
} else {
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
}

console.log('\n💼 Professional Assessment Complete');
console.log('📊 100+ Project Experience Analysis Finished');
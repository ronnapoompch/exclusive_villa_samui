// ทดสอบการแปลง path สำหรับ optimized images
const testImageUrl = '/api/images/5House/hero/909.jpg';

function convertToOptimizedPath(apiPath) {
  if (apiPath.startsWith('/api/images/')) {
    const staticPath = apiPath.replace('/api/images/', '/optimized-data-images/');
    
    // URL encode เฉพาะ villa folder name
    const pathParts = staticPath.split('/');
    if (pathParts.length >= 3) {
      pathParts[2] = encodeURIComponent(pathParts[2]);
    }
    
    const encodedPath = pathParts.join('/');
    
    // แปลงเป็น WebP (optimized format)
    const webpPath = encodedPath.replace(/\.(jpg|jpeg)$/i, '.webp');
    return webpPath;
  }
  return apiPath;
}

const result = convertToOptimizedPath(testImageUrl);
console.log('Original API path:', testImageUrl);
console.log('Optimized path:', result);

// ทดสอบกับ villa ที่มีช่องว่าง
const testWithSpaces = '/api/images/Anzhu Seamate/hero/C1.jpg';
const resultWithSpaces = convertToOptimizedPath(testWithSpaces);
console.log('\nWith spaces:');
console.log('Original API path:', testWithSpaces);
console.log('Optimized path:', resultWithSpaces);
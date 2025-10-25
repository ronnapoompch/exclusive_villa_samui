// Test page to debug image loading issues
'use client';

import Image from 'next/image';

export default function ImageTest() {
  // Test different path patterns
  const testImageUrl1 = '/optimized-data-images/5House/hero/909.jpg';  // Nested path
  const testImageUrl2 = '/test-image.jpg';   // Root public file
  const testImageUrlWithSpaces = '/optimized-data-images/Anzhu%20Seamate/hero/59a5ce63-e82f-4c86-a9a7-c2586a9aacce.jpg';
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Image Loading Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="font-semibold">1. With leading slash:</h2>
          <img 
            src={testImageUrl1} 
            alt="Test villa image" 
            className="w-64 h-48 object-cover border"
            onLoad={() => console.log('Img with slash loaded:', testImageUrl1)}
            onError={() => console.log('Img with slash failed:', testImageUrl1)}
          />
        </div>
        
        <div>
          <h2 className="font-semibold">2. Root public file:</h2>
          <img 
            src={testImageUrl2} 
            alt="Test villa image" 
            className="w-64 h-48 object-cover border"
            onLoad={() => console.log('Root public file loaded:', testImageUrl2)}
            onError={() => console.log('Root public file failed:', testImageUrl2)}
          />
        </div>
        
        <div>
          <h2 className="font-semibold">3. Next.js Image component:</h2>
          <Image 
            src={testImageUrl1}
            alt="Test villa image"
            width={256}
            height={192}
            className="object-cover border"
            onLoad={() => console.log('Next Image loaded:', testImageUrl1)}
            onError={() => console.log('Next Image failed:', testImageUrl1)}
          />
        </div>
        
        <div>
          <h2 className="font-semibold">4. With spaces (encoded):</h2>
          <img 
            src={testImageUrlWithSpaces} 
            alt="Test villa image with spaces" 
            className="w-64 h-48 object-cover border"
            onLoad={() => console.log('Img with spaces loaded:', testImageUrlWithSpaces)}
            onError={() => console.log('Img with spaces failed:', testImageUrlWithSpaces)}
          />
        </div>
        
        <div>
          <h2 className="font-semibold">5. Test URLs:</h2>
          <div className="space-y-2">
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
              With slash: {testImageUrl1}
            </p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
              Root public: {testImageUrl2}
            </p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
              With spaces: {testImageUrlWithSpaces}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
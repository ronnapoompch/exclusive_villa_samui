'use client';

import Image from 'next/image';

export default function SimpleImageTest() {
  const testImageUrl = '/optimized-data-images/5House/hero/909.jpg';
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ทดสอบรูปภาพง่ายๆ</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold mb-2">1. HTML img tag:</h2>
          <img 
            src={testImageUrl}
            alt="Test villa"
            className="w-64 h-48 object-cover border"
            onLoad={() => console.log('✅ HTML img loaded:', testImageUrl)}
            onError={() => console.log('❌ HTML img failed:', testImageUrl)}
          />
        </div>
        
        <div>
          <h2 className="font-semibold mb-2">2. Next.js Image (unoptimized):</h2>
          <Image
            src={testImageUrl}
            alt="Test villa"
            width={256}
            height={192}
            className="object-cover border"
            unoptimized
            onLoad={() => console.log('✅ Next Image loaded:', testImageUrl)}
            onError={() => console.log('❌ Next Image failed:', testImageUrl)}
          />
        </div>
        
        <div>
          <h2 className="font-semibold mb-2">3. Path being tested:</h2>
          <p className="font-mono text-sm bg-gray-100 p-2 rounded">
            {testImageUrl}
          </p>
        </div>
      </div>
    </div>
  );
}
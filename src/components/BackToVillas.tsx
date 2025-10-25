'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackToVillas() {
  const [backUrl, setBackUrl] = useState('/');

  useEffect(() => {
    // Get the referrer URL and preserve scroll position
    const referrer = document.referrer;
    
    // Check if user came from the main page
    if (referrer && referrer.includes(window.location.origin)) {
      const referrerUrl = new URL(referrer);
      
      // If coming from main page, preserve the villas section anchor
      if (referrerUrl.pathname === '/') {
        setBackUrl('/#villas-section');
      } else {
        setBackUrl(referrer);
      }
    } else {
      // Default to villas section on main page
      setBackUrl('/#villas-section');
    }
  }, []);

  const handleBackClick = () => {
    // Store scroll restoration preference
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scrollRestoration', 'auto');
    }
  };

  return (
    <Link 
      href={backUrl} 
      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      onClick={handleBackClick}
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back to Villas</span>
    </Link>
  );
}
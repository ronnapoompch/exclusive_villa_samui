'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Home, Search, Calendar, User, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/villas', label: 'Villas', icon: Search },
    { href: '/bookings', label: 'My Bookings', icon: Calendar },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/contact', label: 'Contact', icon: Phone },
  ];

  return (
    <div className={`lg:hidden ${className}`}>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="touch-target relative z-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu Panel */}
          <div 
            id="mobile-menu"
            className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 id="mobile-menu-title" className="text-xl font-semibold text-gray-900">
                Menu
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="touch-target p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Navigation Items */}
            <nav className="py-6" aria-label="Mobile navigation">
              <ul className="space-y-2 px-6">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200 touch-target group"
                      >
                        <IconComponent 
                          size={20} 
                          className="text-gray-400 group-hover:text-cyan-600 transition-colors" 
                        />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 p-6 space-y-3">
              <Button 
                className="w-full touch-target bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl py-3 px-4 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Book Now
              </Button>
              <Button 
                variant="outline" 
                className="w-full touch-target border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3 px-4 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Button>
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 p-6">
              <div className="text-sm text-gray-500 space-y-2">
                <p className="font-medium text-gray-700">Need Help?</p>
                <p>📞 +66 (0) 77 123 456</p>
                <p>✉️ info@exclusive-villa-samui.com</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MobileNavigation;
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-6">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/assets/images/logo/logo1.png"
            alt="Exclusive Villa Samui Logo"
            width={50}
            height={50}
            className="rounded-full"
            onError={() => console.warn('Logo image not found')}
          />
          <div className="text-white font-nunito-sans">
            <div className="text-lg font-bold">Exclusive Villa Samui</div>
            <div className="text-xs text-cyan-200">Thailand</div>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 text-white">
          <Link href="#villas" className="hover:text-cyan-300 transition-colors">Villas</Link>
          <Link href="#about" className="hover:text-cyan-300 transition-colors">About</Link>
          <Link href="#contact" className="hover:text-cyan-300 transition-colors">Contact</Link>
          {session?.user?.email === process.env.ADMIN_EMAIL && (
            <Link href="/admin" className="hover:text-yellow-300 transition-colors bg-yellow-600/20 px-3 py-1 rounded-lg">
              Admin
            </Link>
          )}
          
          <div className="flex items-center space-x-4">
            <a href="tel:+66123456789" className="flex items-center space-x-2 hover:text-cyan-300 transition-colors">
              <Phone className="w-4 h-4" />
              <span className="text-sm">+66 123 456 789</span>
            </a>
            
            {/* Authentication State */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 space-x-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{session.user.name || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/bookings">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button 
                    variant="outline" 
                    className="border-cyan-400 text-cyan-100 hover:bg-cyan-400 hover:text-cyan-900"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10">
          <div className="p-6 space-y-4">
            <Link 
              href="#villas" 
              className="block text-white hover:text-cyan-300 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Villas
            </Link>
            <Link 
              href="#about" 
              className="block text-white hover:text-cyan-300 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="#contact" 
              className="block text-white hover:text-cyan-300 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {session?.user ? (
              <div className="space-y-2 pt-4 border-t border-white/10">
                <div className="text-cyan-200 text-sm">Welcome, {session.user.name}</div>
                <Link href="/dashboard" className="block text-white hover:text-cyan-300 transition-colors py-2">
                  Dashboard
                </Link>
                <Link href="/bookings" className="block text-white hover:text-cyan-300 transition-colors py-2">
                  My Bookings
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="block text-red-400 hover:text-red-300 transition-colors py-2 w-full text-left"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t border-white/10">
                <Link 
                  href="/auth/login" 
                  className="block text-white hover:text-cyan-300 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block text-white hover:text-cyan-300 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
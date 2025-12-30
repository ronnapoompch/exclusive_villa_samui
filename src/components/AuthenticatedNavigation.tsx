'use client';


import Link from 'next/link';
import Image from 'next/image';
// TEMPORARILY DISABLED - NextAuth causing issues
// import { useSession, signOut } from 'next-auth/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Phone, User, LogOut, MessageCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import { cn } from '@/lib/utils';
import { CONTACT_INFO } from '@/lib/constants';

export default function AuthenticatedNavigation() {
  // TEMPORARILY DISABLED - NextAuth causing redirect loop
  const session = null;
  const status = 'unauthenticated';

  const handleSignOut = () => {
    // signOut({ callbackUrl: '/' });
    console.log('Sign out disabled temporarily');
  };

  return (
    <>
      {/* Top Contact Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-2 px-4 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-amber-400 font-semibold">🏡 {CONTACT_INFO.tagline}</span>
            <span className="hidden md:inline text-white/80">✨ Direct booking • Real prices</span>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={`tel:${CONTACT_INFO.phone.replace(/[^0-9]/g, '')}`}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">{CONTACT_INFO.phone}</span>
            </a>
            <a 
              href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 px-2.5 py-1 rounded-full transition-all duration-300 font-medium"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="absolute top-[40px] left-0 right-0 z-50 p-4 xs:p-6" role="banner">
      <nav className="container-mobile max-w-7xl mx-auto flex items-center justify-between" role="navigation" aria-label="Main navigation">
        <Link href="/" className="flex items-center space-x-2 xs:space-x-3" aria-label="Go to homepage">
          <Image
            src="/assets/images/logo/logo1.png"
            alt="Exclusive Villa Samui Logo"
            width={40}
            height={40}
            className="rounded-2xl xs:w-12 xs:h-12 sm:w-14 sm:h-14 shadow-lg"
            onError={() => console.warn('Logo image not found')}
          />
          <div className="text-white font-nunito-sans hidden xs:block">
            <div className="text-sm xs:text-base sm:text-lg font-bold">Exclusive Villa Samui</div>
            <div className="text-xs text-cyan-200">Thailand</div>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-white">
          <Link href="#villas" className="hover:text-cyan-300 transition-colors">Villas</Link>
          <Link href="#about" className="hover:text-cyan-300 transition-colors">About</Link>
          <Link href="#contact" className="hover:text-cyan-300 transition-colors">Contact</Link>
          
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Authentication State */}
            {status === 'loading' ? (
              <div 
                className="w-6 h-6 lg:w-8 lg:h-8 rounded-2xl bg-white/20 animate-pulse"
                role="status"
                aria-label="Loading user authentication"
              ></div>
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 space-x-1 lg:space-x-2 text-sm lg:text-base"
                    aria-label={`User menu for ${session.user.name || 'User'}`}
                    aria-haspopup="menu"
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium hidden lg:inline">{session.user.name || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 lg:w-48" role="menu">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" role="menuitem">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" role="menuitem">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookings" role="menuitem">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-1 lg:space-x-2">
                <Link 
                  href="/auth/login"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-white hover:bg-white/10 text-sm lg:text-base")}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-cyan-400 text-cyan-100 hover:bg-cyan-400 hover:text-cyan-900 text-sm lg:text-base")}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation className="text-white" />
      </nav>
    </header>
    </>
  );
}
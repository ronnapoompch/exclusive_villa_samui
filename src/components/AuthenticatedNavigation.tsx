'use client';


import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Phone, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import { cn } from '@/lib/utils';

export default function AuthenticatedNavigation() {
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-4 xs:p-6" role="banner">
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
            <a 
              href="tel:+66123456789" 
              className="flex items-center space-x-2 hover:text-cyan-300 transition-colors text-sm lg:text-base"
              aria-label="Call us at +66 123 456 789"
              role="link"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span className="hidden lg:inline text-sm">+66 123 456 789</span>
            </a>
            
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
  );
}
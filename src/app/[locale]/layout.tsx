import type { Metadata } from 'next'
import { Inter, Nunito_Sans as NunitoSans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { organizationLD, websiteLD } from '@/lib/seo/structured-data'
import { notFound } from 'next/navigation';
import '../globals.css'

const locales = ['en', 'th', 'zh', 'ru'];

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

const nunitoSans = NunitoSans({ 
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito-sans'
})

export const metadata: Metadata = {
  title: "Exclusive Villa Samui - Luxury Villa Rentals",
  description: "Discover exclusive luxury villas in Koh Samui, Thailand. Beachfront properties with world-class amenities, private pools, and personalized service. Book your perfect getaway.",
  keywords: "luxury villas, Koh Samui, Thailand, vacation rentals, beachfront villas, private pools, luxury accommodation",
  authors: [{ name: "Exclusive Villa Samui Team" }],
  creator: "Exclusive Villa Samui",
  publisher: "Exclusive Villa Samui",
  robots: "index, follow",
  metadataBase: new URL('https://exclusive-villa-samui.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://exclusive-villa-samui.com',
    title: 'Exclusive Villa Samui - Luxury Villa Rentals in Thailand',
    description: 'Discover exclusive luxury villas in Koh Samui, Thailand. Beachfront properties with world-class amenities, private pools, and personalized service.',
    siteName: 'Exclusive Villa Samui',
    images: [
      {
        url: '/assets/images/hero/villa-hero-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Luxury Villa in Koh Samui with Ocean View'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exclusive Villa Samui - Luxury Villa Rentals',
    description: 'Discover exclusive luxury villas in Koh Samui, Thailand. Book your perfect luxury getaway.',
    images: ['/assets/images/hero/villa-hero-1.jpg']
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://exclusive-villa-samui.com'
  }
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Await the params before using locale
  const {locale} = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  // Simple locale validation without complex i18n for Next.js 15 compatibility

  return (
    <html lang={locale} dir="ltr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#0891b2" />
        <meta name="msapplication-TileColor" content="#0891b2" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [organizationLD, websiteLD]
            })
          }}
        />
      </head>
      <body className={`${inter.className} ${nunitoSans.variable} antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-cyan-600 text-white px-4 py-2">
          Skip to main content
        </a>
                <SessionProvider>
          <div className={`${inter.className} ${nunitoSans.variable}`}>
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                },
              }}
            />
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}

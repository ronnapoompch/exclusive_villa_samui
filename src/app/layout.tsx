import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Exclusive Villa Samui',
  description: 'Luxury villa rentals in Koh Samui, Thailand',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
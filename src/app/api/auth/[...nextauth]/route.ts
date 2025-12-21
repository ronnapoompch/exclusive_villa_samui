import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyPassword } from '@/lib/auth/password'
import prisma from '@/lib/db/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth authorize called with:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          const dbUser = await prisma.user.findUnique({ 
            where: { email: credentials.email } 
          })

          if (!dbUser || !dbUser.password) {
            console.log('❌ User not found:', credentials.email)
            return null
          }

          const valid = await verifyPassword(credentials.password, dbUser.password)
          if (!valid) {
            console.log('❌ Invalid password for:', credentials.email)
            return null
          }

          console.log('✅ User authenticated:', dbUser.email)
          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: null,
            role: dbUser.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        ;(session.user as any).role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects after login
      if (url.startsWith("/admin/login")) {
        return `${baseUrl}/admin/dashboard`
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  // Ensure these are set for production
  url: process.env.NEXTAUTH_URL || 'https://exclusive-villa-samui.vercel.app',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

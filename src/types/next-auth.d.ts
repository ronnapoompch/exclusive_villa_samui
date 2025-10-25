import { UserRole } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

/**
 * NextAuth type extensions following TypeScript conventions
 * from coding-standards.md
 */

declare module 'next-auth' {
  /**
   * Extended session interface
   */
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
      role: UserRole
    } & DefaultSession['user']
  }

  /**
   * Extended user interface
   */
  interface User extends DefaultUser {
    id: string
    email: string
    name: string | null
    image: string | null
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface
   */
  interface JWT extends DefaultJWT {
    id: string
    email: string
    name: string | null
    image: string | null
    role: UserRole
  }
}
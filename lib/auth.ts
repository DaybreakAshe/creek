import { NextAuthOptions, getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { isAdmin } from '@/lib/admin'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/user'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/api/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          await connectToDatabase()

          const userId = account.providerAccountId || user.id || user.email

          await User.findOneAndUpdate(
            { email: user.email },
            {
              id: userId,
              name: user.name ?? '',
              email: user.email,
              access_token: account.access_token ?? '',
              avatar: user.image ?? '',
              lastLoginAt: new Date(),
            },
            { upsert: true, new: true }
          )
        } catch (error) {
          console.error('Error saving user to database:', error)
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = Boolean(token.isAdmin)
        session.accessToken = token.accessToken as string | undefined
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.id = account.providerAccountId || user?.id
      } else if (user?.id) {
        token.id = user.id
      }
      if (token.id) {
        token.isAdmin = isAdmin(token.id as string)
      }
      return token
    },
  },
}

export function getServerAuthSession() {
  return getServerSession(authOptions)
}

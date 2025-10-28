import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/user'

const authOptions: NextAuthOptions = {
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
      if (account?.provider === 'google') {
        try {
          // 连接到数据库
          await connectToDatabase()

          // 准备保存到数据库的用户数据
          const userData = {
            id: user.id || user.email,
            name: user.name,
            email: user.email,
            access_token: account.access_token,
            avatar: user.image || '',
          }

          // 更新或创建用户
          await User.findOneAndUpdate({ email: user.email }, userData, {
            upsert: true,
            new: true,
          })
        } catch (error) {
          console.error('Error saving user to database:', error)
          return true // 即使保存失败也允许登录
        }
      }
      return true
    },
    async session({ session, token }) {
      // 将 JWT token 添加到 session 中
      if (session.user) {
        ;(session as any).accessToken = token.accessToken
      }
      return session
    },
    async jwt({ token, user, account }) {
      // 保存 OAuth 账户信息（包括 access_token）
      if (account) {
        token.accessToken = account.access_token
        if (user) {
          token.id = user.id
        }
      }
      return token
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

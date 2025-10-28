import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

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
    async session({ session, token }) {
      // 将 JWT token 添加到 session 中
      if (session.user) {
        // session.user.id = token.sub as string
        // 如果需要在客户端访问 token，可以通过访问 token 字段
        (session as any).accessToken = token.accessToken
      }
      return session
    },
    async jwt({ token, user, account }) {
      // 保存 OAuth 账户信息（包括 access_token）
      if (account) {
        token.accessToken = account.access_token
        token.id = user.id
      }
      return token
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

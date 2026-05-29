import type { Session } from 'next-auth'

export function getSessionUserId(
  session: Session | null | undefined
): string | undefined {
  return session?.user?.id || undefined
}

export function isSessionUser(
  session: Session | null | undefined,
  userId: string
): boolean {
  if (!session?.user) return false
  return session.user.id === userId || session.user.email === userId
}

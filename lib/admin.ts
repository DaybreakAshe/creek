export function getAdminUserId(): string | undefined {
  return process.env.ADMIN_USER_ID
}

export function isAdmin(userId: string | undefined | null): boolean {
  if (!userId) return false
  const adminId = getAdminUserId()
  if (!adminId) return false
  return userId === adminId
}

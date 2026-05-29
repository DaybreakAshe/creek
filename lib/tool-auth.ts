import { isAdmin } from '@/lib/admin'

export function canManageTool(
  tool: { userId?: string | null },
  userId?: string | null
): boolean {
  if (!userId) return false
  if (isAdmin(userId)) return true
  if (!tool.userId) return false
  return tool.userId === userId
}

export const publicToolsFilter = {
  isPublic: true,
}

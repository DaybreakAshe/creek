import { isAdmin } from '@/lib/admin'

export function canManageGalleryItem(
  item: { userId?: string | null },
  userId?: string | null
): boolean {
  if (!userId) return false
  if (isAdmin(userId)) return true
  if (!item.userId) return false
  return item.userId === userId
}

export const publicGalleryFilter = {
  isPublic: true,
}

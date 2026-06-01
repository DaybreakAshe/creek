import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { connectToDatabase } from '@/lib/mongodb'
import { apiError } from '@/lib/api-response'
import GalleryItem from '@/models/gallery-item'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    await connectToDatabase()
    const items = await GalleryItem.find({}).sort({ createdAt: -1 }).lean()

    return NextResponse.json(items)
  } catch {
    return apiError('fetchGalleryFailed', 500)
  }
}

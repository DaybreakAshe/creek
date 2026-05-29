import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { connectToDatabase } from '@/lib/mongodb'
import { apiError } from '@/lib/api-response'
import Tool from '@/models/tool'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    await connectToDatabase()
    const tools = await Tool.find({}).sort({ createdAt: -1 })

    return NextResponse.json(tools)
  } catch {
    return apiError('fetchToolsFailed', 500)
  }
}

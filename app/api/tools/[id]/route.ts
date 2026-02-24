import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Tool from '@/models/tool'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const body = await request.json()
    const tool = await Tool.findByIdAndUpdate(params.id, body, { new: true })
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }
    return NextResponse.json(tool)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const tool = await Tool.findByIdAndDelete(params.id)
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Tool deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

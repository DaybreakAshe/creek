import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Tool from '@/models/tool'
import mongoose from 'mongoose'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid tool id' }, { status: 400 })
    }
    await connectToDatabase()
    const body = (await request.json()) ?? {}
    // 避免更新请求体里包含不可更新字段，导致 Mongoose 抛错 500
    const { _id, createdAt, updatedAt, ...rest } = body
    const tool = await Tool.findByIdAndUpdate(
      params.id,
      { $set: rest },
      { new: true }
    )
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
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid tool id' }, { status: 400 })
    }
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

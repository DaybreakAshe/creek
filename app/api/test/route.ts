// src/app/api/test-mongo/route.ts
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

// 定义一个简单模型
const TestSchema = new mongoose.Schema({ name: String })
const TestModel = mongoose.models.Test || mongoose.model('Test', TestSchema)

export async function GET() {
  try {
    await connectToDatabase()

    // 写入一条测试数据
    const doc = await TestModel.create({ name: 'Next.js + MongoDB' })

    return NextResponse.json({ success: true, data: doc })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}


// @see https://chatgpt.com/s/t_68ff26c04de48191b48932b3d7511d7e
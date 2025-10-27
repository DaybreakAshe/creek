// app/api/hello/route.ts

import { NextResponse } from 'next/server'

/**
 * 处理 GET 请求
 * @param request 完整的请求对象 (可选)
 * @returns 包含 "Hello World" 的 JSON 响应
 */
export async function GET(request: Request) {
  // 返回一个标准的 Web Response 对象或使用 NextResponse
  return NextResponse.json({
    message: 'Hello World from Next.js App Router API',
  })
}

// 访问路径：/api/hello

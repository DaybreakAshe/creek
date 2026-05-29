// src/lib/mongodb.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

/**
 * 缓存数据库连接，防止热重载时重复连接
 */
let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((mongoose) => mongoose)
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    // 连接失败后清除缓存，避免 rejected promise 被永久复用
    cached.promise = null
    cached.conn = null
    throw error
  }

  return cached.conn
}

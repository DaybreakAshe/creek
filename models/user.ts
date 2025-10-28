import mongoose, { Schema, model, models } from 'mongoose'

export interface UserInfo {
  id: string
  name: string
  email: string
  access_token: string
  avatar: string
}

const userSchema = new Schema<UserInfo>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    access_token: { type: String, required: true },
    avatar: { type: String, default: '' },
  },
  { collection: 'users' }
)

// 只在开发环境下使用 mongoose.models 来避免重复定义
const User = models.User || model<UserInfo>('User', userSchema)

export default User

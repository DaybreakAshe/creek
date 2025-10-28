import { UserInfo } from '@/models/user'

const USER_KEY = 'user_info'

/**
 * 安全地获取 localStorage 中的数据
 */
export const loadUser = (): UserInfo | null => {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const serializedState = localStorage.getItem(USER_KEY)
    if (serializedState === null) {
      return null
    }
    // 解析 JSON 字符串为对象
    return JSON.parse(serializedState) as UserInfo
  } catch (err) {
    console.error('Failed to load user info from localStorage', err)
    return null
  }
}

/**
 * 安全地保存数据到 localStorage
 */
export const saveUser = (user: UserInfo): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const serializedState = JSON.stringify(user)
    localStorage.setItem(USER_KEY, serializedState)
  } catch (err) {
    console.error('Failed to save user info to localStorage', err)
  }
}

/**
 * 移除用户信息
 */
export const removeUser = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(USER_KEY)
  } catch (err) {
    console.error('Failed to remove user info from localStorage', err)
  }
}

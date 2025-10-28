import { FC } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { UserInfo } from '@/models/User'

interface UserAvatarProps {
  user: UserInfo
}

export const UserAvatar: FC<UserAvatarProps> = ({ user }) => {
  return (
    <Avatar>
      <AvatarImage src={user.avatar || ''} alt={user.name || 'User'} />
      <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
    </Avatar>
  )
}

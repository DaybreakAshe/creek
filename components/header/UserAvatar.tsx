import { FC } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { UserInfo } from '@/models/user'

interface UserAvatarProps {
  user: Pick<UserInfo, 'name' | 'avatar'>
}

export const UserAvatar: FC<UserAvatarProps> = ({ user }) => {
  return (
    <Avatar>
      <AvatarImage src={user.avatar || ''} alt={user.name || 'User'} />
      <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
    </Avatar>
  )
}

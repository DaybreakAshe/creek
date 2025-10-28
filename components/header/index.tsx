import { AnimatedThemeTogglerIcon } from '@/components/theme/AnimatedThemeToggler'
import { VideoText } from '@/components/ui/video-text'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UserInfo } from '@/components/header/UserInfo'

export const Header = () => {
  return (
    <div className="border-border bg-background fixed top-0 left-0 z-50 flex h-16 w-full items-center border-b">
      <div className="container mx-auto flex h-full w-full items-center justify-between px-3">
        <VideoText
          src="https://cdn.magicui.design/ocean-small.webm"
          fontSize={30}
          className="w-20"
        >
          Creek
        </VideoText>
        <div className="flex items-center gap-3">
          <AnimatedThemeTogglerIcon />
          <UserInfo />
        </div>
      </div>
    </div>
  )
}

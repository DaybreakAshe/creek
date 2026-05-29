import { AnimatedThemeTogglerIcon } from '@/components/theme/AnimatedThemeToggler'
import { VideoText } from '@/components/ui/video-text'
import { UserInfo } from '@/components/header/UserInfo'

export const Header = () => {
  return (
    <header className="border-border bg-background z-50 flex h-16 w-full shrink-0 items-center border-b">
      <div className="flex size-full items-center justify-between px-5">
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
    </header>
  )
}

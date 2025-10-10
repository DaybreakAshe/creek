import { AnimatedThemeTogglerIcon } from '@/components/theme/AnimatedThemeToggler'
import { VideoText } from '@/components/ui/video-text'
export const Header = () => {
  return (
    // 固定在顶部
    <div className="border-border bg-background fixed top-0 left-0 flex h-16 w-full items-center border-b z-50">
      <div className="container mx-auto flex h-full w-full items-center justify-between px-3">
        <VideoText
          src="https://cdn.magicui.design/ocean-small.webm"
          fontSize={30}
          className="w-20"
        >
          Creek
        </VideoText>
        <AnimatedThemeTogglerIcon />
      </div>
    </div>
  )
}

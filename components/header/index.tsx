import { AnimatedThemeTogglerIcon } from '@/components/theme/AnimatedThemeToggler'
import { VideoText } from '@/components/ui/video-text'
import { Link } from '@/i18n/navigation'
import { HeaderNav } from '@/components/header/HeaderNav'
import { HeaderSocial } from '@/components/header/HeaderSocial'
import { UserInfo } from '@/components/header/UserInfo'
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher'

export const Header = () => {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 z-50 w-full shrink-0 border-b backdrop-blur">
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-5">
        <Link href="/" className="justify-self-start">
          <VideoText
            src="https://cdn.magicui.design/ocean-small.webm"
            fontSize={30}
            className="w-20"
          >
            Creek
          </VideoText>
        </Link>

        <div className="justify-self-center">
          <HeaderNav />
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <div className="flex items-center">
            <HeaderSocial />
            <AnimatedThemeTogglerIcon />
            <LanguageSwitcher />
          </div>
          <UserInfo />
        </div>
      </div>
    </header>
  )
}

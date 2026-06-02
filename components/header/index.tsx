import { AnimatedThemeTogglerIcon } from '@/components/theme/AnimatedThemeToggler'
import { VideoText } from '@/components/ui/video-text'
import { Link } from '@/i18n/navigation'
import { HeaderNav } from '@/components/header/HeaderNav'
import { HeaderSocial } from '@/components/header/HeaderSocial'
import { HeaderMobileMenu } from '@/components/header/HeaderMobileMenu'
import { UserInfo } from '@/components/header/UserInfo'
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher'

export const Header = () => {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full shrink-0 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-5">
        <Link
          href="/"
          aria-label="Creek"
          className="block h-9 w-[4.5rem] shrink-0 sm:h-10 sm:w-20"
        >
          <VideoText
            src="https://cdn.magicui.design/ocean-small.webm"
            fontSize={30}
            className="size-full"
          >
            Creek
          </VideoText>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <HeaderNav />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <HeaderSocial />
          <AnimatedThemeTogglerIcon />
          <LanguageSwitcher />
          <UserInfo />
          <HeaderMobileMenu />
        </div>
      </div>
    </header>
  )
}

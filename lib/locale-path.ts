import { routing, type Locale } from '@/i18n/routing'

export function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (locale === routing.defaultLocale) {
    return normalized
  }
  return `/${locale}${normalized}`
}

export function loginRedirectPath(callbackPath: string, locale: Locale): string {
  const loginPath = localizedPath('/login', locale)
  return `${loginPath}?callbackUrl=${encodeURIComponent(callbackPath)}`
}

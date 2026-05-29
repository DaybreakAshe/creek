import type { Locale } from '@/i18n/routing'

export function formatDateTime(
  value: Date | string | number,
  locale: Locale
): string {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')
}

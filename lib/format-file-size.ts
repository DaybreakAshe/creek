import type { Locale } from '@/i18n/routing'

export function formatFileSize(bytes: number, locale: Locale): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-'
  if (bytes === 0) return locale === 'zh' ? '0 B' : '0 B'

  const units =
    locale === 'zh'
      ? ['B', 'KB', 'MB', 'GB']
      : ['B', 'KB', 'MB', 'GB']
  const base = 1024
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  )
  const value = bytes / base ** index
  const formatted =
    index === 0 ? String(Math.round(value)) : value.toFixed(1)

  return `${formatted} ${units[index]}`
}

export function parseFileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot <= 0 || dot === filename.length - 1) return ''
  return filename.slice(dot + 1).toLowerCase()
}

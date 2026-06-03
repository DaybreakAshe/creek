/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ImagePlus, Link2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/api-error'
import {
  inferGalleryUploadTypeFromFile,
  inferGalleryUploadTypeFromUrl,
  parseTagsInput,
} from '@/lib/gallery-form'
import { parseFileExtension } from '@/lib/format-file-size'
import type { GalleryUploadMediaType } from '@/lib/gallery-types'
import { cn } from '@/lib/utils'

interface GalleryUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type MediaSource = 'file' | 'url'

const textareaClassName =
  'border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[4.5rem] w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'

const GALLERY_UPLOAD_FOLDER = '/creek/gallery'

type SubmitPhase = 'idle' | 'uploading' | 'saving'

function isAllowedUploadFile(file: File) {
  return inferGalleryUploadTypeFromFile(file) !== null
}

function isValidMediaUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function filenameFromUrl(url: string) {
  try {
    const name = new URL(url.trim()).pathname.split('/').pop()?.trim()
    return name || ''
  } catch {
    return ''
  }
}

export function GalleryUploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: GalleryUploadDialogProps) {
  const t = useTranslations('home.gallery')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [altText, setAltText] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [mediaSource, setMediaSource] = useState<MediaSource>('file')
  const [file, setFile] = useState<File | null>(null)
  const [externalUrl, setExternalUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null)
  const [phase, setPhase] = useState<SubmitPhase>('idle')
  const [error, setError] = useState<string | null>(null)

  const submitting = phase !== 'idle'

  const trimmedExternalUrl = externalUrl.trim()
  const externalUrlValid =
    trimmedExternalUrl.length > 0 && isValidMediaUrl(trimmedExternalUrl)

  const detectedType: GalleryUploadMediaType | null =
    mediaSource === 'file' && file
      ? inferGalleryUploadTypeFromFile(file)
      : mediaSource === 'url' && externalUrlValid
        ? inferGalleryUploadTypeFromUrl(trimmedExternalUrl)
        : null

  const hasMedia = mediaSource === 'file' ? Boolean(file) : externalUrlValid

  const canSubmit = title.trim().length > 0 && hasMedia && !submitting

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setTags('')
    setAltText('')
    setIsPublic(true)
    setMediaSource('file')
    setFile(null)
    setExternalUrl('')
    setPreviewUrl(null)
    setUploadedMediaUrl(null)
    setPhase('idle')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  useEffect(() => {
    if (mediaSource !== 'file' || !file) {
      if (mediaSource === 'file') setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file, mediaSource])

  useEffect(() => {
    if (mediaSource !== 'url') return
    setPreviewUrl(externalUrlValid ? trimmedExternalUrl : null)
  }, [mediaSource, trimmedExternalUrl, externalUrlValid])

  const switchMediaSource = (source: MediaSource) => {
    if (source === mediaSource) return
    setError(null)
    setMediaSource(source)
    setFile(null)
    setExternalUrl('')
    setPreviewUrl(null)
    setUploadedMediaUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    if (!selected) return

    if (!isAllowedUploadFile(selected)) {
      setError(t('mediaTypeNotAllowed'))
      setFile(null)
      resetFileInput()
      return
    }

    setError(null)
    setFile(selected)
    setUploadedMediaUrl(null)
  }

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadFileToSirv = async (
    mediaFile: File
  ): Promise<{ url: string; filename: string }> => {
    const formData = new FormData()
    formData.append('file', mediaFile)
    formData.append('folder', GALLERY_UPLOAD_FOLDER)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(
          tErrors,
          typeof data.error === 'string' ? data.error : undefined,
          'uploadFailed'
        )
      )
    }

    if (typeof data.url !== 'string' || !data.url) {
      throw new Error(getApiErrorMessage(tErrors, undefined, 'uploadFailed'))
    }

    return {
      url: data.url,
      filename: typeof data.filename === 'string' ? data.filename : '',
    }
  }

  const saveGalleryItem = async (payload: {
    title: string
    description: string
    type: GalleryUploadMediaType
    mediaUrl: string
    mediaFilename: string
    mimeType: string
    originalFilename: string
    fileExtension: string
    fileSize: number
    tags: string[]
    altText: string
    linkUrl: string
    isPublic: boolean
  }) => {
    const response = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(
          tErrors,
          typeof data.error === 'string' ? data.error : undefined,
          'createGalleryFailed'
        )
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    if (mediaSource === 'file') {
      if (!file) {
        setError(t('mediaRequired'))
        return
      }
      if (!isAllowedUploadFile(file)) {
        setError(t('mediaTypeNotAllowed'))
        return
      }
    } else {
      if (!trimmedExternalUrl) {
        setError(t('mediaRequired'))
        return
      }
      if (!isValidMediaUrl(trimmedExternalUrl)) {
        setError(t('mediaUrlInvalid'))
        return
      }
    }

    const type = detectedType
    if (!type) {
      setError(t('mediaTypeNotAllowed'))
      return
    }

    setError(null)

    try {
      let mediaUrl: string
      let mediaFilename = ''
      let mimeType = ''
      let originalFilename = ''
      let fileExtension = ''
      let fileSize = 0

      if (mediaSource === 'file' && file) {
        setPhase('uploading')
        const uploaded = await uploadFileToSirv(file)
        mediaUrl = uploaded.url
        mediaFilename = uploaded.filename
        mimeType = file.type || 'application/octet-stream'
        originalFilename = file.name
        fileExtension = parseFileExtension(file.name)
        fileSize = file.size
        setUploadedMediaUrl(mediaUrl)
      } else {
        mediaUrl = trimmedExternalUrl
        originalFilename = filenameFromUrl(trimmedExternalUrl)
        fileExtension = parseFileExtension(originalFilename)
        mimeType =
          type === 'video' ? 'video/*' : type === 'image' ? 'image/*' : ''
      }

      setPhase('saving')
      await saveGalleryItem({
        title: title.trim(),
        description: description.trim(),
        type,
        mediaUrl,
        mediaFilename,
        mimeType,
        originalFilename,
        fileExtension,
        fileSize,
        tags: parseTagsInput(tags),
        altText: altText.trim(),
        linkUrl: '',
        isPublic,
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveFailed'))
    } finally {
      setPhase('idle')
    }
  }

  const submitLabel =
    phase === 'uploading'
      ? t('uploadingMedia')
      : phase === 'saving'
        ? t('saving')
        : t('submit')

  const renderPreview = () => {
    if (!previewUrl || !detectedType) return null

    if (detectedType === 'image') {
      return (
        <img
          src={previewUrl}
          alt={altText || title || t('previewAlt')}
          className="max-h-full max-w-full object-contain"
        />
      )
    }

    return (
      <video
        src={previewUrl}
        controls
        playsInline
        preload="metadata"
        className="max-h-full max-w-full object-contain"
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[calc(100dvh-0.5rem)] w-[calc(100vw-0.5rem)] max-w-[calc(100vw-0.5rem)] flex-col gap-0 overflow-hidden p-0',
          'top-[50%] translate-y-[-50%] rounded-xl border shadow-lg',
          'sm:max-h-[min(36rem,calc(100dvh-2rem))] sm:max-w-[min(56rem,calc(100vw-1.5rem))] sm:rounded-lg'
        )}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="pr-8 text-base sm:text-lg">
            {t('dialogTitle')}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="grid items-start md:grid-cols-[11fr_13fr] md:overflow-hidden">
              {/* 左侧：媒体来源 */}
              <div className="bg-muted/40 flex flex-col gap-3 border-b p-4 md:min-h-0 md:border-r md:border-b-0">
                <div
                  className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1"
                  role="tablist"
                  aria-label={t('mediaLabel')}
                >
                  {(['file', 'url'] as const).map((source) => (
                    <button
                      key={source}
                      type="button"
                      role="tab"
                      aria-selected={mediaSource === source}
                      disabled={submitting}
                      onClick={() => switchMediaSource(source)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:text-sm',
                        mediaSource === source
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {source === 'file' ? (
                        <ImagePlus className="size-4 shrink-0" />
                      ) : (
                        <Link2 className="size-4 shrink-0" />
                      )}
                      {source === 'file'
                        ? t('mediaSourceLocal')
                        : t('mediaSourceUrl')}
                    </button>
                  ))}
                </div>

                {mediaSource === 'file' ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      disabled={submitting}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                      className={cn(
                        'border-input bg-background group relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-dashed transition-colors sm:h-36',
                        'hover:bg-accent/30 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                        file && 'border-solid'
                      )}
                    >
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                        {file && previewUrl ? (
                          renderPreview()
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                            <ImagePlus className="text-muted-foreground size-7 sm:size-8" />
                            <span className="text-sm font-medium">
                              {t('selectFile')}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {t('mediaHint')}
                            </span>
                          </div>
                        )}
                      </div>
                      {file && previewUrl && (
                        <span className="bg-background/90 pointer-events-none absolute inset-x-0 bottom-0 py-1 text-center text-[11px] font-medium sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                          {t('changeFile')}
                        </span>
                      )}
                      {uploadedMediaUrl && (
                        <span className="bg-primary text-primary-foreground absolute top-2 right-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium">
                          {t('mediaUploaded')}
                        </span>
                      )}
                    </button>

                    {file && (
                      <p className="text-muted-foreground shrink-0 truncate text-xs">
                        {file.name} · {(file.size / 1024).toFixed(1)} KB
                        {detectedType && (
                          <span className="text-foreground/70">
                            {' '}
                            · {t(`types.${detectedType}`)}
                          </span>
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="gallery-external-url" className="text-xs">
                      {t('externalUrlLabel')} *
                    </Label>
                    <Input
                      id="gallery-external-url"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      value={externalUrl}
                      onChange={(e) => {
                        setError(null)
                        setExternalUrl(e.target.value)
                      }}
                      placeholder={t('externalUrlPlaceholder')}
                      disabled={submitting}
                      className="h-9"
                    />
                    <div
                      className={cn(
                        'border-input bg-background relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed p-2 sm:h-36',
                        externalUrlValid && 'border-solid'
                      )}
                    >
                      {externalUrlValid && previewUrl ? (
                        renderPreview()
                      ) : (
                        <p className="text-muted-foreground px-4 text-center text-xs">
                          {t('mediaHint')}
                        </p>
                      )}
                    </div>
                    {externalUrlValid && detectedType && (
                      <p className="text-muted-foreground text-xs">
                        {t(`types.${detectedType}`)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 右侧：表单 */}
              <div className="flex flex-col gap-3 p-4 sm:p-5">
                <div className="space-y-1.5">
                  <Label htmlFor="gallery-title" className="text-xs">
                    {t('titleLabel')} *
                  </Label>
                  <Input
                    id="gallery-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('titlePlaceholder')}
                    required
                    maxLength={120}
                    disabled={submitting}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gallery-description" className="text-xs">
                    {t('descriptionLabel')}
                  </Label>
                  <textarea
                    id="gallery-description"
                    rows={2}
                    className={textareaClassName}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('descriptionPlaceholder')}
                    maxLength={500}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gallery-tags" className="text-xs">
                    {t('tagsLabel')}
                  </Label>
                  <Input
                    id="gallery-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder={t('tagsPlaceholder')}
                    disabled={submitting}
                    className="h-9"
                  />
                </div>

                <label className="border-input bg-muted/30 flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5">
                  <input
                    id="gallery-public"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="size-4 shrink-0 rounded border"
                    disabled={submitting}
                  />
                  <span className="text-sm">{t('isPublicLabel')}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-muted/20 flex shrink-0 flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
            <div className="min-w-0 flex-1">
              {error ? (
                <p
                  className="text-destructive text-sm wrap-break-word"
                  role="alert"
                >
                  {error}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {mediaSource === 'url' ? t('footerHintUrl') : t('footerHint')}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={!canSubmit}
              >
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  FileText,
  Film,
  ImagePlus,
  Image as ImageIcon,
  Music,
} from 'lucide-react'
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
import { parseTagsInput } from '@/lib/gallery-form'
import { GALLERY_MEDIA_TYPES, type GalleryMediaType } from '@/lib/gallery-types'
import { cn } from '@/lib/utils'

interface GalleryUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const textareaClassName =
  'border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[4.5rem] w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'

const GALLERY_UPLOAD_FOLDER = '/creek/gallery'

const TYPE_ICONS = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
} as const

type SubmitPhase = 'idle' | 'uploading' | 'saving'

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
  const [type, setType] = useState<GalleryMediaType>('image')
  const [tags, setTags] = useState('')
  const [altText, setAltText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null)
  const [phase, setPhase] = useState<SubmitPhase>('idle')
  const [error, setError] = useState<string | null>(null)

  const submitting = phase !== 'idle'

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setType('image')
    setTags('')
    setAltText('')
    setLinkUrl('')
    setIsPublic(true)
    setFile(null)
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
    if (!file) {
      setPreviewUrl(null)
      setUploadedMediaUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setUploadedMediaUrl(null)
    if (selected?.type.startsWith('image/')) {
      setType('image')
    } else if (selected?.type.startsWith('video/')) {
      setType('video')
    } else if (selected?.type.startsWith('audio/')) {
      setType('audio')
    }
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
    type: GalleryMediaType
    mediaUrl: string
    mediaFilename: string
    mimeType: string
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
    if (!file) {
      setError(t('fileRequired'))
      return
    }

    setError(null)

    try {
      setPhase('uploading')
      const { url, filename } = await uploadFileToSirv(file)
      setUploadedMediaUrl(url)

      setPhase('saving')
      await saveGalleryItem({
        title: title.trim(),
        description: description.trim(),
        type,
        mediaUrl: url,
        mediaFilename: filename,
        mimeType: file.type || 'application/octet-stream',
        tags: parseTagsInput(tags),
        altText: altText.trim(),
        linkUrl: linkUrl.trim(),
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
    if (!file || !previewUrl) return null

    if (type === 'image' || file.type.startsWith('image/')) {
      return (
        <img
          src={previewUrl}
          alt={altText || title || t('previewAlt')}
          className="max-h-full max-w-full object-contain"
        />
      )
    }

    if (type === 'video' || file.type.startsWith('video/')) {
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

    if (type === 'audio' || file.type.startsWith('audio/')) {
      return (
        <div className="flex max-h-full w-full flex-col items-center justify-center gap-2 p-2">
          <Music className="text-muted-foreground size-8 shrink-0" />
          <audio src={previewUrl} controls preload="metadata" className="w-full" />
        </div>
      )
    }

    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 p-2">
        <FileText className="size-8 shrink-0 opacity-70" />
        <span className="max-w-full truncate px-2 text-xs">{file.name}</span>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(32rem,calc(100dvh-2rem))] max-w-[min(56rem,calc(100vw-1.5rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[56rem]">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 items-start overflow-hidden md:grid-cols-[11fr_13fr]">
            {/* 左侧：媒体（预览区固定高度，避免挤压类型选项） */}
            <div className="bg-muted/40 flex min-h-0 shrink-0 flex-col gap-2.5 border-b p-4 md:border-r md:border-b-0">
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                disabled={submitting}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                className={cn(
                  'border-input bg-background group relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-dashed transition-colors',
                  'hover:bg-accent/30 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                  file && 'border-solid'
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  {file && previewUrl ? (
                    renderPreview()
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <ImagePlus className="text-muted-foreground size-8" />
                      <span className="text-sm font-medium">{t('selectFile')}</span>
                      <span className="text-muted-foreground text-xs">
                        {t('mediaHint')}
                      </span>
                    </div>
                  )}
                </div>
                {file && previewUrl && (
                  <span className="bg-background/90 pointer-events-none absolute inset-x-0 bottom-0 py-1 text-center text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100">
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
                </p>
              )}

              <div className="relative z-10 shrink-0 space-y-1.5">
                <Label className="text-xs">{t('typeLabel')}</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {GALLERY_MEDIA_TYPES.map((mediaType) => {
                    const Icon = TYPE_ICONS[mediaType]
                    const active = type === mediaType
                    return (
                      <button
                        key={mediaType}
                        type="button"
                        disabled={submitting}
                        onClick={() => setType(mediaType)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] transition-colors',
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-input hover:bg-accent/50 text-muted-foreground'
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="leading-none">{t(`types.${mediaType}`)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 右侧：表单 */}
            <div className="flex flex-col gap-3 p-5">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gallery-alt" className="text-xs">
                    {t('altTextLabel')}
                  </Label>
                  <Input
                    id="gallery-alt"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder={t('altTextPlaceholder')}
                    maxLength={200}
                    disabled={submitting}
                    className="h-9"
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
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gallery-link" className="text-xs">
                  {t('linkUrlLabel')}
                </Label>
                <Input
                  id="gallery-link"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={t('linkUrlPlaceholder')}
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
                  className="size-4 rounded border"
                  disabled={submitting}
                />
                <span className="text-sm">{t('isPublicLabel')}</span>
              </label>
            </div>
          </div>

          <div className="bg-muted/20 flex shrink-0 items-center justify-between gap-4 border-t px-6 py-3">
            <div className="min-w-0 flex-1">
              {error ? (
                <p className="text-destructive truncate text-sm" role="alert">
                  {error}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">{t('footerHint')}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" size="sm" disabled={submitting || !file}>
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

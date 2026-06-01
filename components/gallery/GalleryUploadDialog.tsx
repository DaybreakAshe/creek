/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ImagePlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { getApiErrorMessage } from '@/lib/api-error'
import { parseTagsInput } from '@/lib/gallery-form'
import { GALLERY_MEDIA_TYPES, type GalleryMediaType } from '@/lib/gallery-types'

interface GalleryUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const textareaClassName =
  'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[88px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'

const GALLERY_UPLOAD_FOLDER = '/creek/gallery'

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
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null)
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
    setUploadedFilename(null)
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
      setUploadedFilename(null)
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
    setUploadedFilename(null)
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
      setUploadedFilename(filename)

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gallery-title">{t('titleLabel')} *</Label>
            <Input
              id="gallery-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              required
              maxLength={120}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-description">{t('descriptionLabel')}</Label>
            <textarea
              id="gallery-description"
              className={textareaClassName}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              maxLength={500}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('typeLabel')} *</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as GalleryMediaType)}
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              disabled={submitting}
            >
              {GALLERY_MEDIA_TYPES.map((mediaType) => (
                <label
                  key={mediaType}
                  htmlFor={`gallery-type-${mediaType}`}
                  className="border-input hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <RadioGroupItem
                    value={mediaType}
                    id={`gallery-type-${mediaType}`}
                  />
                  {t(`types.${mediaType}`)}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>{t('mediaLabel')} *</Label>
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
              className="border-input hover:bg-accent/50 flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm transition-colors"
            >
              <ImagePlus className="text-muted-foreground size-8" />
              <span>{file ? t('changeFile') : t('selectFile')}</span>
            </button>
            {previewUrl && type === 'image' && (
              <img
                src={previewUrl}
                alt={altText || title || t('previewAlt')}
                className="max-h-40 w-full rounded-md object-contain"
              />
            )}
            {file && (
              <p className="text-muted-foreground text-xs">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {uploadedMediaUrl && (
              <p className="text-muted-foreground text-xs break-all">
                {t('mediaUploaded')}: {uploadedMediaUrl}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-alt">{t('altTextLabel')}</Label>
            <Input
              id="gallery-alt"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder={t('altTextPlaceholder')}
              maxLength={200}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-tags">{t('tagsLabel')}</Label>
            <Input
              id="gallery-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t('tagsPlaceholder')}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-link">{t('linkUrlLabel')}</Label>
            <Input
              id="gallery-link"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder={t('linkUrlPlaceholder')}
              disabled={submitting}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="gallery-public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="size-4 rounded border"
              disabled={submitting}
            />
            <Label htmlFor="gallery-public" className="cursor-pointer">
              {t('isPublicLabel')}
            </Label>
          </div>

          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={submitting || !file}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

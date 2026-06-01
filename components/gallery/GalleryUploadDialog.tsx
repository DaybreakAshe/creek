/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
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
import { GALLERY_MEDIA_TYPES, type GalleryMediaType } from '@/lib/gallery-types'

interface GalleryUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const textareaClassName =
  'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[88px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'

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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    if (!open) {
      resetForm()
      return
    }
  }, [open])

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    if (selected?.type.startsWith('image/')) {
      setType('image')
    } else if (selected?.type.startsWith('video/')) {
      setType('video')
    } else if (selected?.type.startsWith('audio/')) {
      setType('audio')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError(t('fileRequired'))
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('type', type)
      formData.append('tags', tags)
      formData.append('altText', altText.trim())
      formData.append('linkUrl', linkUrl.trim())
      formData.append('isPublic', String(isPublic))

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(
          getApiErrorMessage(
            tErrors,
            typeof data.error === 'string' ? data.error : undefined,
            'uploadFailed'
          )
        )
        return
      }

      onSuccess?.()
      onOpenChange(false)
    } catch {
      setError(getApiErrorMessage(tErrors, undefined, 'uploadFailed'))
    } finally {
      setSubmitting(false)
    }
  }

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
            />
          </div>

          <div className="space-y-2">
            <Label>{t('typeLabel')} *</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as GalleryMediaType)}
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
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
            <Label htmlFor="gallery-file">{t('mediaLabel')} *</Label>
            <Input
              id="gallery-file"
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              required
            />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-alt">{t('altTextLabel')}</Label>
            <Input
              id="gallery-alt"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder={t('altTextPlaceholder')}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-tags">{t('tagsLabel')}</Label>
            <Input
              id="gallery-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t('tagsPlaceholder')}
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
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="gallery-public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="size-4 rounded border"
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
            <Button type="submit" disabled={submitting}>
              {submitting ? t('uploading') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

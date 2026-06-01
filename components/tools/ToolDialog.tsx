'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ImagePlus, X } from 'lucide-react'
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
import { getApiErrorMessage } from '@/lib/api-error'
import { isToolIconUrl } from '@/lib/tool-icon'
import { ToolIcon } from '@/components/tools/ToolIcon'
import { ToolLink } from '@/models/tool'
import { cn } from '@/lib/utils'

const TOOL_ICON_FOLDER = '/creek/tools'

interface ToolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tool?: ToolLink | null
  onSave: (tool: Partial<ToolLink>) => void | Promise<void>
}

export function ToolDialog({
  open,
  onOpenChange,
  tool,
  onSave,
}: ToolDialogProps) {
  const t = useTranslations('tools')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<Partial<ToolLink>>({
    name: '',
    url: '',
    description: '',
    icon: '',
    category: 'general',
    isPublic: false,
  })
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetIconState = () => {
    setIconFile(null)
    setIconPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    if (!open) return

    if (tool) {
      setFormData(tool)
      setIconPreview(isToolIconUrl(tool.icon) ? tool.icon!.trim() : null)
      setIconFile(null)
    } else {
      setFormData({
        name: '',
        url: '',
        description: '',
        icon: '',
        category: 'general',
        isPublic: false,
      })
      resetIconState()
    }
    setError(null)
  }, [tool, open])

  useEffect(() => {
    if (!iconFile) return
    const url = URL.createObjectURL(iconFile)
    setIconPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [iconFile])

  const uploadIcon = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('folder', TOOL_ICON_FOLDER)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload,
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

    return data.url
  }

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError(t('iconImageOnly'))
      return
    }
    setError(null)
    setIconFile(file)
  }

  const handleRemoveIcon = () => {
    setFormData((prev) => ({ ...prev, icon: '' }))
    resetIconState()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      let iconUrl = isToolIconUrl(formData.icon) ? formData.icon!.trim() : ''

      if (iconFile) {
        iconUrl = await uploadIcon(iconFile)
      }

      await onSave({
        ...formData,
        icon: iconUrl,
      })
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : getApiErrorMessage(tErrors, undefined, 'saveFailed')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const previewIcon =
    iconPreview || (isToolIconUrl(formData.icon) ? formData.icon : undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{tool ? t('editTool') : t('addNewTool')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('iconLabel')}</Label>
            <div className="flex items-start gap-4">
              <ToolIcon
                icon={previewIcon}
                name={formData.name}
                size="lg"
                className="shrink-0"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleIconChange}
                  disabled={submitting}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={submitting}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="size-4" />
                    {previewIcon ? t('changeIcon') : t('uploadIcon')}
                  </Button>
                  {(previewIcon || isToolIconUrl(formData.icon)) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={submitting}
                      onClick={handleRemoveIcon}
                    >
                      <X className="size-4" />
                      {t('removeIcon')}
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">{t('iconHint')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('nameLabel')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t('namePlaceholder')}
              required
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">{t('urlLabel')} *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder={t('urlPlaceholder')}
              required
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('descriptionLabel')}</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t('descriptionPlaceholder')}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t('categoryLabel')}</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder={t('categoryPlaceholder')}
              disabled={submitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isPublic"
              type="checkbox"
              checked={Boolean(formData.isPublic)}
              onChange={(e) =>
                setFormData({ ...formData, isPublic: e.target.checked })
              }
              className="size-4 rounded border"
              disabled={submitting}
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              {t('isPublicLabel')}
            </Label>
          </div>

          {error && (
            <p className={cn('text-destructive text-sm')} role="alert">
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
              {submitting ? t('saving') : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

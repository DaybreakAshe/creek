'use client'

import { useState, useEffect } from 'react'
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
import { ToolLink } from '@/models/tool'

interface ToolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tool?: ToolLink | null
  onSave: (tool: Partial<ToolLink>) => void
}

export function ToolDialog({
  open,
  onOpenChange,
  tool,
  onSave,
}: ToolDialogProps) {
  const [formData, setFormData] = useState<Partial<ToolLink>>({
    name: '',
    url: '',
    description: '',
    icon: '',
    category: 'general',
    isPublic: false,
  })

  useEffect(() => {
    if (tool) {
      setFormData(tool)
    } else {
      setFormData({
        name: '',
        url: '',
        description: '',
        icon: '',
        category: 'general',
        isPublic: false,
      })
    }
  }, [tool, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{tool ? '编辑工具' : '添加新工具'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="工具名称"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">网址 *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="工具描述"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">图标 (Emoji)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              placeholder="🔧"
              maxLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">分类</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="general"
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
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              公开（所有人可见）
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

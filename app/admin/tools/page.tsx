'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { AdminBackLink } from '@/components/admin/AdminBackLink'
import { ToolDialog } from '@/components/tools/ToolDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ToolLink } from '@/models/tool'

export default function AdminToolsPage() {
  const [tools, setTools] = useState<ToolLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<ToolLink | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/admin/tools')
      if (!response.ok) throw new Error('Failed to fetch tools')
      const data = await response.json()
      setTools(data)
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTools()
  }, [])

  const handleSave = async (toolData: Partial<ToolLink>) => {
    try {
      if (editingTool?._id) {
        const response = await fetch(`/api/tools/${editingTool._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toolData),
        })
        if (!response.ok) throw new Error('Failed to update tool')
      } else {
        const response = await fetch('/api/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toolData),
        })
        if (!response.ok) throw new Error('Failed to create tool')
      }
      fetchTools()
      setEditingTool(null)
    } catch (error) {
      console.error('Error saving tool:', error)
    }
  }

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setDeleting(true)
    try {
      const response = await fetch(`/api/tools/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete tool')
      fetchTools()
      setDeleteDialogOpen(false)
      setPendingDeleteId(null)
    } catch (error) {
      console.error('Error deleting tool:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (tool: ToolLink) => {
    setEditingTool(tool)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingTool(null)
    setDialogOpen(true)
  }

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <AdminBackLink />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">工具管理</h1>
          <p className="text-muted-foreground text-sm">
            共 {tools.length} 个工具
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          添加工具
        </Button>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="搜索名称、网址、分类..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredTools.length === 0 ? (
        <div className="rounded-xl border py-12 text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery ? '没有找到匹配的工具' : '还没有添加任何工具'}
          </p>
          {!searchQuery && (
            <Button onClick={handleAdd} variant="outline">
              <Plus className="size-4" />
              添加第一个工具
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="bg-muted/50 border-b text-left">
                  <th className="px-4 py-3 font-medium">名称</th>
                  <th className="px-4 py-3 font-medium">网址</th>
                  <th className="px-4 py-3 font-medium">分类</th>
                  <th className="px-4 py-3 font-medium">公开</th>
                  <th className="px-4 py-3 font-medium">User ID</th>
                  <th className="px-4 py-3 font-medium">描述</th>
                  <th className="px-4 py-3 font-medium">更新时间</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTools.map((tool) => (
                  <tr key={tool._id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {tool.icon && <span>{tool.icon}</span>}
                        <span className="font-medium">{tool.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary max-w-[200px] truncate hover:underline"
                      >
                        {tool.url}
                      </Link>
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {tool.category || 'general'}
                    </td>
                    <td className="px-4 py-3">
                      {tool.isPublic ? '是' : '否'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs break-all">
                      {tool.userId || '-'}
                    </td>
                    <td className="text-muted-foreground max-w-[180px] truncate px-4 py-3">
                      {tool.description || '-'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                      {tool.updatedAt
                        ? new Date(tool.updatedAt).toLocaleString('zh-CN')
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`编辑 ${tool.name}`}
                          onClick={() => handleEdit(tool)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`删除 ${tool.name}`}
                          onClick={() => handleDeleteRequest(tool._id!)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ToolDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tool={editingTool}
        onSave={handleSave}
      />

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setPendingDeleteId(null)
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除这个工具后无法恢复。确定要继续吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDeleteConfirm}
            >
              {deleting ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { ToolCard } from '@/components/tools/ToolCard'
import { ToolDialog } from '@/components/tools/ToolDialog'
import { ToolLink } from '@/models/tool'

export default function ToolsPage() {
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
      const response = await fetch('/api/tools')
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
      tool.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">工具集合</h1>
        <p className="text-muted-foreground">管理你的常用工具和网址</p>
      </div>

      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          添加工具
        </Button>
      </div>

      {filteredTools.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery ? '没有找到匹配的工具' : '还没有添加任何工具'}
          </p>
          {!searchQuery && (
            <Button onClick={handleAdd} variant="outline">
              <Plus className="h-4 w-4" />
              添加第一个工具
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool._id}
              tool={tool}
              onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
            />
          ))}
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
          if (!open) {
            setPendingDeleteId(null)
          }
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

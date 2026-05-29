'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Plus, Search, UserRound } from 'lucide-react'
import { canManageTool } from '@/lib/tool-auth'
import { ToolCard } from '@/components/tools/ToolCard'
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

type ToolsScope = 'public' | 'mine'

interface ToolsPageContentProps {
  scope: ToolsScope
}

export function ToolsPageContent({ scope }: ToolsPageContentProps) {
  const { data: session, status } = useSession()
  const [tools, setTools] = useState<ToolLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<ToolLink | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = session?.user?.id

  const fetchTools = async (targetUserId?: string) => {
    try {
      setError(null)
      const url =
        scope === 'mine' && targetUserId
          ? `/api/tools?userId=${encodeURIComponent(targetUserId)}`
          : '/api/tools'
      const response = await fetch(url)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || '获取工具列表失败')
      }
      const data = await response.json()
      setTools(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取工具列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (scope === 'mine') {
      if (status === 'loading') return
      if (status === 'unauthenticated') {
        window.location.href = '/login?callbackUrl=/tools/mine'
        return
      }
      if (!session?.user?.id) return
      fetchTools(session.user.id)
      return
    }
    fetchTools()
  }, [scope, status, session?.user?.id])

  const handleSave = async (toolData: Partial<ToolLink>) => {
    try {
      setError(null)
      if (editingTool?._id) {
        const response = await fetch(`/api/tools/${editingTool._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toolData),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || '更新工具失败')
        }
      } else {
        const response = await fetch('/api/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toolData),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || '创建工具失败')
        }
      }
      fetchTools(scope === 'mine' ? userId : undefined)
      setEditingTool(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
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
      setError(null)
      const response = await fetch(`/api/tools/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || '删除工具失败')
      }
      fetchTools(scope === 'mine' ? userId : undefined)
      setDeleteDialogOpen(false)
      setPendingDeleteId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (tool: ToolLink) => {
    setEditingTool(tool)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    if (status === 'unauthenticated') {
      window.location.href =
        scope === 'mine' ? '/login?callbackUrl=/tools/mine' : '/login?callbackUrl=/tools'
      return
    }
    setEditingTool(null)
    setDialogOpen(true)
  }

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading || (scope === 'mine' && status === 'loading')) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  const isMine = scope === 'mine'

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">
            {isMine ? '我的工具' : '工具集合'}
          </h1>
          <p className="text-muted-foreground">
            {isMine
              ? '管理你创建的工具，可选择是否公开'
              : '浏览所有人公开分享的工具'}
          </p>
        </div>
        {isMine ? (
          <Button variant="outline" asChild>
            <Link href="/tools">浏览公开工具</Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/tools/mine">
              <UserRound className="size-4" />
              我的工具
            </Link>
          </Button>
        )}
      </div>

      {error && (
        <p className="text-destructive mb-4 text-sm">{error}</p>
      )}

      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {isMine && (
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            添加工具
          </Button>
        )}
      </div>

      {filteredTools.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? '没有找到匹配的工具'
              : isMine
                ? '还没有添加任何工具'
                : '暂无公开工具'}
          </p>
          {isMine && !searchQuery && (
            <Button onClick={handleAdd} variant="outline">
              <Plus className="size-4" />
              添加第一个工具
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => {
            const manageable = canManageTool(tool, userId)
            return (
              <ToolCard
                key={tool._id}
                tool={tool}
                canManage={manageable}
                showVisibility={isMine}
                onEdit={manageable ? handleEdit : undefined}
                onDelete={manageable ? handleDeleteRequest : undefined}
              />
            )
          })}
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

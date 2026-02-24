'use client'

import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToolLink } from '@/models/tool'

interface ToolCardProps {
  tool: ToolLink
  onEdit: (tool: ToolLink) => void
  onDelete: (id: string) => void
}

export function ToolCard({ tool, onEdit, onDelete }: ToolCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-3xl">{tool.icon || '🔗'}</div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 truncate text-base font-semibold">
              {tool.name}
            </h3>
            {tool.description && (
              <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                {tool.description}
              </p>
            )}
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center gap-1 truncate text-xs hover:underline"
            >
              <span className="truncate">{tool.url}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onEdit(tool)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
              onClick={() => tool._id && onDelete(tool._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

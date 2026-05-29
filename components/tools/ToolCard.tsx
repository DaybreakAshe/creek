'use client'

import { ExternalLink, Globe, Lock, Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToolLink } from '@/models/tool'

interface ToolCardProps {
  tool: ToolLink
  canManage?: boolean
  showVisibility?: boolean
  onEdit?: (tool: ToolLink) => void
  onDelete?: (id: string) => void
}

export function ToolCard({
  tool,
  canManage = false,
  showVisibility = false,
  onEdit,
  onDelete,
}: ToolCardProps) {
  const t = useTranslations('tools')

  return (
    <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 text-3xl">{tool.icon || '🔗'}</div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate text-base font-semibold">{tool.name}</h3>
              {showVisibility &&
                (tool.isPublic ? (
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <Globe className="size-3" />
                    {t('public')}
                  </span>
                ) : (
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <Lock className="size-3" />
                    {t('private')}
                  </span>
                ))}
            </div>
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
              <ExternalLink className="size-3 shrink-0" />
            </a>
          </div>
          {canManage && onEdit && onDelete && (
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() => onEdit(tool)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-destructive/10 hover:text-destructive size-8"
                onClick={() => tool._id && onDelete(tool._id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

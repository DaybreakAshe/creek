'use client'

import { ArrowUpRight, Globe, Lock, Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ToolIcon } from '@/components/tools/ToolIcon'
import { ToolLink } from '@/models/tool'
import { cn } from '@/lib/utils'

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
    <article
      className={cn(
        'group border-border/60 bg-card relative flex flex-col overflow-hidden rounded-2xl border',
        'transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20'
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <ToolIcon icon={tool.icon} name={tool.name} size="md" />
          {canManage && onEdit && onDelete && (
            <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground size-8"
                aria-label={t('editAction')}
                onClick={() => onEdit(tool)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8"
                aria-label={t('deleteAction')}
                onClick={() => tool._id && onDelete(tool._id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        <div className="mb-1 flex flex-wrap items-center gap-2">
          {tool.category && tool.category !== 'general' && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
              {tool.category}
            </span>
          )}
          {showVisibility &&
            (tool.isPublic ? (
              <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
                <Globe className="size-3" />
                {t('public')}
              </span>
            ) : (
              <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
                <Lock className="size-3" />
                {t('private')}
              </span>
            ))}
        </div>

        <h3 className="mb-1.5 line-clamp-1 text-base font-semibold tracking-tight">
          {tool.name}
        </h3>

        {tool.description ? (
          <p className="text-muted-foreground mb-4 line-clamp-2 flex-1 text-sm leading-relaxed">
            {tool.description}
          </p>
        ) : (
          <div className="mb-4 flex-1" />
        )}

        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border/80 text-muted-foreground hover:text-foreground mt-auto inline-flex w-fit items-center gap-1 border-t pt-3 text-xs transition-colors"
        >
          <span className="max-w-[200px] truncate">{t('visitTool')}</span>
          <ArrowUpRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </article>
  )
}

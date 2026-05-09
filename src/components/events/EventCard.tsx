import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Pencil, Trash2 } from 'lucide-react'
import type { CalendarEvent } from '@/types/events'

interface EventCardProps {
  event: CalendarEvent
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
}

const TYPE_LABELS: Record<string, string> = {
  'historical-event': '历史事件',
  'recurring-holiday': '周期性节日',
  'astronomical-trigger': '天文触发',
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeleteClick = () => setShowConfirm(true)
  const handleCancelDelete = () => setShowConfirm(false)
  const handleConfirmDelete = () => {
    onDelete(event.id)
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] bg-[var(--error)]/5 border border-[var(--error)]/20">
        <span className="text-sm text-[var(--error)]">
          确定删除「{event.title}」？
        </span>
        <div className="flex gap-1.5 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleCancelDelete}>
            取消
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
            确认删除
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)]',
        'bg-[var(--bg-secondary)] border border-[var(--border-light)]',
        'group hover:border-[var(--accent-300)] transition-colors',
      )}
    >
      {/* 颜色条 */}
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: event.display.color || 'var(--accent-500)' }}
      />

      {/* 标题 + 类型 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text-primary)] truncate">{event.title}</p>
        <p className="text-[11px] text-[var(--text-tertiary)]">
          {TYPE_LABELS[event.type] || event.type}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={() => onEdit(event)}
          className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="编辑事件"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className="p-1 rounded hover:bg-red-50 text-[var(--text-tertiary)] hover:text-[var(--error)] transition-colors"
          aria-label="删除事件"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export type { EventCardProps }

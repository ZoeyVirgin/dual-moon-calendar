import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { EventCard } from './EventCard'
import { EventModal } from './EventModal'
import { useEventStore } from '@/store/useEventStore'
import { Plus } from 'lucide-react'
import type { CalendarEvent } from '@/types/events'

interface EventListProps {
  abs: number
  events: CalendarEvent[]
  className?: string
}

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; event: CalendarEvent }

export function EventList({ abs, events, className }: EventListProps) {
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const addEvent = useEventStore((s) => s.addEvent)
  const updateEvent = useEventStore((s) => s.updateEvent)
  const deleteEvent = useEventStore((s) => s.deleteEvent)

  const handleCreate = () => setModal({ mode: 'create' })
  const handleEdit = (event: CalendarEvent) => setModal({ mode: 'edit', event })
  const handleClose = () => setModal({ mode: 'closed' })

  const handleSubmit = (
    data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    if (modal.mode === 'create') {
      addEvent(data)
    } else if (modal.mode === 'edit') {
      updateEvent(modal.event.id, data as Partial<CalendarEvent>)
    }
    handleClose()
  }

  const handleDelete = (id: string) => {
    deleteEvent(id)
  }

  return (
    <div className={cn(className)}>
      {/* 创建按钮 */}
      <Button
        variant="secondary"
        size="sm"
        icon={<Plus className="h-4 w-4" />}
        onClick={handleCreate}
        className="mb-2"
      >
        创建新事件
      </Button>

      {/* 事件列表 */}
      {events.length === 0 ? (
        <p className="text-xs text-[var(--text-tertiary)]">暂无事件，点击上方按钮创建</p>
      ) : (
        <ul className="space-y-2">
          {events.map((evt) => (
            <li key={evt.id}>
              <EventCard event={evt} onEdit={handleEdit} onDelete={handleDelete} />
            </li>
          ))}
        </ul>
      )}

      {/* EventModal */}
      {modal.mode !== 'closed' && (
        <EventModal
          mode={modal.mode === 'edit' ? 'edit' : 'create'}
          initialData={modal.mode === 'edit' ? modal.event : undefined}
          anchorAbs={abs}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      )}
    </div>
  )
}

export type { EventListProps }

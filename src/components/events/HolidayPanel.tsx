import { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { useEventStore } from '@/store/useEventStore'
import { useAuthor } from '@/hooks/useAuthor'
import { EventCard } from './EventCard'
import { EventModal } from './EventModal'
import { ChevronDown } from 'lucide-react'
import type { CalendarEvent } from '@/types/events'

const STORAGE_KEY = 'dual-moon-calendar-holiday-panel-open'

function loadOpen(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) !== 'false' } catch { return false }
}
function saveOpen(open: boolean) {
  try { localStorage.setItem(STORAGE_KEY, String(open)) } catch { /* noop */ }
}

export function HolidayPanel() {
  const events = useEventStore((s) => s.events)
  const [open, setOpen] = useState(loadOpen)
  const isAuthor = useAuthor()

  const updateEvent = useEventStore((s) => s.updateEvent)
  const deleteEvent = useEventStore((s) => s.deleteEvent)

  const [modal, setModal] = useState<{ mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; event: CalendarEvent }>({ mode: 'closed' })

  useEffect(() => { saveOpen(open) }, [open])

  const holidays = events
    .filter((e) => e.type === 'recurring-holiday' && e.display.isVisible)
    .sort((a, b) => {
      const recA = (a as unknown as { recurrence?: { anchorMonth: number; anchorDay: number } }).recurrence
      const recB = (b as unknown as { recurrence?: { anchorMonth: number; anchorDay: number } }).recurrence
      return (recA ? recA.anchorMonth * 100 + recA.anchorDay : 0) -
             (recB ? recB.anchorMonth * 100 + recB.anchorDay : 0)
    })

  if (holidays.length === 0) return null

  const handleDelete = (id: string) => { deleteEvent(id) }
  const handleEdit = (event: CalendarEvent) => { setModal({ mode: 'edit', event }) }
  const handleClose = () => setModal({ mode: 'closed' })

  const handleSubmit = (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (modal.mode === 'edit') {
      updateEvent(modal.event.id, data as Partial<CalendarEvent>)
    }
    handleClose()
  }

  return (
    <div className="mt-4 border border-[var(--border-light)] rounded-[var(--radius-lg)] bg-[var(--bg-primary)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors rounded-[var(--radius-lg)]"
      >
        <span className="text-base">🎉</span>
        <span>节日管理 · {holidays.length}个节日</span>
        <ChevronDown className={cn('h-4 w-4 ml-auto text-[var(--text-tertiary)] transition-transform duration-[var(--duration-normal)]', open && 'rotate-180')} />
      </button>

      <div
        className={cn('overflow-hidden transition-all duration-[var(--duration-slow)]', open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0')}
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      >
        <div className="px-4 pb-3 space-y-2">
          {holidays.map((evt) => (
            <EventCard key={evt.id} event={evt} isAuthor={isAuthor} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {modal.mode !== 'closed' && (
        <EventModal
          mode="edit"
          initialData={modal.mode === 'edit' ? modal.event : undefined}
          anchorAbs={0}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      )}
    </div>
  )
}

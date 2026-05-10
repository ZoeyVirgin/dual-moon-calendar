import { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { getCalendarDate } from '@/engine/calendar'
import { useEventStore } from '@/store/useEventStore'
import { useCalendarStore } from '@/store/useCalendarStore'
import { ChevronDown } from 'lucide-react'

interface TimelineProps {
  className?: string
}

const STORAGE_KEY = 'dual-moon-calendar-timeline-open'

function loadOpen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false'
  } catch {
    return false
  }
}

function saveOpen(open: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(open))
  } catch { /* noop */ }
}

export function Timeline({ className }: TimelineProps) {
  const events = useEventStore((s) => s.events)
  const goToYearMonth = useCalendarStore((s) => s.goToYearMonth)
  const selectDate = useCalendarStore((s) => s.selectDate)
  const [open, setOpen] = useState(loadOpen)

  useEffect(() => { saveOpen(open) }, [open])

  const visible = events
    .filter((e) => e.display.isVisible)
    .sort((a, b) => a.dateAnchor.abs - b.dateAnchor.abs)

  if (visible.length === 0) return null

  return (
    <div className={cn('mt-4 border border-[var(--border-light)] rounded-[var(--radius-lg)] bg-[var(--bg-primary)]', className)}>
      {/* 标题栏 */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors rounded-[var(--radius-lg)]"
      >
        <span className="text-base">📅</span>
        <span>时间线 · {visible.length}个事件</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 ml-auto text-[var(--text-tertiary)] transition-transform duration-[var(--duration-normal)]',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* 事件列表 */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-[var(--duration-slow)]',
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
        )}
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      >
        <div className="px-4 pb-4">
          <div className="border-l-2 border-[var(--accent-200)] ml-2.5 pl-6 space-y-4 pt-2">
            {visible.map((evt) => {
              const date = getCalendarDate(evt.dateAnchor.abs)
              const solar = date.solar
              const desc = evt.description || ''
              const shortDesc = desc.length > 50 ? desc.slice(0, 50) + '...' : desc

              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => {
                    goToYearMonth(solar.year, solar.month)
                    selectDate(evt.dateAnchor.abs)
                  }}
                  className="relative block w-full text-left group"
                >
                  {/* 竖线圆点 */}
                  <span
                    className="absolute -left-[calc(1.5rem+2px)] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-primary)]"
                    style={{ backgroundColor: evt.display.color || 'var(--accent-500)' }}
                  />

                  {/* 卡片 */}
                  <span className="block rounded-[var(--radius-md)] border border-[var(--border-light)] p-2.5 hover:border-[var(--accent-300)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer">
                    <span className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-1">
                      <span className="tabular-nums">
                        {solar.year}年{solar.month}月{solar.day}日
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)]">
                        {evt.type === 'historical-event' ? '历史事件' :
                         evt.type === 'recurring-holiday' ? '周期性节日' : '天文触发'}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-600)] transition-colors">
                      {evt.title}
                    </span>
                    {desc && (
                      <span className="block text-xs text-[var(--text-tertiary)] mt-0.5 leading-relaxed">
                        {shortDesc}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

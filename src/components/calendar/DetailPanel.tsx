import { useMemo } from 'react'
import { cn } from '@/utils/cn'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useEventStore } from '@/store/useEventStore'
import { getCalendarDate } from '@/engine/calendar'
import { EventList } from '@/components/events/EventList'

interface DetailPanelProps {
  className?: string
}

// ============================================
// 月相 → 中文标签映射
// ============================================
const MOON_PHASE_LABELS: Record<string, string> = {
  'new-moon': '朔',
  'waxing-crescent': '盈月',
  'first-quarter': '上弦',
  'waxing-gibbous': '盈凸',
  'full-moon': '望',
  'waning-gibbous': '亏凸',
  'last-quarter': '下弦',
  'waning-crescent': '残月',
}

const TIDE_LABELS: Record<string, string> = {
  spring: '大潮',
  neap: '中潮',
  normal: '小潮',
}

const LEVEL_STYLES: Record<string, string> = {
  S: 'bg-[var(--event-S)] text-white',
  A: 'bg-[var(--event-A)] text-white',
  B: 'bg-[var(--event-B)] text-white',
  C: 'bg-[var(--event-C)] text-white',
}

// ============================================
// DetailPanel 组件
// ============================================

export function DetailPanel({ className }: DetailPanelProps) {
  const selectedAbs = useCalendarStore((s) => s.selectedAbs)
  const isOpen = useCalendarStore((s) => s.isDetailPanelOpen)
  const getEventsByAbs = useEventStore((s) => s.getEventsByAbs)
  const eventsRaw = useEventStore((s) => s.events)

  const date = useMemo(() => {
    if (selectedAbs === null) return null
    return getCalendarDate(selectedAbs)
  }, [selectedAbs])

  const events = useMemo(() => {
    if (selectedAbs === null) return []
    return getEventsByAbs(selectedAbs)
  }, [selectedAbs, eventsRaw, getEventsByAbs])

  // 空状态：无选中日期
  if (!date) {
    return (
      <div
        className={cn(
          'mt-4 px-4 py-6 border border-dashed border-[var(--border-light)] rounded-[var(--radius-lg)]',
          'flex items-center justify-center text-[var(--text-tertiary)] text-sm',
          className,
        )}
      >
        点击上方日期格查看详情
      </div>
    )
  }

  const { solar, lunarPrimary, week, ganZhi, astronomicalEvents, tide } = date
  const phaseLabel = MOON_PHASE_LABELS[lunarPrimary.phase] || lunarPrimary.phase

  return (
    <div
      className={cn(
        'mt-0 transition-all duration-[var(--duration-slow)]',
        'border border-[var(--border-light)] rounded-[var(--radius-lg)] bg-[var(--bg-primary)] shadow-sm',
        isOpen
          ? 'max-h-[800px] opacity-100'
          : 'max-h-0 opacity-0 border-transparent overflow-hidden',
        className,
      )}
      style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      role="region"
      aria-label="日期详情面板"
      aria-live="polite"
    >
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* A区：日期摘要 */}
        <section aria-label="日期摘要">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums whitespace-nowrap">
              {solar.year}年{solar.month}月{solar.day}日
              {solar.isLeapYear && (
                <span className="ml-1 text-xs font-normal text-[var(--accent-500)]">闰</span>
              )}
            </span>
            <span className="text-[var(--text-secondary)] whitespace-nowrap">
              主月历：{lunarPrimary.monthName}第{lunarPrimary.day}天
              <span className="ml-1 text-xs text-[var(--accent-500)]">（{phaseLabel}）</span>
            </span>
            <span className="text-[var(--text-secondary)] whitespace-nowrap">
              星期：{week.dayName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm">
            <span className="text-[var(--text-secondary)]">
              干支：{ganZhi.combination}
              <span className="ml-1 text-xs text-[var(--text-tertiary)]">
                （第{ganZhi.cycleDay}/60循环）
              </span>
            </span>
            <span className={cn(
              'text-sm',
              tide === 'spring' && 'text-[var(--event-S)] font-medium',
              tide === 'neap' && 'text-[var(--event-B)]',
              tide === 'normal' && 'text-[var(--text-tertiary)]',
            )}>
              潮汐：{TIDE_LABELS[tide]}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              ABS={date.abs}
            </span>
          </div>
        </section>

        {/* 分隔线 */}
        <div className="border-t border-[var(--border-light)]" />

        {/* B区：天象列表 */}
        <section aria-label="今日天象">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
            今日天象
          </h3>
          {astronomicalEvents.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)]">无特殊天象</p>
          ) : (
            <ul className="space-y-1.5">
              {astronomicalEvents.map((event) => (
                <li key={event.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none',
                      LEVEL_STYLES[event.level],
                    )}
                  >
                    {event.level}
                  </span>
                  <span className="text-[var(--text-primary)]">{event.name}</span>
                  {event.description && (
                    <span className="text-xs text-[var(--text-tertiary)] hidden sm:inline">
                      — {event.description}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 分隔线 */}
        <div className="border-t border-[var(--border-light)]" />

        {/* C区：当日事件（含创建按钮） */}
        <section aria-label="当日事件">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
            当日事件
          </h3>
          <EventList abs={date.abs} events={events} />
        </section>
      </div>
    </div>
  )
}

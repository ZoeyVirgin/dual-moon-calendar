import { useCallback } from 'react'
import { cn } from '@/utils/cn'
import type { CalendarDate, AstronomicalEvent, ViewMode } from '@/types/calendar'
import type { CalendarEvent } from '@/types/events'
import { MoonPhase } from '@/types/calendar'

type CellVariant = 'current' | 'previous' | 'next'

interface GridCellProps {
  date: CalendarDate
  events: CalendarEvent[]
  isSelected: boolean
  variant?: CellVariant
  viewMode?: ViewMode
  onSelect: (abs: number) => void
  onHover: (abs: number | null) => void
  className?: string
}

// 月相 → 简写图标
const MOON_PHASE_ICONS: Record<string, string> = {
  [MoonPhase.NEW_MOON]: '🌑',
  [MoonPhase.WAXING_CRESCENT]: '🌒',
  [MoonPhase.FIRST_QUARTER]: '🌓',
  [MoonPhase.WAXING_GIBBOUS]: '🌔',
  [MoonPhase.FULL_MOON]: '🌕',
  [MoonPhase.WANING_GIBBOUS]: '🌖',
  [MoonPhase.LAST_QUARTER]: '🌗',
  [MoonPhase.WANING_CRESCENT]: '🌘',
}

// ============================================
// S/A级天象圆点（右上角）
// ============================================

function TopBadge({ events }: { events: AstronomicalEvent[] }) {
  const top = events.find((e) => e.level === 'S') || events.find((e) => e.level === 'A')
  if (!top) return null

  return (
    <span
      className={cn(
        'absolute top-1 right-1 w-2 h-2 rounded-full',
        top.level === 'S' && 'bg-[var(--event-S)] animate-pulse',
        top.level === 'A' && 'bg-[var(--event-A)]',
      )}
      title={top.name}
      aria-label={top.name}
    />
  )
}

// ============================================
// 潮汐标签常量
// ============================================

const TIDE_LABELS: Record<string, string> = {
  spring: '大潮',
  neap: '中潮',
}

// ============================================
// GridCell 主组件
// ============================================

export function GridCell({
  date,
  events,
  isSelected,
  variant = 'current',
  viewMode = 'solar',
  onSelect,
  onHover,
  className,
}: GridCellProps) {
  const isCurrentMonth = variant === 'current'
  const { solar, lunarPrimary, lunarSecondary, tide, astronomicalEvents } = date
  const phaseSource = viewMode === 'lunar-secondary' ? lunarSecondary.phase : lunarPrimary.phase
  const phaseIcon = MOON_PHASE_ICONS[phaseSource] || ''

  const handleClick = useCallback(() => {
    onSelect(date.abs)
  }, [date.abs, onSelect])

  const handleMouseEnter = useCallback(() => {
    onHover(date.abs)
  }, [date.abs, onHover])

  const handleMouseLeave = useCallback(() => {
    onHover(null)
  }, [onHover])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect(date.abs)
      }
    },
    [date.abs, onSelect],
  )

  return (
    <button
      type="button"
      role="gridcell"
      tabIndex={isCurrentMonth ? 0 : -1}
      aria-label={`${solar.year}年${solar.month}月${solar.day}日`}
      aria-selected={isSelected}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex flex-col items-center min-h-[60px] sm:min-h-[80px] p-1 sm:p-1.5',
        'border border-[var(--border-light)]',
        'transition-all duration-[var(--duration-fast)] ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] focus-visible:ring-offset-1 focus-visible:z-10',
        'cursor-pointer select-none',
        !isCurrentMonth && 'opacity-40 bg-[var(--bg-secondary)] text-[var(--text-tertiary)]',
        isCurrentMonth && 'text-[var(--text-primary)] hover:bg-[var(--accent-50)] hover:border-[var(--accent-300)]',
        isSelected && 'bg-[var(--accent-100)] border-[var(--accent-500)] ring-2 ring-[var(--accent-200)] z-[5]',
        className,
      )}
    >
      {/* 主月历模式 */}
      {viewMode === 'lunar-primary' && (
        <span className="text-[10px] sm:text-[11px] leading-tight text-[var(--accent-600)] truncate text-center max-w-full px-0.5">
          {phaseIcon} {lunarPrimary.monthName}·{lunarPrimary.day}
        </span>
      )}

      {/* 副月历模式 */}
      {viewMode === 'lunar-secondary' && (
        <span className="text-[10px] sm:text-[11px] leading-tight text-[var(--event-A)] truncate text-center max-w-full px-0.5">
          {phaseIcon} 副{lunarSecondary.month}·{lunarSecondary.day}
        </span>
      )}

      {/* 日期数字 */}
      <span
        className={cn(
          'text-sm sm:text-base tabular-nums leading-none mt-2',
          isCurrentMonth && !isSelected && 'font-normal',
          isSelected && 'font-semibold text-[var(--accent-700)]',
          !isCurrentMonth && 'font-light',
        )}
      >
        {solar.day}
      </span>

      {/* S/A 级圆点 */}
      <TopBadge events={astronomicalEvents} />

      {/* 底部行：B级天象 + 潮汐 + 事件彩条 */}
      <div className="absolute bottom-0 left-1 right-1 flex flex-col items-center gap-px pb-1">
        {/* B级天象 */}
        {astronomicalEvents.filter((e) => e.level === 'B').length > 0 && (
          <span className="text-[9px] leading-tight text-[var(--event-B)] truncate text-center w-full">
            {astronomicalEvents.filter((e) => e.level === 'B').map((e) => e.name).join(' ')}
          </span>
        )}
        {/* 潮汐 */}
        {tide !== 'normal' && TIDE_LABELS[tide] && (
          <span className={cn(
            'text-[9px] leading-tight',
            tide === 'spring' ? 'text-[var(--event-S)]' : 'text-[var(--event-B)]',
          )}>
            {TIDE_LABELS[tide]}
          </span>
        )}
        {/* 事件彩条 */}
        {events.filter((e) => e.display.isVisible).length > 0 && (
          <div className="flex gap-0.5 w-full pt-0.5">
            {events.filter((e) => e.display.isVisible).slice(0, 3).map((evt) => (
              <div
                key={evt.id}
                className="h-0.5 flex-1 rounded-full"
                style={{ backgroundColor: evt.display.color }}
                title={evt.title}
              />
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

export type { GridCellProps, CellVariant }

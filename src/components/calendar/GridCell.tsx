import { useCallback } from 'react'
import { cn } from '@/utils/cn'
import type { CalendarDate, AstronomicalEvent, TideLevel, ViewMode } from '@/types/calendar'
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
// 天象标记子组件
// ============================================

function AstronomicalMarkers({ events }: { events: AstronomicalEvent[] }) {
  const sEvent = events.find((e) => e.level === 'S')
  const aEvent = events.find((e) => e.level === 'A')
  const bEvents = events.filter((e) => e.level === 'B')
  const topBadge = sEvent || aEvent

  return (
    <>
      {/* S级: 右上角红色脉动圆点 */}
      {topBadge && (
        <span
          className={cn(
            'absolute top-1 right-1 w-2 h-2 rounded-full',
            topBadge.level === 'S' && 'bg-[var(--event-S)] animate-pulse',
            topBadge.level === 'A' && 'bg-[var(--event-A)]',
          )}
          title={topBadge.name}
          aria-label={topBadge.name}
        />
      )}

      {/* B级: 底部居中文字标签 */}
      {bEvents.length > 0 && (
        <div className="mt-auto text-[10px] leading-tight text-[var(--event-B)] truncate px-0.5 text-center">
          {bEvents.map((e) => e.name).join(' ')}
        </div>
      )}
    </>
  )
}

// ============================================
// 事件标记子组件
// ============================================

function EventMarkers({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) return null

  const visibleEvents = events.filter((e) => e.display.isVisible)
  if (visibleEvents.length === 0) return null

  return (
    <div className="absolute bottom-1 left-2 right-2 flex gap-0.5">
      {visibleEvents.slice(0, 3).map((evt) => (
        <div
          key={evt.id}
          className="h-0.5 flex-1 rounded-full"
          style={{ backgroundColor: evt.display.color }}
          title={evt.title}
        />
      ))}
    </div>
  )
}

// ============================================
// 潮汐指示器
// ============================================

function TideIndicator({ tide }: { tide: TideLevel }) {
  if (tide === 'normal') return null

  const config: Record<string, { label: string; color: string }> = {
    spring: { label: '大潮', color: 'var(--event-S)' },
    neap: { label: '中潮', color: 'var(--event-B)' },
  }

  const info = config[tide]
  if (!info) return null

  return (
    <span
      className="absolute bottom-0.5 left-1 text-[9px] leading-none opacity-50"
      style={{ color: info.color }}
      title={info.label}
    >
      {info.label}
    </span>
  )
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
          'text-sm sm:text-base tabular-nums',
          isCurrentMonth && !isSelected && 'font-normal',
          isSelected && 'font-semibold text-[var(--accent-700)]',
          !isCurrentMonth && 'font-light',
        )}
      >
        {solar.day}
      </span>

      {/* 天象标记 */}
      <AstronomicalMarkers events={astronomicalEvents} />

      {/* 事件彩色条 */}
      <EventMarkers events={events} />

      {/* 潮汐指示 */}
      <TideIndicator tide={tide} />
    </button>
  )
}

export type { GridCellProps, CellVariant }

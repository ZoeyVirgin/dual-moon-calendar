import { useMemo } from 'react'
import { cn } from '@/utils/cn'
import { WeekdayHeader } from './WeekdayHeader'
import { GridCell, type CellVariant } from './GridCell'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useEventStore } from '@/store/useEventStore'
import { getCalendarDate, getYearStartAbs, getDaysInMonth, isLeapYear, getMaxAbsoluteDay } from '@/engine'
import type { CalendarDate } from '@/types/calendar'

interface CalendarGridProps {
  year?: number
  month?: number
  onDateSelect?: (abs: number) => void
  onDateHover?: (abs: number | null) => void
  className?: string
}

/** 扩展类型：带内部variant标记的CalendarDate */
interface GridDate {
  date: CalendarDate
  variant: CellVariant
}

const TOTAL_CELLS = 35 // 5列 × 7行 = 标准网格

/**
 * 生成指定年月在日历网格中应显示的所有日期数据
 *
 * 包含：
 * 1. 前置填充（上月末尾几天，灰色显示）
 * 2. 当月所有日期
 * 3. 后置填充（下月开头几天，灰色显示）
 */
function generateMonthDates(year: number, month: number): GridDate[] {
  const results: GridDate[] = []

  // 计算目标月份第1天的 ABS
  const startOfYear = getYearStartAbs(year)
  let daysBeforeTarget = 0
  for (let m = 1; m < month; m++) {
    daysBeforeTarget += getDaysInMonth(m, isLeapYear(year))
  }
  const monthFirstAbs = startOfYear + daysBeforeTarget

  // 该月1日是星期几（1-5）
  const firstDate = getCalendarDate(monthFirstAbs)
  const firstDayOfWeek = firstDate.week.dayOfWeek

  // 前置填充：显示上月末的日期
  const prevFill = firstDayOfWeek - 1 // 0-4 天
  for (let i = prevFill; i >= 1; i--) {
    const abs = monthFirstAbs - i
    results.push({
      date: getCalendarDate(abs),
      variant: 'previous',
    })
  }

  // 当月所有日期
  const daysInMonth = getDaysInMonth(month, isLeapYear(year))
  for (let d = 1; d <= daysInMonth; d++) {
    const abs = monthFirstAbs + (d - 1)
    results.push({
      date: getCalendarDate(abs),
      variant: 'current',
    })
  }

  // 后置填充：补齐到 TOTAL_CELLS（不超出有效 ABS 范围）
  const maxAbs = getMaxAbsoluteDay()
  const remaining = TOTAL_CELLS - results.length
  for (let i = 1; i <= remaining; i++) {
    const nextAbs = monthFirstAbs + daysInMonth + (i - 1)
    if (nextAbs > maxAbs) break
    results.push({
      date: getCalendarDate(nextAbs),
      variant: 'next',
    })
  }

  return results
}

export function CalendarGrid({
  year: propYear,
  month: propMonth,
  onDateSelect,
  onDateHover,
  className,
}: CalendarGridProps) {
  const storeYear = useCalendarStore((s) => s.currentYear)
  const storeMonth = useCalendarStore((s) => s.currentMonth)
  const selectedAbs = useCalendarStore((s) => s.selectedAbs)
  const selectDate = useCalendarStore((s) => s.selectDate)
  const viewMode = useCalendarStore((s) => s.viewMode)
  const getEventsByAbs = useEventStore((s) => s.getEventsByAbs)

  const year = propYear ?? storeYear
  const month = propMonth ?? storeMonth

  const dates = useMemo(() => generateMonthDates(year, month), [year, month])

  const handleSelect = (abs: number) => {
    selectDate(abs)
    onDateSelect?.(abs)
  }

  const handleHover = (abs: number | null) => {
    onDateHover?.(abs)
  }

  return (
    <div
      className={cn('w-full select-none', className)}
      role="grid"
      aria-label={`${year}年${month}月 阳历`}
    >
      <WeekdayHeader />

      <div className="grid grid-cols-5">
        {dates.map(({ date, variant }) => {
          const isSelected = selectedAbs === date.abs
          const events = getEventsByAbs(date.abs)

          return (
            <GridCell
              key={date.abs}
              date={date}
              events={events}
              isSelected={isSelected}
              variant={variant}
              viewMode={viewMode}
              onSelect={handleSelect}
              onHover={handleHover}
            />
          )
        })}
      </div>
    </div>
  )
}

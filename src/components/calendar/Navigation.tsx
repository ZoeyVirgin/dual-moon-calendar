import { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useCalendarStore } from '@/store/useCalendarStore'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const currentYear = useCalendarStore((s) => s.currentYear)
  const currentMonth = useCalendarStore((s) => s.currentMonth)
  const navigateMonth = useCalendarStore((s) => s.navigateMonth)
  const goToYearMonth = useCalendarStore((s) => s.goToYearMonth)

  // 年份快速跳转
  const handlePrevYear = () => {
    if (currentYear > 0) goToYearMonth(currentYear - 1, currentMonth)
  }
  const handleNextYear = () => {
    if (currentYear < 1200) goToYearMonth(currentYear + 1, currentMonth)
  }

  const isAtMonthStart = currentYear === 0 && currentMonth === 1
  const isAtMonthEnd = currentYear === 1200 && currentMonth === 12
  const isAtYearStart = currentYear === 0
  const isAtYearEnd = currentYear === 1200

  // 标题点击 → 内联日期选择器
  const [editing, setEditing] = useState(false)
  const [editYear, setEditYear] = useState(String(currentYear))
  const [editMonth, setEditMonth] = useState(String(currentMonth))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setEditYear(String(currentYear))
      setEditMonth(String(currentMonth))
      inputRef.current?.focus()
    }
  }, [editing, currentYear, currentMonth])

  const handleJump = () => {
    const y = Math.max(0, Math.min(1200, parseInt(editYear, 10) || 0))
    const m = Math.max(1, Math.min(12, parseInt(editMonth, 10) || 1))
    goToYearMonth(y, m)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJump()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className={cn('flex items-center justify-center gap-0.5', className)}>
      {/* 上一年 */}
      <Button
        variant="ghost"
        size="sm"
        icon={<ChevronsLeft className="h-4 w-4" />}
        onClick={handlePrevYear}
        disabled={isAtYearStart}
        aria-label="上一年"
        aria-disabled={isAtYearStart}
      />

      {/* 上一月 */}
      <Button
        variant="ghost"
        size="sm"
        icon={<ChevronLeft className="h-4 w-4" />}
        onClick={() => navigateMonth('prev')}
        disabled={isAtMonthStart}
        aria-label="上一月"
        aria-disabled={isAtMonthStart}
      />

      {/* 年月标题（可点击跳转）*/}
      {editing ? (
        <div className="flex items-center gap-1.5 px-2" onKeyDown={handleKeyDown}>
          <Input
            ref={inputRef}
            value={editYear}
            onChange={setEditYear}
            type="number"
            size="sm"
            className="w-16 text-center"
            aria-label="年份"
          />
          <span className="text-sm text-[var(--text-secondary)]">年</span>
          <select
            value={editMonth}
            onChange={(e) => setEditMonth(e.target.value)}
            className="h-8 w-14 rounded-[var(--radius-sm)] border border-[var(--border-light)] text-xs text-center bg-white focus:outline-none focus:border-[var(--accent-500)]"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}月</option>
            ))}
          </select>
          <Button variant="primary" size="sm" onClick={handleJump}>
            跳转
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={cn(
            'text-lg font-semibold text-[var(--text-primary)] min-w-[140px] text-center tabular-nums',
            'hover:text-[var(--accent-500)] hover:bg-[var(--accent-50)] rounded-[var(--radius-md)] px-2 py-1',
            'transition-colors cursor-pointer select-none',
          )}
          title="点击输入年份和月份进行跳转"
        >
          {currentYear}年{String(currentMonth).padStart(2, '0')}月
        </button>
      )}

      {/* 下一月 */}
      <Button
        variant="ghost"
        size="sm"
        icon={<ChevronRight className="h-4 w-4" />}
        onClick={() => navigateMonth('next')}
        disabled={isAtMonthEnd}
        aria-label="下一月"
        aria-disabled={isAtMonthEnd}
      />

      {/* 下一年 */}
      <Button
        variant="ghost"
        size="sm"
        icon={<ChevronsRight className="h-4 w-4" />}
        onClick={handleNextYear}
        disabled={isAtYearEnd}
        aria-label="下一年"
        aria-disabled={isAtYearEnd}
      />
    </div>
  )
}

export type { NavigationProps }

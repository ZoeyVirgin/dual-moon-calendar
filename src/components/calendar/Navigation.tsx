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
    goToYearMonth(currentYear + 1, currentMonth)
  }

  const isAtMonthStart = currentYear === 0 && currentMonth === 1
  const isAtYearStart = currentYear === 0

  // 标题点击 → 内联日期选择器
  const [editing, setEditing] = useState(false)
  const [hint, setHint] = useState('')
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
    const rawYear = parseInt(editYear, 10) || 0
    const rawMonth = parseInt(editMonth, 10) || 1
    const y = Math.max(0, Math.min(5000, rawYear))
    const m = Math.max(1, Math.min(12, rawMonth))
    goToYearMonth(y, m)
    if (rawYear > 5000 || rawYear < 0) {
      setHint('年份限制 0-5000，已自动调整')
      setTimeout(() => setHint(''), 2500)
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJump()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className={cn('relative flex items-center justify-center gap-0.5', className)}>
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
        <div className="flex flex-col gap-2 px-2" onKeyDown={handleKeyDown}>
          {/* 年份行 */}
          <div className="flex items-center gap-1.5">
            <Input
              ref={inputRef}
              value={editYear}
              onChange={setEditYear}
              type="number"
              size="sm"
              className="w-20 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="年份"
            />
            <span className="text-sm text-[var(--text-secondary)]">年</span>
            <Button variant="primary" size="sm" onClick={handleJump}>
              跳转
            </Button>
          </div>

          {/* 月份按钮组 */}
          <div className={cn('grid grid-cols-3 gap-1 w-44')}>
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1
              const selected = Number(editMonth) === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setEditMonth(String(m))}
                  className={cn(
                    'h-7 text-xs rounded-[var(--radius-sm)] border transition-colors',
                    selected
                      ? 'bg-[var(--accent-500)] text-white border-[var(--accent-500)]'
                      : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-light)] hover:bg-[var(--accent-50)]',
                  )}
                >
                  {m}月
                </button>
              )
            })}
          </div>
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

      {/* 越界提示 */}
      {hint && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-[var(--event-B)] whitespace-nowrap animate-fade-in">
          {hint}
        </span>
      )}

      {/* 下一月 */}
      <Button
        variant="ghost"
        size="sm"
        icon={<ChevronRight className="h-4 w-4" />}
        onClick={() => navigateMonth('next')}
        aria-label="下一月"
      />

      {/* 下一年 */}
      <Button
        variant="ghost"
        size="sm"
        icon={<ChevronsRight className="h-4 w-4" />}
        onClick={handleNextYear}
        aria-label="下一年"
      />
    </div>
  )
}

export type { NavigationProps }

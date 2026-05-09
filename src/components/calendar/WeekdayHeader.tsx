import { WEEKDAY_NAMES } from '@/engine/constants'
import { cn } from '@/utils/cn'

interface WeekdayHeaderProps {
  className?: string
}

export function WeekdayHeader({ className }: WeekdayHeaderProps) {
  const names = Object.values(WEEKDAY_NAMES) as string[]

  return (
    <div
      className={cn(
        'grid grid-cols-5 border-b border-[var(--border-light)] bg-[var(--bg-secondary)]',
        className,
      )}
      role="row"
    >
      {names.map((name) => (
        <div
          key={name}
          className="flex h-10 items-center justify-center text-sm font-medium text-[var(--text-secondary)] select-none"
          role="columnheader"
        >
          {name}
        </div>
      ))}
    </div>
  )
}

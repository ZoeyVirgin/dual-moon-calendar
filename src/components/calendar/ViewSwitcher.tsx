import { Button } from '@/components/ui/Button'
import { useCalendarStore } from '@/store/useCalendarStore'
import type { ViewMode } from '@/types/calendar'

interface ViewSwitcherProps {
  className?: string
}

const MODE_LABELS: Record<ViewMode, string> = {
  solar: '阳历',
  'lunar-primary': '主月历',
  'lunar-secondary': '副月历',
}

const CYCLE: ViewMode[] = ['solar', 'lunar-primary', 'lunar-secondary']

export function ViewSwitcher({ className }: ViewSwitcherProps) {
  const viewMode = useCalendarStore((s) => s.viewMode)
  const setViewMode = useCalendarStore((s) => s.setViewMode)

  const currentIdx = CYCLE.indexOf(viewMode)
  const next = CYCLE[(currentIdx + 1) % CYCLE.length]

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-[var(--text-tertiary)] hidden sm:inline">
        [{MODE_LABELS[viewMode]}]
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode(next)}
        className={className}
      >
        切换至{MODE_LABELS[next]}
      </Button>
    </div>
  )
}

export type { ViewSwitcherProps }

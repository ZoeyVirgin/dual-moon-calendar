import { Button } from '@/components/ui/Button'
import { useCalendarStore } from '@/store/useCalendarStore'

interface ViewSwitcherProps {
  className?: string
}

/**
 * 视图切换按钮
 *
 * 在"阳历"和"主月历"之间切换。
 * 上层通过在 CalendarGrid 外层加 key={viewMode} 触发重新挂载 + fade-in 动画。
 */
export function ViewSwitcher({ className }: ViewSwitcherProps) {
  const viewMode = useCalendarStore((s) => s.viewMode)
  const setViewMode = useCalendarStore((s) => s.setViewMode)

  const handleSwitch = () => {
    setViewMode(viewMode === 'solar' ? 'lunar-primary' : 'solar')
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSwitch} className={className}>
      {viewMode === 'solar' ? '切换至主月历' : '切换至阳历'}
    </Button>
  )
}

export type { ViewSwitcherProps }

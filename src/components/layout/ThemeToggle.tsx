import { Button } from '@/components/ui/Button'
import { useCalendarStore } from '@/store/useCalendarStore'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const theme = useCalendarStore((s) => s.theme)
  const toggleTheme = useCalendarStore((s) => s.toggleTheme)

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      onClick={toggleTheme}
      aria-label={theme === 'light' ? '切换至深色模式' : '切换至浅色模式'}
    />
  )
}

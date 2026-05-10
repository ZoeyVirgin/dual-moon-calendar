import { type ReactNode } from 'react'
import { Moon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface MainLayoutProps {
  children: ReactNode
  headerActions?: ReactNode
  className?: string
}

export function MainLayout({ children, headerActions, className }: MainLayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col bg-[var(--bg-page)]', className)}>
      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-50 h-14 sm:h-16',
          'flex items-center justify-between px-3 sm:px-6',
          'bg-[var(--bg-primary)]/90 border-b border-[var(--border-light)]',
          'backdrop-blur-sm',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 select-none">
          <Moon
            className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--accent-500)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="text-base sm:text-lg font-semibold text-[var(--text-primary)] tracking-tight">
            <span className="hidden sm:inline">双月合历</span>
            <span className="sm:hidden">双月</span>
          </span>
        </div>

        {/* Actions slot */}
        {headerActions && (
          <div className="flex items-center gap-2">{headerActions}</div>
        )}
      </header>

      {/* Main content area */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}

export type { MainLayoutProps }

import { MainLayout } from '@/components/layout/MainLayout'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { Navigation } from '@/components/calendar/Navigation'
import { ViewSwitcher } from '@/components/calendar/ViewSwitcher'
import { DetailPanel } from '@/components/calendar/DetailPanel'
import { Timeline } from '@/components/events/Timeline'
import { HolidayPanel } from '@/components/events/HolidayPanel'
import { AuthorGate } from '@/components/layout/AuthorGate'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useEffect } from 'react'

function HeaderActions() {
  return (
    <div className="flex items-center gap-1">
      <ViewSwitcher />
      <ThemeToggle />
      <AuthorGate />
    </div>
  )
}

export default function App() {
  const viewMode = useCalendarStore((s) => s.viewMode)
  const currentYear = useCalendarStore((s) => s.currentYear)
  const currentMonth = useCalendarStore((s) => s.currentMonth)
  const theme = useCalendarStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ErrorBoundary>
      <LoadingScreen>
        <MainLayout headerActions={<HeaderActions />}>
          <div className="flex-1 flex flex-col p-3 sm:p-5 max-w-5xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-4 justify-center">
              {/* 左：导航 + 日历 */}
              <div className="lg:w-[460px] shrink-0">
                <Navigation className="mb-4" />
                <div key={`${currentYear}-${currentMonth}-${viewMode}`}
                     className="animate-fade-in shadow-sm rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-primary)]">
                  <CalendarGrid />
                </div>
              </div>

              {/* 右：详情 + 时间线 + 节日 */}
              <div className="flex-1 min-w-0 lg:max-w-md">
                <div className="hidden lg:block h-[52px] mb-4" />
                <DetailPanel />
                <Timeline />
                <HolidayPanel />
              </div>
            </div>
          </div>
        </MainLayout>
      </LoadingScreen>
    </ErrorBoundary>
  )
}

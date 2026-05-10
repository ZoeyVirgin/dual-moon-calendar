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
          <div className="flex-1 flex flex-col p-3 sm:p-4 max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-4 justify-center">
              {/* 左侧：详情 + 节日 */}
              <div className="lg:w-72 shrink-0 order-2 lg:order-1">
                <DetailPanel />
                <HolidayPanel />
              </div>

              {/* 中间：导航 + 日历 + 时间线 */}
              <div className="lg:w-[420px] shrink-0 order-1 lg:order-2">
                <Navigation className="mb-4" />
                <div key={`${currentYear}-${currentMonth}-${viewMode}`}
                     className="animate-fade-in shadow-sm rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-primary)]">
                  <CalendarGrid />
                </div>
                <Timeline />
              </div>

              {/* 右侧视觉留白 */}
              <div className="hidden lg:block lg:w-72 shrink-0 order-3" />
            </div>
          </div>
        </MainLayout>
      </LoadingScreen>
    </ErrorBoundary>
  )
}

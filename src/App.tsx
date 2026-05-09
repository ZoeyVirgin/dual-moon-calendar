import { MainLayout } from '@/components/layout/MainLayout'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { Navigation } from '@/components/calendar/Navigation'
import { ViewSwitcher } from '@/components/calendar/ViewSwitcher'
import { DetailPanel } from '@/components/calendar/DetailPanel'
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
  const theme = useCalendarStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ErrorBoundary>
      <LoadingScreen>
        <MainLayout headerActions={<HeaderActions />}>
          <div className="flex-1 flex flex-col p-3 sm:p-4 max-w-3xl mx-auto w-full">
            <Navigation className="mb-4" />

            <div key={viewMode} className="animate-fade-in">
              <CalendarGrid />
            </div>

            <DetailPanel />
          </div>
        </MainLayout>
      </LoadingScreen>
    </ErrorBoundary>
  )
}

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-4">
          <div className="max-w-md w-full text-center space-y-4 p-8 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--error)] bg-[var(--bg-primary)]">
            <AlertTriangle className="h-10 w-10 text-[var(--error)] mx-auto" strokeWidth={1.5} />

            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              页面出现错误
            </h1>

            <p className="text-sm text-[var(--text-secondary)]">
              请尝试刷新页面，如问题持续请联系开发者
            </p>

            <Button variant="primary" onClick={() => window.location.reload()}>
              刷新页面
            </Button>

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-4 text-left space-y-2">
                <p className="text-xs font-medium text-[var(--error)]">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] p-3 rounded-[var(--radius-md)] overflow-auto max-h-48 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

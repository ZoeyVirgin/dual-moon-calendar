import { useState, useEffect } from 'react'
import { Moon } from 'lucide-react'

interface LoadingScreenProps {
  children: React.ReactNode
}

export function LoadingScreen({ children }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // 最小显示 1 秒，防止闪烁
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => setVisible(false), 500) // fade-out 500ms
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {visible && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-primary)] transition-opacity duration-500 ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {/* Logo */}
          <Moon
            className="h-12 w-12 text-[var(--accent-500)] mb-4"
            strokeWidth={1.5}
          />

          {/* 标题 */}
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            双月合历
          </h1>

          {/* 进度条 */}
          <div className="w-48 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-[var(--accent-500)] rounded-full animate-[indeterminate_1.2s_ease-in-out_infinite]" />
          </div>

          <p className="mt-3 text-xs text-[var(--text-tertiary)]">正在初始化历法引擎...</p>

          <style>{`
            @keyframes indeterminate {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
          `}</style>
        </div>
      )}

      {!visible && children}
    </>
  )
}

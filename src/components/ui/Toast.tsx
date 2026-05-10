import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (exiting) {
      const timer = setTimeout(onClose, 200)
      return () => clearTimeout(timer)
    }
  }, [exiting, onClose])

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm shadow-[var(--shadow-lg)] cursor-pointer ${exiting ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={() => setExiting(true)}
    >
      {message}
    </div>
  )
}

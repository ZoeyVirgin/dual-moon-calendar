import { useEffect } from 'react'

interface ToastProps {
  message: string
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm shadow-[var(--shadow-lg)] animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      {message}
    </div>
  )
}

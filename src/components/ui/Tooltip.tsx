import {
  useState,
  useRef,
  useCallback,
  useEffect,
  cloneElement,
  type ReactNode,
  type ReactElement,
} from 'react'
import { cn } from '@/utils/cn'

interface TooltipProps {
  content: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  maxWidth?: number
  children: ReactElement
  disabled?: boolean
}

const positionStyles = {
  top: '-translate-x-1/2 -translate-y-full -mt-2',
  bottom: '-translate-x-1/2 translate-y-0 mt-2',
  left: '-translate-x-full -translate-y-1/2 -ml-2',
  right: 'translate-x-0 -translate-y-1/2 ml-2',
}

const arrowStyles = {
  top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-[rgba(17,24,39,0.95)] border-x-transparent border-b-transparent border-[5px]',
  bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-[rgba(17,24,39,0.95)] border-x-transparent border-t-transparent border-[5px]',
  left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-[rgba(17,24,39,0.95)] border-y-transparent border-r-transparent border-[5px]',
  right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-[rgba(17,24,39,0.95)] border-y-transparent border-l-transparent border-[5px]',
}

export function Tooltip({
  content,
  position = 'top',
  delay = 150,
  maxWidth = 280,
  children,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const show = useCallback(() => {
    if (disabled) return
    clearTimers()
    showTimerRef.current = setTimeout(() => {
      setIsVisible(true)
      setIsExiting(false)
    }, delay)
  }, [disabled, delay, clearTimers])

  const hide = useCallback(() => {
    clearTimers()
    if (isVisible) {
      setIsExiting(true)
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false)
        setIsExiting(false)
      }, 200)
    } else {
      setIsVisible(false)
    }
  }, [clearTimers, isVisible])

  useEffect(() => {
    return clearTimers
  }, [clearTimers])

  if (disabled) return children

  const trigger = cloneElement(children, {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
    tabIndex: children.props.tabIndex ?? 0,
  })

  return (
    <div ref={containerRef} className="relative inline-flex">
      {trigger}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-[100] px-3 py-1.5 rounded-[var(--radius-md)]',
            'bg-[rgba(17,24,39,0.95)] text-white text-sm leading-relaxed',
            'shadow-[var(--shadow-tooltip)] pointer-events-none',
            'transition-all duration-200',
            isExiting
              ? 'opacity-0 scale-95'
              : 'opacity-100 scale-100 animate-[fadeIn_200ms_ease-out,slideUp_200ms_ease-out]',
            positionStyles[position],
          )}
          style={{ maxWidth }}
        >
          {content}
          <span className={cn('absolute', arrowStyles[position])} />
        </div>
      )}
    </div>
  )
}

export type { TooltipProps }

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/utils/cn'

type InputState = 'default' | 'error' | 'success' | 'disabled'
type InputSize = 'sm' | 'md'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  state?: InputState
  size?: InputSize
  label?: string
  errorMsg?: string
  icon?: ReactNode
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 text-xs px-2.5 rounded-[var(--radius-sm)]',
  md: 'h-10 text-sm px-3 rounded-[var(--radius-md)]',
}

const stateStyles: Record<InputState, string> = {
  default:
    'border-[var(--border-light)] focus:border-[var(--accent-500)] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.1)]',
  error:
    'border-[var(--error)] focus:border-[var(--error)] focus:ring-[3px] focus:ring-[rgba(239,68,68,0.15)]',
  success:
    'border-[var(--success)] focus:border-[var(--success)] focus:ring-[3px] focus:ring-[rgba(16,185,129,0.15)]',
  disabled:
    'border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-disabled)] cursor-not-allowed',
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      value,
      onChange,
      placeholder,
      state: inputState,
      size = 'md',
      label,
      errorMsg,
      icon,
      className,
      disabled,
      id: externalId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const id = externalId || generatedId
    const errorId = `${id}-error`
    const isSearch = type === 'search'
    const resolvedState: InputState = disabled ? 'disabled' : inputState || 'default'

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isSearch ? 'text' : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={resolvedState === 'disabled'}
            aria-invalid={resolvedState === 'error'}
            aria-describedby={resolvedState === 'error' ? errorId : undefined}
            className={cn(
              'w-full border bg-[var(--bg-primary)] transition-all duration-[var(--duration-fast)]',
              'placeholder:text-[var(--text-tertiary)]',
              'focus:outline-none',
              sizeStyles[size],
              stateStyles[resolvedState],
              isSearch && 'pl-3 pr-9',
            )}
            {...props}
          />

          {/* 搜索图标或自定义图标 */}
          {(isSearch || icon) && (
            <span
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
              aria-hidden="true"
            >
              {icon || <Search className="h-4 w-4" />}
            </span>
          )}
        </div>

        {/* 错误消息 */}
        {resolvedState === 'error' && errorMsg && (
          <p id={errorId} className="text-xs text-[var(--error)]" role="alert">
            {errorMsg}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
export type { InputProps, InputState }

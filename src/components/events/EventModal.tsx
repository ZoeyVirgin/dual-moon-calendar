import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getCalendarDate } from '@/engine/calendar'
import type { EventType, CalendarEvent } from '@/types/events'

interface EventModalProps {
  mode: 'create' | 'edit'
  initialData?: CalendarEvent
  anchorAbs: number
  onSubmit: (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1',
]

const TYPE_OPTIONS: { value: EventType; label: string; emoji: string; disabled?: boolean }[] = [
  { value: 'historical-event', label: '历史事件', emoji: '📜' },
  { value: 'recurring-holiday', label: '周期性节日', emoji: '🔁' },
  { value: 'astronomical-trigger', label: '天文触发', emoji: '🌙', disabled: true },
]

const MAX_TITLE = 50
const MAX_DESC = 500

export function EventModal({ mode, initialData, anchorAbs, onSubmit, onCancel }: EventModalProps) {
  const titleRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [eventType, setEventType] = useState<EventType>(initialData?.type || 'historical-event')
  const [color, setColor] = useState(initialData?.display?.color || '#6366F1')
  const [anchorMonth, setAnchorMonth] = useState(
    () => (initialData as { recurrence?: { anchorMonth: number } })?.recurrence?.anchorMonth || 1,
  )
  const [anchorDay, setAnchorDay] = useState(
    () => (initialData as { recurrence?: { anchorDay: number } })?.recurrence?.anchorDay || 1,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  // AutoFocus + ESC
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  // 实时校验（仅在首次提交后生效）
  const validate = useCallback(() => {
    const errs: Record<string, string> = {}
    const trimmed = title.trim()
    if (!trimmed) errs.title = '标题不能为空'
    else if (trimmed.length > MAX_TITLE) errs.title = `标题不能超过${MAX_TITLE}字符`
    if (description.length > MAX_DESC) errs.description = `描述不能超过${MAX_DESC}字符`
    return errs
  }, [title, description])

  useEffect(() => {
    if (submitted) setErrors(validate())
  }, [title, description, eventType, submitted, validate])

  const handleSubmit = () => {
    setSubmitted(true)
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const date = getCalendarDate(anchorAbs)
    const base = {
      title: title.trim(),
      description: description.trim(),
      type: eventType,
      dateAnchor: {
        abs: anchorAbs,
        solar: date.solar,
        lunarPrimary: date.lunarPrimary,
      },
      display: {
        color,
        isVisible: true,
        priority: 3,
      },
    }

    if (eventType === 'recurring-holiday') {
      const withRecurrence = base as Record<string, unknown>
      withRecurrence.recurrence = {
        rule: 'yearly',
        anchorMonth,
        anchorDay,
      }
    }

    onSubmit(base as Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>)
  }

  const isTitleError = submitted && errors.title

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full h-full sm:max-w-md sm:h-auto sm:mx-4 bg-[var(--bg-primary)] sm:rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-4 sm:p-6 overflow-y-auto">
        <h2 id="modal-title" className="text-lg font-semibold text-[var(--text-primary)] mb-5">
          {mode === 'create' ? '创建新事件' : '编辑事件'}
        </h2>

        {/* 标题 */}
        <div className="mb-4">
          <Input
            ref={titleRef}
            label="标题"
            value={title}
            onChange={(v) => setTitle(v.slice(0, MAX_TITLE))}
            placeholder="输入事件标题"
            state={isTitleError ? 'error' : 'default'}
            errorMsg={errors.title}
            maxLength={MAX_TITLE}
          />
          <p className="text-xs text-[var(--text-tertiary)] mt-1 text-right">
            {title.length}/{MAX_TITLE}
          </p>
        </div>

        {/* 事件类型 */}
        <div className="mb-4">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">事件类型</p>
          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => setEventType(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-[var(--radius-md)] border-2 transition-all text-sm',
                  eventType === opt.value
                    ? 'border-[var(--accent-500)] ring-2 ring-[var(--accent-100)] bg-[var(--bg-active)]'
                    : 'border-[var(--border-light)] hover:border-[var(--accent-300)]',
                  opt.disabled && 'opacity-40 cursor-not-allowed',
                )}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-xs font-medium">{opt.label}</span>
                {opt.disabled && (
                  <span className="text-[9px] text-[var(--text-tertiary)]">即将推出</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 周期性日期 (仅 recurring-holiday) */}
        {eventType === 'recurring-holiday' && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] block mb-1">
                月份
              </label>
              <select
                value={anchorMonth}
                onChange={(e) => setAnchorMonth(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--border-light)] text-sm bg-[var(--bg-primary)] focus:outline-none focus:border-[var(--accent-500)]"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}月</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] block mb-1">
                日期
              </label>
              <select
                value={anchorDay}
                onChange={(e) => setAnchorDay(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--border-light)] text-sm bg-[var(--bg-primary)] focus:outline-none focus:border-[var(--accent-500)]"
              >
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}日</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 描述 */}
        <div className="mb-4">
          <label className="text-sm font-medium text-[var(--text-primary)] block mb-1">
            描述 <span className="text-[var(--text-tertiary)] font-normal">（可选）</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
            placeholder="输入事件描述..."
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-primary)] resize-none focus:outline-none focus:border-[var(--accent-500)] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.1)] placeholder:text-[var(--text-tertiary)]"
          />
          <p className="text-xs text-[var(--text-tertiary)] mt-1 text-right">
            {description.length}/{MAX_DESC}
          </p>
        </div>

        {/* 颜色标签 */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">颜色标签</p>
          <div className="flex gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-8 h-8 rounded-full border-2 transition-all',
                  color === c
                    ? 'ring-2 ring-offset-2 ring-[var(--accent-500)] border-white scale-110'
                    : 'border-transparent hover:scale-105',
                )}
                style={{ backgroundColor: c }}
                aria-label={`选择颜色 ${c}`}
              />
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {mode === 'create' ? '创建事件' : '保存修改'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export type { EventModalProps }

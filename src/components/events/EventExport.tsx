import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useEventStore } from '@/store/useEventStore'
import { getCalendarDate } from '@/engine/calendar'
import { Download, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

const TYPE_LABELS: Record<string, string> = {
  'historical-event': '历史事件',
  'recurring-holiday': '周期性节日',
  'astronomical-trigger': '天文触发',
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function EventExport() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')
  const events = useEventStore((s) => s.events)
  const visible = events.filter((e) => e.display.isVisible)

  const rows = visible.map((e) => {
    const date = getCalendarDate(e.dateAnchor.abs)
    return {
      id: e.id, title: e.title, description: e.description, type: e.type,
      date: `${date.solar.year}年${date.solar.month}月${date.solar.day}日`,
      lunarDate: `${date.lunarPrimary.monthName}·${date.lunarPrimary.day}`,
      abs: e.dateAnchor.abs,
      category: TYPE_LABELS[e.type] || e.type,
      createdAt: new Date(e.createdAt).toISOString().slice(0, 10),
    }
  })

  const handleJson = () => {
    if (rows.length === 0) { setToast('暂无事件可导出'); return }
    const safe = rows.map(({ id, title, description, type, date, abs, category, createdAt }) => ({
      id, title, description, type, date, abs, category, createdAt,
    }))
    downloadFile(`双月合历-事件-${todayStr()}.json`, JSON.stringify(safe, null, 2), 'application/json')
    setOpen(false)
  }

  const handleCsv = () => {
    if (rows.length === 0) { setToast('暂无事件可导出'); return }
    const BOM = '﻿'
    const headers = ['标题', '类型', '阳历日期', '主月历', 'ABS', '描述', '创建时间']
    const lines = [BOM + headers.join(',')]
    for (const r of rows) {
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
      lines.push([escape(r.title), escape(r.category), escape(r.date), escape(r.lunarDate), String(r.abs), escape(r.description), r.createdAt].join(','))
    }
    downloadFile(`双月合历-事件-${todayStr()}.csv`, lines.join('\n'), 'text/csv;charset=utf-8')
    setOpen(false)
  }

  return (
    <div className={cn('relative inline-block')}>
      <Button variant="ghost" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => setOpen(!open)}>
        <span className="hidden sm:inline">导出</span>
        <ChevronDown className="h-3 w-3 ml-0.5" />
      </Button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-36 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-primary)] shadow-[var(--shadow-md)] z-50 py-1">
          <button onClick={handleJson} className="w-full text-left px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">导出 JSON</button>
          <button onClick={handleCsv} className="w-full text-left px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">导出 CSV</button>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}

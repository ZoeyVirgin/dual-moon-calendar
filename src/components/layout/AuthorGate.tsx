import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LogIn, LogOut, ShieldCheck } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthor } from '@/hooks/useAuthor'

const SESSION_KEY = 'author_token'

function setStoredToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(SESSION_KEY, token)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch { /* noop */ }
}

export function AuthorGate() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isAuthor = useAuthor()

  const handleLogin = async () => {
    if (!password.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      })

      const data = await res.json()

      if (data.success) {
        setStoredToken(data.token)
        setPassword('')
        setPanelOpen(false)
        window.dispatchEvent(new Event('storage'))
      } else {
        setError(data.error || '口令错误')
      }
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('网络错误，请检查网络连接')
      } else {
        setError('网络错误，请重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setStoredToken(null)
    window.dispatchEvent(new Event('storage'))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
    if (e.key === 'Escape') setPanelOpen(false)
  }

  if (isAuthor) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[var(--success)] font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          作者模式
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut className="h-3.5 w-3.5" />}>
          <span className="hidden sm:inline">退出</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        icon={<LogIn className="h-4 w-4" />}
        onClick={() => setPanelOpen(!panelOpen)}
        aria-label="作者登录"
      />

      {panelOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 w-64 p-4 rounded-[var(--radius-lg)]',
            'bg-[var(--bg-primary)] border border-[var(--border-light)] shadow-[var(--shadow-lg)] z-50',
          )}
          onKeyDown={handleKeyDown}
        >
          <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
            作者验证
          </p>

          <Input
            type="text"
            value={password}
            onChange={setPassword}
            placeholder="输入口令"
            state={error ? 'error' : 'default'}
            errorMsg={error}
            size="sm"
            className="mb-2"
          />

          <div className="flex justify-end gap-2 mt-3">
            <Button variant="ghost" size="sm" onClick={() => setPanelOpen(false)}>
              取消
            </Button>
            <Button variant="primary" size="sm" onClick={handleLogin} isLoading={loading}>
              验证
            </Button>
          </div>

        </div>
      )}
    </div>
  )
}

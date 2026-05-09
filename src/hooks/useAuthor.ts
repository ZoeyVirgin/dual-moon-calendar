import { useState, useEffect } from 'react'

const SESSION_KEY = 'author_token'

function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function getAuthToken(): string | null {
  return getStoredToken()
}

export function useAuthor(): boolean {
  const [authed, setAuthed] = useState(() => !!getStoredToken())

  useEffect(() => {
    const check = () => setAuthed(!!getStoredToken())
    window.addEventListener('storage', check)
    return () => window.removeEventListener('storage', check)
  }, [])

  return authed
}

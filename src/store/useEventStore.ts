import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalendarEvent } from '@/types/events'
import { v4 as uuidv4 } from 'uuid'

function getAuthHeader(): Record<string, string> {
  try {
    const token = sessionStorage.getItem('author_token')
    if (token) return { Authorization: `Bearer ${token}` }
  } catch { /* noop */ }
  return {}
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

interface EventState {
  events: CalendarEvent[]

  fetchRemote: (abs?: number) => Promise<void>
  addEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>

  getEventById: (id: string) => CalendarEvent | undefined
  getEventsByAbs: (abs: number) => CalendarEvent[]
  getEventsByRange: (startAbs: number, endAbs: number) => CalendarEvent[]
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],

      fetchRemote: async (abs?: number) => {
        const url = abs != null ? `/api/events?abs=${abs}` : '/api/events'
        const data = await apiFetch<CalendarEvent[]>(url)
        if (data && data.length > 0) {
          set((state) => {
            const existing = new Map(state.events.map((e) => [e.id, e]))
            for (const evt of data) existing.set(evt.id, evt)
            return { events: Array.from(existing.values()) }
          })
        }
      },

      addEvent: async (eventData) => {
        const newEvent = {
          ...eventData,
          id: uuidv4(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as unknown as CalendarEvent

        // 尝试 API
        await apiFetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(newEvent),
        })

        // 本地存储（无论API是否成功都保存）
        set((state) => {
          const next: CalendarEvent[] = [...state.events, newEvent]
          return { events: next }
        })
      },

      updateEvent: async (id, updates) => {
        const merged = { ...updates, updatedAt: Date.now() }

        await apiFetch(`/api/events/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(merged),
        })

        set((state) => {
          const next: CalendarEvent[] = state.events.map((evt) =>
            evt.id === id ? ({ ...evt, ...merged } as CalendarEvent) : evt,
          )
          return { events: next }
        })
      },

      deleteEvent: async (id) => {
        await apiFetch(`/api/events/${id}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        })

        set((state) => ({
          events: state.events.filter((evt) => evt.id !== id),
        }))
      },

      getEventById: (id) => {
        return get().events.find((evt) => evt.id === id)
      },

      getEventsByAbs: (abs) => {
        return get().events.filter((evt) => {
          if (evt.type === 'recurring-holiday') {
            const eventSolar = evt.dateAnchor.solar
            if (eventSolar && eventSolar.month && eventSolar.day) {
              return true
            }
          }
          return evt.dateAnchor.abs === abs
        })
      },

      getEventsByRange: (startAbs, endAbs) => {
        return get().events.filter((evt) => {
          const a = evt.dateAnchor.abs
          return a >= startAbs && a <= endAbs
        })
      },
    }),
    {
      name: 'dual-moon-calendar-events',
      version: 1,
    },
  ),
)

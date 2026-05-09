import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalendarEvent } from '@/types/events'
import { v4 as uuidv4 } from 'uuid'

interface EventState {
  events: CalendarEvent[]

  addEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void

  getEventById: (id: string) => CalendarEvent | undefined
  getEventsByAbs: (abs: number) => CalendarEvent[]
  getEventsByRange: (startAbs: number, endAbs: number) => CalendarEvent[]
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],

      addEvent: (eventData) => {
        const newEvent = {
          ...eventData,
          id: uuidv4(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as unknown as CalendarEvent

        set((state) => {
          const next: CalendarEvent[] = [...state.events, newEvent]
          return { events: next }
        })
      },

      updateEvent: (id, updates) => {
        set((state) => {
          const next: CalendarEvent[] = state.events.map((evt) =>
            evt.id === id
              ? ({ ...evt, ...updates, updatedAt: Date.now() } as CalendarEvent)
              : evt,
          )
          return { events: next }
        })
      },

      deleteEvent: (id) => {
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
              // Simple: match any recurring event with same month/day
              return true // Will be refined in Step 3
            }
          }
          return evt.dateAnchor.abs === abs
        })
      },

      getEventsByRange: (startAbs, endAbs) => {
        return get().events.filter((evt) => {
          const abs = evt.dateAnchor.abs
          return abs >= startAbs && abs <= endAbs
        })
      },
    }),
    {
      name: 'dual-moon-calendar-events',
      version: 1,
    },
  ),
)

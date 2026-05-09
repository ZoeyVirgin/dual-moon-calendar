import { create } from 'zustand'
import type { ViewMode } from '@/types/calendar'

function loadTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('dual-moon-calendar-theme')
    if (saved === 'dark' || saved === 'light') return saved
  } catch { /* noop */ }
  return 'light'
}

interface CalendarState {
  viewMode: ViewMode
  currentYear: number
  currentMonth: number
  selectedAbs: number | null
  isDetailPanelOpen: boolean
  theme: 'light' | 'dark'

  setViewMode: (mode: ViewMode) => void
  navigateMonth: (direction: 'prev' | 'next') => void
  goToYearMonth: (year: number, month: number) => void
  selectDate: (abs: number) => void
  clearSelection: () => void
  toggleDetailPanel: () => void
  toggleTheme: () => void
}

export const useCalendarStore = create<CalendarState>((set) => ({
  viewMode: 'solar',
  currentYear: 0,
  currentMonth: 1,
  selectedAbs: null,
  isDetailPanelOpen: false,
  theme: loadTheme(),

  setViewMode: (mode) => set({ viewMode: mode }),

  navigateMonth: (direction) =>
    set((state) => {
      if (direction === 'prev') {
        if (state.currentYear === 0 && state.currentMonth === 1) return state
        if (state.currentMonth === 1) {
          return { currentYear: state.currentYear - 1, currentMonth: 12 }
        }
        return { currentMonth: state.currentMonth - 1 }
      } else {
        if (state.currentYear === 1200 && state.currentMonth === 12) return state
        if (state.currentMonth === 12) {
          return { currentYear: state.currentYear + 1, currentMonth: 1 }
        }
        return { currentMonth: state.currentMonth + 1 }
      }
    }),

  goToYearMonth: (year, month) => {
    const y = Math.max(0, Math.min(1200, year))
    const m = Math.max(1, Math.min(12, month))
    set({ currentYear: y, currentMonth: m })
  },

  selectDate: (abs) => set({ selectedAbs: abs, isDetailPanelOpen: true }),
  clearSelection: () => set({ selectedAbs: null, isDetailPanelOpen: false }),
  toggleDetailPanel: () =>
    set((state) => ({ isDetailPanelOpen: !state.isDetailPanelOpen })),

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('dual-moon-calendar-theme', next)
      return { theme: next }
    }),
}))

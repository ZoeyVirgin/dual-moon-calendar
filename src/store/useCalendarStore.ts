import { create } from 'zustand'

type ViewMode = 'solar' | 'lunar-primary'

interface CalendarState {
  viewMode: ViewMode
  currentYear: number
  currentMonth: number
  selectedAbs: number | null
  isDetailPanelOpen: boolean

  setViewMode: (mode: ViewMode) => void
  navigateMonth: (direction: 'prev' | 'next') => void
  goToYearMonth: (year: number, month: number) => void
  selectDate: (abs: number) => void
  clearSelection: () => void
  toggleDetailPanel: () => void
}

export const useCalendarStore = create<CalendarState>((set) => ({
  viewMode: 'solar',
  currentYear: 0,
  currentMonth: 1,
  selectedAbs: null,
  isDetailPanelOpen: false,

  setViewMode: (mode) => set({ viewMode: mode }),

  navigateMonth: (direction) =>
    set((state) => {
      if (direction === 'prev') {
        if (state.currentMonth === 1) {
          return { currentYear: state.currentYear - 1, currentMonth: 12 }
        }
        return { currentMonth: state.currentMonth - 1 }
      } else {
        if (state.currentMonth === 12) {
          return { currentYear: state.currentYear + 1, currentMonth: 1 }
        }
        return { currentMonth: state.currentMonth + 1 }
      }
    }),

  goToYearMonth: (year, month) => set({ currentYear: year, currentMonth: month }),

  selectDate: (abs) => set({ selectedAbs: abs, isDetailPanelOpen: true }),
  clearSelection: () => set({ selectedAbs: null, isDetailPanelOpen: false }),
  toggleDetailPanel: () =>
    set((state) => ({ isDetailPanelOpen: !state.isDetailPanelOpen })),
}))

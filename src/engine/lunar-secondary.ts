import { ASTRONOMICAL_CONSTANTS, MOON_PHASE_CONFIG } from './constants'
import { getYearStartAbs, solarToAbs } from './solar'
import type { SolarDate, LunarSecondaryDate, AbsoluteDayNumber, MoonPhase } from '@/types/calendar'
import { MoonPhase as MoonPhaseEnum } from '@/types/calendar'

const SYNODIC_MONTH = ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_SECONDARY // 41.4948

// ============================================
// 月份天数计算（累积舍入法）
// ============================================

function cumulativeDaysBeforeMonth(globalMonthIndex: number): number {
  return Math.round(globalMonthIndex * SYNODIC_MONTH)
}

function getLunarSecondaryMonthDays(globalMonthIndex: number): number {
  return (
    cumulativeDaysBeforeMonth(globalMonthIndex + 1) -
    cumulativeDaysBeforeMonth(globalMonthIndex)
  )
}

// ============================================
// 月龄与月相计算
// ============================================

export function calculateMoonAge(abs: number, cycleLength: number): number {
  return ((abs % cycleLength) + cycleLength) % cycleLength
}

function mapMoonAgeToPhase(age: number): MoonPhase {
  const phases = MOON_PHASE_CONFIG.SECONDARY.phases

  for (const phase of phases) {
    if (age >= phase.startAge && age <= phase.endAge) {
      return phase.name as MoonPhase
    }
  }

  return MoonPhaseEnum.NEW_MOON
}

// ============================================
// 年份月份解析（与主月历相同的逐月推进逻辑）
// ============================================

function resolveYearMonth(globalIdx: number): { year: number; month: number } {
  let idx = 0
  let abs = 0
  let currentYear = 0
  let monthsInYear = 1

  while (idx < globalIdx) {
    abs += getLunarSecondaryMonthDays(idx)
    idx++

    if (currentYear < ASTRONOMICAL_CONSTANTS.MAX_YEAR) {
      const nextYearStart = getYearStartAbs(currentYear + 1)
      if (abs >= nextYearStart) {
        currentYear++
        monthsInYear = 1
      } else {
        monthsInYear++
      }
    } else {
      monthsInYear++
    }
  }

  return { year: currentYear, month: monthsInYear }
}

// ============================================
// 公开API：solarToLunarSecondary
// ============================================

export function solarToLunarSecondary(solar: SolarDate): LunarSecondaryDate {
  const targetAbs = solarToAbs(solar)

  let globalIdx = Math.floor(targetAbs / SYNODIC_MONTH)
  while (cumulativeDaysBeforeMonth(globalIdx + 1) <= targetAbs) globalIdx++
  while (cumulativeDaysBeforeMonth(globalIdx) > targetAbs) globalIdx--

  const monthStartAbs = cumulativeDaysBeforeMonth(globalIdx)
  const day = targetAbs - monthStartAbs + 1

  const { year, month } = resolveYearMonth(globalIdx)

  const moonAge = calculateMoonAge(targetAbs, SYNODIC_MONTH)
  const phase = mapMoonAgeToPhase(moonAge)

  return {
    year,
    month,
    day,
    isLeapMonth: false,
    phase,
  }
}

// ============================================
// 公开API：lunarSecondaryToAbs
// ============================================

export function lunarSecondaryToAbs(lunar: LunarSecondaryDate): AbsoluteDayNumber {
  let globalIdx = 0
  let abs = 0
  let currentYear = 0
  let currentMonth = 1

  while (currentYear < lunar.year || (currentYear === lunar.year && currentMonth < lunar.month)) {
    abs += getLunarSecondaryMonthDays(globalIdx)
    globalIdx++

    if (currentYear < ASTRONOMICAL_CONSTANTS.MAX_YEAR) {
      const nextYearStart = getYearStartAbs(currentYear + 1)
      if (abs >= nextYearStart) {
        currentYear++
        currentMonth = 1
      } else {
        currentMonth++
      }
    } else {
      currentMonth++
    }
  }

  abs += lunar.day - 1
  return abs
}

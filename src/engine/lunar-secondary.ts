import { ASTRONOMICAL_CONSTANTS, MOON_PHASE_CONFIG } from './constants'
import { getYearStartAbs, solarToAbs } from './solar'
import { detectSolarTerm } from './astronomical'
import type { SolarDate, LunarSecondaryDate, AbsoluteDayNumber, MoonPhase } from '@/types/calendar'
import { MoonPhase as MoonPhaseEnum } from '@/types/calendar'

const SYNODIC_MONTH = ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_SECONDARY // 41.4948

// ============================================
// 中气定义（与主月历共用）
// ============================================
const ZHONG_QI_INDICES = new Set([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])

function hasZhongQi(monthStartAbs: number, monthEndAbs: number): boolean {
  for (let abs = monthStartAbs; abs <= monthEndAbs; abs++) {
    const term = detectSolarTerm(abs)
    if (term && ZHONG_QI_INDICES.has(term.index)) {
      return true
    }
  }
  return false
}

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
// 年份月份解析（含无中气置闰）
// ============================================
function resolveYearMonth(globalIdx: number): { year: number; month: number; isLeap: boolean } {
  let idx = 0
  let abs = 0
  let currentYear = 0
  let monthNum = 1

  while (idx <= globalIdx) {
    const monthStart = cumulativeDaysBeforeMonth(idx)
    const days = getLunarSecondaryMonthDays(idx)
    const monthEnd = monthStart + days - 1
    const hasZq = hasZhongQi(monthStart, monthEnd)

    if (idx === globalIdx) {
      return { year: currentYear, month: monthNum, isLeap: !hasZq }
    }

    abs = monthEnd + 1
    idx++

    if (hasZq) { monthNum++ }

    if (currentYear < ASTRONOMICAL_CONSTANTS.MAX_YEAR) {
      const nextYearStart = getYearStartAbs(currentYear + 1)
      if (abs >= nextYearStart) {
        currentYear++
        monthNum = 1
      }
    }
  }

  return { year: currentYear, month: monthNum, isLeap: false }
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

  const { year, month, isLeap } = resolveYearMonth(globalIdx)

  const moonAge = calculateMoonAge(targetAbs, SYNODIC_MONTH)
  const phase = mapMoonAgeToPhase(moonAge)

  return { year, month, day, isLeapMonth: isLeap, phase }
}

// ============================================
// 公开API：lunarSecondaryToAbs
// ============================================

export function lunarSecondaryToAbs(lunar: LunarSecondaryDate): AbsoluteDayNumber {
  let globalIdx = 0
  let abs = 0
  let currentYear = 0
  let monthNum = 1
  const MAX_ITER = 50000

  for (let iter = 0; iter < MAX_ITER; iter++) {
    const monthStart = cumulativeDaysBeforeMonth(globalIdx)
    const days = getLunarSecondaryMonthDays(globalIdx)
    const monthEnd = monthStart + days - 1
    const hasZq = hasZhongQi(monthStart, monthEnd)
    const isThisLeap = !hasZq

    if (
      currentYear === lunar.year &&
      monthNum === lunar.month &&
      isThisLeap === lunar.isLeapMonth
    ) {
      return abs + (lunar.day - 1)
    }

    abs = monthEnd + 1
    globalIdx++

    if (hasZq) { monthNum++ }

    if (currentYear < ASTRONOMICAL_CONSTANTS.MAX_YEAR) {
      const nextYearStart = getYearStartAbs(currentYear + 1)
      if (abs >= nextYearStart) {
        currentYear++
        monthNum = 1
      }
    }
  }

  throw new Error(`lunarSecondaryToAbs: 找不到匹配的月份 (year=${lunar.year}, month=${lunar.month}, isLeap=${lunar.isLeapMonth})`)
}

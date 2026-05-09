import { ASTRONOMICAL_CONSTANTS, MOON_PHASE_CONFIG } from './constants'
import { getYearStartAbs, solarToAbs } from './solar'
import { detectSolarTerm } from './astronomical'
import type { SolarDate, LunarPrimaryDate, AbsoluteDayNumber, MoonPhase } from '@/types/calendar'
import { MoonPhase as MoonPhaseEnum } from '@/types/calendar'

const SYNODIC_MONTH = ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_PRIMARY // 19.5883

// ============================================
// 中气定义（二十四节气中的偶数位，共12个）
// ============================================
const ZHONG_QI_INDICES = new Set([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])

// ============================================
// 月份名称表（不含闰月）
// ============================================
const LUNAR_MONTH_NAMES = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
  '十三月', '十四月', '十五月', '十六月', '十七月', '十八月',
]

function getMonthName(month: number, isLeap: boolean): string {
  if (month < 1 || month > 18) return `${month}月`
  const base = LUNAR_MONTH_NAMES[month - 1]
  return isLeap ? `闰${base}` : base
}

// ============================================
// 核心：中气检测
// ============================================

/**
 * 检查一个主月（从 monthStartAbs 到 monthEndAbs 包含的每一天）
 * 是否至少包含一个中气（二十四节气中的偶数位）。
 */
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
// 核心：月份天数计算（基于累积舍入法）
// ============================================

function cumulativeDaysBeforeMonth(globalMonthIndex: number): number {
  return Math.round(globalMonthIndex * SYNODIC_MONTH)
}

function getLunarPrimaryMonthDays(globalMonthIndex: number): number {
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

function mapMoonAgeToPhase(age: number, cycleLength: number): MoonPhase {
  const phases =
    cycleLength === MOON_PHASE_CONFIG.PRIMARY.cycleLength
      ? MOON_PHASE_CONFIG.PRIMARY.phases
      : MOON_PHASE_CONFIG.SECONDARY.phases

  for (const phase of phases) {
    if (age >= phase.startAge && age <= phase.endAge) {
      return phase.name as MoonPhase
    }
  }

  return MoonPhaseEnum.NEW_MOON
}

// ============================================
// 解析全局月序号 → (year, month, isLeap)
// ============================================

/**
 * 根据全局月序号，返回该月的阳历年编号、月份编号和闰月标志。
 *
 * 月份编号规则：
 * - 顺次遍历，每遇到一个含中气的主月，月份编号+1
 * - 若某主月无中气 → 该月为闰月，月份编号与上一月相同
 */
function resolveYearMonth(
  globalIdx: number,
): { year: number; month: number; isLeap: boolean } {
  let idx = 0
  let abs = 0
  let currentYear = 0
  let monthNum = 1

  while (idx <= globalIdx) {
    const monthStart = cumulativeDaysBeforeMonth(idx)
    const days = getLunarPrimaryMonthDays(idx)
    const monthEnd = monthStart + days - 1
    const hasZq = hasZhongQi(monthStart, monthEnd)

    if (idx === globalIdx) {
      return { year: currentYear, month: monthNum, isLeap: !hasZq }
    }

    // 推进到下一月
    abs = monthEnd + 1
    idx++

    // 月份编号：含中气的为正选月，不含的为闰月（monthNum 不变）
    if (hasZq) {
      monthNum++
    }

    // 检测阳历年边界
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
// 公开API：solarToLunarPrimary
// ============================================

export function solarToLunarPrimary(solar: SolarDate): LunarPrimaryDate {
  const targetAbs = solarToAbs(solar)

  let globalIdx = Math.floor(targetAbs / SYNODIC_MONTH)
  while (cumulativeDaysBeforeMonth(globalIdx + 1) <= targetAbs) globalIdx++
  while (cumulativeDaysBeforeMonth(globalIdx) > targetAbs) globalIdx--

  const monthStartAbs = cumulativeDaysBeforeMonth(globalIdx)
  const day = targetAbs - monthStartAbs + 1

  const { year, month, isLeap } = resolveYearMonth(globalIdx)

  const moonAge = calculateMoonAge(targetAbs, SYNODIC_MONTH)
  const phase = mapMoonAgeToPhase(moonAge, SYNODIC_MONTH)

  return {
    year,
    month,
    day,
    isLeapMonth: isLeap,
    monthName: getMonthName(month, isLeap),
    phase,
  }
}

// ============================================
// 公开API：lunarPrimaryToAbs
// ============================================

export function lunarPrimaryToAbs(lunar: LunarPrimaryDate): AbsoluteDayNumber {
  let globalIdx = 0
  let abs = 0
  let currentYear = 0
  let monthNum = 1
  const MAX_ITER = 50000

  for (let iter = 0; iter < MAX_ITER; iter++) {
    const monthStart = cumulativeDaysBeforeMonth(globalIdx)
    const days = getLunarPrimaryMonthDays(globalIdx)
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

    if (hasZq) {
      monthNum++
    }

    if (currentYear < ASTRONOMICAL_CONSTANTS.MAX_YEAR) {
      const nextYearStart = getYearStartAbs(currentYear + 1)
      if (abs >= nextYearStart) {
        currentYear++
        monthNum = 1
      }
    }
  }

  throw new Error(`lunarPrimaryToAbs: 找不到匹配的月份 (year=${lunar.year}, month=${lunar.month}, isLeap=${lunar.isLeapMonth})`)
}

import { ASTRONOMICAL_CONSTANTS, MOON_PHASE_CONFIG } from './constants'
import { getYearStartAbs, solarToAbs } from './solar'
import type { SolarDate, LunarPrimaryDate, AbsoluteDayNumber, MoonPhase } from '@/types/calendar'
import { MoonPhase as MoonPhaseEnum } from '@/types/calendar'

const SYNODIC_MONTH = ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_PRIMARY // 19.5883

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
// 核心：月份天数计算（基于累积舍入法）
// ============================================

/**
 * 计算给定全局月序号之前的累计天数（不含该月）
 *
 * 使用 Math.round() 舍入法自动校正累积误差：
 * - 目标月均长度 = 19.5883 天
 * - 每个月的实际天数 = round((M+1) × 19.5883) - round(M × 19.5883)
 * - 结果为 19 或 20 天，长期均值收敛于 19.5883
 *
 * 验证（前17个月）：
 * round(17 × 19.5883) = round(333.0011) = 333 天 → 均 19.5882 ✓
 */
function cumulativeDaysBeforeMonth(globalMonthIndex: number): number {
  return Math.round(globalMonthIndex * SYNODIC_MONTH)
}

/**
 * 获取指定全局月序号对应月份的天数（19或20）
 */
function getLunarPrimaryMonthDays(globalMonthIndex: number): number {
  return (
    cumulativeDaysBeforeMonth(globalMonthIndex + 1) -
    cumulativeDaysBeforeMonth(globalMonthIndex)
  )
}

// ============================================
// 月龄与月相计算
// ============================================

/**
 * 计算月龄（从最近一次朔日算起的天数偏移）
 *
 * 使用浮点模运算，返回值是连续的实数。
 * 例如：calculateMoonAge(10, 19.5883) → 10.0
 *       calculateMoonAge(20, 19.5883) → 0.4117
 */
export function calculateMoonAge(abs: number, cycleLength: number): number {
  return ((abs % cycleLength) + cycleLength) % cycleLength
}

/**
 * 将月龄映射为 MoonPhase 枚举值
 */
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

  // 落在间隙中（如月龄 > 最后一个 phase 的 endAge，即接近下一朔）
  return MoonPhaseEnum.NEW_MOON
}

// ============================================
// 公开API：solarToLunarPrimary
// ============================================

/**
 * 将阳历日期转换为主月历（塞勒涅历）日期
 *
 * 算法（优化版）：
 * 1. 通过 solarToAbs 获取目标ABS
 * 2. 使用累积公式 O(1) 计算全局月序号
 * 3. 在全局月序号附近±1校正
 * 4. 从月序号反推 (year, month) 对
 * 5. 计算当月月相
 *
 * V1.0简化：不实现闰月（isLeapMonth 始终为 false）
 */
export function solarToLunarPrimary(solar: SolarDate): LunarPrimaryDate {
  const targetAbs = solarToAbs(solar)

  // 使用累积公式直接定位月份（O(1)）
  let globalIdx = Math.floor(targetAbs / SYNODIC_MONTH)

  // ±1 校正（处理累积舍入边界）
  while (cumulativeDaysBeforeMonth(globalIdx + 1) <= targetAbs) globalIdx++
  while (cumulativeDaysBeforeMonth(globalIdx) > targetAbs) globalIdx--

  const monthStartAbs = cumulativeDaysBeforeMonth(globalIdx)
  const day = targetAbs - monthStartAbs + 1

  // 从全局月序号反推 (year, month) 对
  const { year, month } = resolveYearMonth(globalIdx)

  const moonAge = calculateMoonAge(targetAbs, SYNODIC_MONTH)
  const phase = mapMoonAgeToPhase(moonAge, SYNODIC_MONTH)

  return {
    year,
    month,
    day,
    isLeapMonth: false,
    monthName: getMonthName(month, false),
    phase,
  }
}

/**
 * 从全局月序号反推阳历年编号和年内月份编号
 *
 * 逐月累加天数，追踪年份边界。
 * 复杂度 O(globalIdx) ≈ O(year × 18)，对于 year≤1200 在微秒级。
 */
function resolveYearMonth(
  globalIdx: number,
): { year: number; month: number } {
  let idx = 0
  let abs = 0
  let currentYear = 0
  let monthsInYear = 1

  while (idx < globalIdx) {
    const daysInMonth = getLunarPrimaryMonthDays(idx)
    abs += daysInMonth
    idx++

    // 下一个阳历年边界
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
// 公开API：lunarPrimaryToAbs
// ============================================

/**
 * 将主月历日期转换为绝对日序数（逆运算）
 *
 * 从公元0年1月开始逐月累加，直到到达目标 (year, month)，
 * 再加上 day-1 得到精确的ABS。
 */
export function lunarPrimaryToAbs(lunar: LunarPrimaryDate): AbsoluteDayNumber {
  let globalIdx = 0
  let abs = 0
  let currentYear = 0
  let currentMonth = 1

  // 逐月推进到目标年月
  while (currentYear < lunar.year || (currentYear === lunar.year && currentMonth < lunar.month)) {
    const daysInMonth = getLunarPrimaryMonthDays(globalIdx)
    abs += daysInMonth
    globalIdx++

    // 检测年份边界（guard: currentYear < MAX_YEAR 避免 year+1 溢出）
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

  // 加上当月日期（0-based → 转为绝对偏移）
  abs += lunar.day - 1

  return abs
}

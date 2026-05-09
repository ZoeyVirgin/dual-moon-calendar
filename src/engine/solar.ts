import { SOLAR_RULES, ASTRONOMICAL_CONSTANTS } from './constants'
import type { SolarDate, AbsoluteDayNumber } from '@/types/calendar'

/**
 * 判断给定年份是否为闰年
 *
 * 规则（来自历法.md）：
 * 1. 基本8年5闰：year % 8 ∈ {1, 2, 4, 5, 7} → 闰年
 * 2. 600年长期修正：year % 600 === 0 → 强制平年（抵消累积误差）
 *
 * 这是经过历法.md修正后的规则，与地球公历的400年修正类似。
 */
export function isLeapYear(year: number): boolean {
  const remainder = year % 8
  const isBasicLeap = (SOLAR_RULES.LEAP_YEAR_REMAINDERS as readonly number[]).includes(remainder)

  // 600年修正：能被600整除的年份不设闰
  if (isBasicLeap && year % SOLAR_RULES.CENTURIAL_CORRECTION_CYCLE === 0) {
    return false
  }

  return isBasicLeap
}

/**
 * 获取指定月份的天数
 *
 * @param month - 月份（1-12）
 * @param isLeap - 是否为闰年（仅影响12月：闰年30天，平年29天）
 */
export function getDaysInMonth(month: number, isLeap: boolean): number {
  if (month === 12 && isLeap) {
    return 30 // 闰年12月有30天
  }
  return SOLAR_RULES.MONTH_DAYS[month] // 从常量表查询
}

/**
 * 计算从公元0年1月1日到指定年份1月1日的累计天数（不含该年）
 */
function computeYearStartAbs(year: number): number {
  let total = 0
  for (let y = 0; y < year; y++) {
    total += isLeapYear(y) ? SOLAR_RULES.DAYS_IN_LEAP_YEAR : SOLAR_RULES.DAYS_IN_COMMON_YEAR
  }
  return total
}

/**
 * 获取指定年份第1天的绝对日序数
 * 用于历法引擎其他模块的年份边界计算
 */
export function getYearStartAbs(year: number): AbsoluteDayNumber {
  if (year < ASTRONOMICAL_CONSTANTS.MIN_YEAR || year > ASTRONOMICAL_CONSTANTS.MAX_YEAR) {
    throw new Error(
      `年份超出范围：${year}，必须在 ${ASTRONOMICAL_CONSTANTS.MIN_YEAR}-${ASTRONOMICAL_CONSTANTS.MAX_YEAR} 之间`,
    )
  }
  return computeYearStartAbs(year)
}

/**
 * 将阳历日期转换为绝对日序数（ABS）
 *
 * ABS = 从公元0年第1天起算的累计天数（0-based索引）
 * 公元0年1月1日的ABS = 0
 *
 * @param solar - 阳历日期对象（只需要 year, month, day 字段）
 * @returns 绝对日序数
 * @throws Error 当日期非法时抛出
 */
export function solarToAbs(solar: SolarDate): AbsoluteDayNumber {
  const { year, month, day } = solar

  // STEP 1: 输入校验
  if (year < ASTRONOMICAL_CONSTANTS.MIN_YEAR || year > ASTRONOMICAL_CONSTANTS.MAX_YEAR) {
    throw new Error(
      `年份超出范围：${year}，必须在 ${ASTRONOMICAL_CONSTANTS.MIN_YEAR}-${ASTRONOMICAL_CONSTANTS.MAX_YEAR} 之间`,
    )
  }

  if (month < 1 || month > 12) {
    throw new Error(`月份必须在1-12之间，收到: ${month}`)
  }

  const isLeap = isLeapYear(year)
  const maxDay = getDaysInMonth(month, isLeap)

  if (day < 1 || day > maxDay) {
    throw new Error(`日期必须在1-${maxDay}之间，收到: ${day}`)
  }

  // STEP 2: 累加之前所有年份的总天数
  let totalDays = computeYearStartAbs(year)

  // STEP 3: 加上当年内之前月份的天数
  for (let m = 1; m < month; m++) {
    totalDays += getDaysInMonth(m, isLeap)
  }

  // STEP 4: 加上当月日期（转为0-based索引）
  totalDays += day - 1

  return totalDays
}

/**
 * 将绝对日序数转换为阳历日期（逆运算）
 *
 * 采用"估算年份 + 逐年前后校正"的方法，因为各年天数不固定
 * （平年349天，闰年350天），无法直接用公式反解。
 *
 * 对于0-1200年的范围，即使最坏情况也只需扫描约20次年份校正，
 * O(n)的线性复杂度完全够用（微秒级）。
 *
 * @param abs - 绝对日序数 (0 ≤ abs)
 * @returns SolarDate 对象
 * @throws RangeError 当abs为负数或超出最大支持范围时抛出
 */
export function absToSolar(abs: AbsoluteDayNumber): SolarDate {
  // STEP 1: 边界检查
  if (abs < 0) {
    throw new RangeError('ABS不能为负数')
  }

  // STEP 2: 近似估算年份
  // 使用平均年长作为初始猜测（349.6266天/年）
  // 实际年份天数可能是349或350，所以估算可能有±1的误差
  const approximateYear = Math.floor(abs / 349.6266)
  let year = Math.max(0, approximateYear)

  // STEP 3: 年份校正
  // 因为每年实际天数非均匀（349或350），近似估计可能偏离±1
  // 逐年向前或向后微调，直到ABS落在该年范围内
  // 安全上限：近似估算最多偏移2年（实际只偏移±1，预留余量用5次迭代）
  for (let iter = 0; iter < 5; iter++) {
    const yearStartAbs = computeYearStartAbs(year)

    // 情况A：该年的起点高于目标ABS → 年份过高，往前推
    if (yearStartAbs > abs) {
      year--
      continue
    }

    // 情况B：计算该年最后一天的ABS
    const daysInYear = isLeapYear(year)
      ? SOLAR_RULES.DAYS_IN_LEAP_YEAR
      : SOLAR_RULES.DAYS_IN_COMMON_YEAR
    const yearEndAbs = yearStartAbs + daysInYear - 1

    // 如果ABS不超过该年末，说明找到了正确年份
    if (abs <= yearEndAbs) {
      break
    }

    // 情况C：该年终点低于目标ABS → 年份过低，往后推
    year++
  }

  // 年份上限检查
  if (year > ASTRONOMICAL_CONSTANTS.MAX_YEAR) {
    throw new RangeError(`ABS超出最大支持年份${ASTRONOMICAL_CONSTANTS.MAX_YEAR}`)
  }

  const isLeap = isLeapYear(year)

  // STEP 4: 计算年内偏移量（从1-based dayOfYear开始）
  const yearStartAbs = computeYearStartAbs(year)
  const dayOfYear = abs - yearStartAbs + 1

  // STEP 5: 分配月份和日期
  let remainingDays = dayOfYear

  for (let month = 1; month <= 12; month++) {
    const daysInThisMonth = getDaysInMonth(month, isLeap)

    if (remainingDays <= daysInThisMonth) {
      return {
        year,
        month,
        day: remainingDays,
        isLeapYear: isLeap,
        dayOfYear,
      }
    }

    remainingDays -= daysInThisMonth
  }

  // 逻辑上不应到达此处
  throw new Error('月份分配失败：日期溢出')
}

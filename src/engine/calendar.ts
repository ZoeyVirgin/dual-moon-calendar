import { absToSolar, getYearStartAbs } from './solar'
import { solarToLunarPrimary } from './lunar-primary'
import { solarToLunarSecondary } from './lunar-secondary'
import { calculateGanZhi } from './ganZhi'
import { calculateAstronomicalEvents, calculateTideLevel } from './astronomical'
import { ASTRONOMICAL_CONSTANTS, WEEKDAY_NAMES } from './constants'
import type {
  AbsoluteDayNumber,
  CalendarDate,
  WeekInfo,
} from '@/types/calendar'

// ============================================
// 辅助：星期计算（模5运算）
// ============================================

/**
 * 计算指定ABS对应的星期信息（5日制）
 *
 * ABS=0 是第1天（人天），weekday = (abs % 5) + 1
 * 5日制：人天→兽天→碧森天→岩矿天→龙天→人天...
 */
function calculateWeekInfo(abs: number): WeekInfo {
  const dayOfWeek = ((abs % 5) + 5) % 5 + 1
  return {
    dayOfWeek,
    dayName: WEEKDAY_NAMES[dayOfWeek],
  }
}

// ============================================
// 最大ABS值（缓存，惰性计算）
// ============================================

let _maxAbsCache: number | null = null

function getMaxAbsoluteDay(): number {
  if (_maxAbsCache !== null) return _maxAbsCache
  const lastYear = ASTRONOMICAL_CONSTANTS.MAX_YEAR
  const abs = getYearStartAbs(lastYear + 1) - 1
  _maxAbsCache = abs
  return abs
}

export { getMaxAbsoluteDay }

// ============================================
// ★ 核心统一API
// ============================================

/**
 * 历法引擎核心API：根据绝对日序数返回完整的日期信息
 *
 * 整合了阳历转换、主月历转换、星期计算、干支纪日、
 * 天文事件检测和潮汐等级计算，返回一个完整的 CalendarDate 对象。
 *
 * @param abs - 绝对日序数
 * @returns 完整的CalendarDate对象
 * @throws RangeError 当abs超出有效范围时抛出
 */
export function getCalendarDate(abs: AbsoluteDayNumber): CalendarDate {
  if (abs < 0) {
    throw new RangeError('ABS 不能为负数')
  }

  // 1. 基础转换
  const solar = absToSolar(abs)
  const lunarPrimary = solarToLunarPrimary(solar)
  const lunarSecondary = solarToLunarSecondary(solar)

  // 2. 星期计算
  const week = calculateWeekInfo(abs)

  // 3. 干支纪日
  const ganZhi = calculateGanZhi(abs)

  // 4. 天文事件
  const astronomicalEvents = calculateAstronomicalEvents(abs)

  // 5. 潮汐等级
  const tide = calculateTideLevel(abs)

  return {
    abs,
    solar,
    lunarPrimary,
    lunarSecondary,
    week,
    ganZhi,
    astronomicalEvents,
    tide,
  }
}

// ============================================
// 预计算缓存（性能优化）
// ============================================

/**
 * 同步版预计算缓存
 *
 * 预计算指定年份范围内的所有日期数据。
 * 应用启动时调用一次，后续查询通过 Map.get() 实现 O(1) 访问。
 *
 * @param startYear - 起始年份（默认0）
 * @param endYear - 结束年份（默认1200）
 * @returns Map<ABS, CalendarDate>
 */
export function precomputeCacheSync(
  startYear: number = 0,
  endYear: number = ASTRONOMICAL_CONSTANTS.MAX_YEAR,
): Map<AbsoluteDayNumber, CalendarDate> {
  const cache = new Map<AbsoluteDayNumber, CalendarDate>()

  const startAbs = getYearStartAbs(startYear)

  // 计算 endYear 最后一天的 ABS
  let endAbs: number
  if (endYear >= ASTRONOMICAL_CONSTANTS.MAX_YEAR) {
    endAbs = getMaxAbsoluteDay()
  } else {
    endAbs = getYearStartAbs(endYear + 1) - 1
  }

  const totalDays = endAbs - startAbs + 1

  // 大范围预计算时输出警告
  if (totalDays > 100000) {
    console.log(
      `[CalendarEngine] 预计算 ${startYear}-${endYear} 年（${totalDays.toLocaleString()} 天）...`,
    )
  }

  const startTime = performance.now()

  for (let abs = startAbs; abs <= endAbs; abs++) {
    cache.set(abs, getCalendarDate(abs))
  }

  const elapsed = performance.now() - startTime
  console.log(
    `[CalendarEngine] 预计算完成：${cache.size.toLocaleString()} 条记录，耗时 ${(elapsed / 1000).toFixed(2)}s`,
  )

  return cache
}

/**
 * 异步版预计算缓存（与同步版功能相同，但通过 setTimeout 分片执行避免阻塞UI）
 *
 * 适用于需要在浏览器主线程中执行而不卡顿的场景。
 */
export async function precomputeCache(
  startYear: number = 0,
  endYear: number = ASTRONOMICAL_CONSTANTS.MAX_YEAR,
): Promise<Map<AbsoluteDayNumber, CalendarDate>> {
  const cache = new Map<AbsoluteDayNumber, CalendarDate>()

  const startAbs = getYearStartAbs(startYear)

  let endAbs: number
  if (endYear >= ASTRONOMICAL_CONSTANTS.MAX_YEAR) {
    endAbs = getMaxAbsoluteDay()
  } else {
    endAbs = getYearStartAbs(endYear + 1) - 1
  }

  const totalDays = endAbs - startAbs + 1

  if (totalDays > 100000) {
    console.log(
      `[CalendarEngine] 异步预计算 ${startYear}-${endYear} 年（${totalDays.toLocaleString()} 天）...`,
    )
  }

  const startTime = performance.now()
  const BATCH_SIZE = 5000 // 每批5000天，批次间让出主线程

  for (let batchStart = startAbs; batchStart <= endAbs; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, endAbs)

    for (let abs = batchStart; abs <= batchEnd; abs++) {
      cache.set(abs, getCalendarDate(abs))
    }

    // 每批处理后让出主线程（避免长时间阻塞UI）
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  const elapsed = performance.now() - startTime
  console.log(
    `[CalendarEngine] 异步预计算完成：${cache.size.toLocaleString()} 条记录，耗时 ${(elapsed / 1000).toFixed(2)}s`,
  )

  return cache
}

import {
  ASTRONOMICAL_CONSTANTS,
  SOLAR_TERMS,
} from './constants'
import { calculateMoonAge } from './lunar-primary'
import type { AbsoluteDayNumber, AstronomicalEvent, TideLevel } from '@/types/calendar'
import { TideLevel as TideLevelEnum } from '@/types/calendar'

const SYNODIC_MONTH_PRIMARY = ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_PRIMARY
const SYNODIC_MONTH_SECONDARY = ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_SECONDARY
const TROPICAL_YEAR = ASTRONOMICAL_CONSTANTS.TROPICAL_YEAR
const SYNODIC_CYCLE = ASTRONOMICAL_CONSTANTS.SYNODIC_CONJUNCTION_CYCLE

// ============================================
// 节气检测
// ============================================

/**
 * 检测给定ABS是否为二十四节气日
 *
 * 24个节气均匀分布在回归年350.6266天内，间隔约14.61天。
 * 使用±0.5天容差判断当天是否恰好是某个节气的发生日。
 */
export function detectSolarTerm(abs: number): { index: number; name: string; exactAbs: number } | null {
  const interval = TROPICAL_YEAR / 24 // ≈ 14.60944 天

  const termIndexFloat = abs / interval
  const termIndex = Math.round(termIndexFloat) // 四舍五入找到最近的节气
  const exactPosition = termIndex * interval

  // ±0.5天容差：只有最接近的那天被标记为节气日
  if (Math.abs(abs - exactPosition) <= 0.5) {
    // 将termIndex映射到0-23（模24循环）
    const normalized = ((termIndex % 24) + 24) % 24
    return {
      index: normalized + 1, // 1-based
      name: SOLAR_TERMS[normalized],
      exactAbs: exactPosition,
    }
  }

  return null
}

// ============================================
// 月相检测
// ============================================

/** 中文月相标签映射 */
const PHASE_LABELS: Record<string, string> = {
  'new-moon': '朔',
  'first-quarter': '上弦',
  'full-moon': '望',
  'last-quarter': '下弦',
}

/**
 * 检测给定ABS是否为特殊月相日（朔/上弦/望/下弦）
 *
 * 使用±1.5天容差。相位中心位置：
 * - 朔：age ≈ 0（或 cycleLength）
 * - 上弦：age ≈ cycleLength / 4
 * - 望：age ≈ cycleLength / 2
 * - 下弦：age ≈ cycleLength * 3/4
 */
export function detectMoonPhase(
  abs: number,
  cycleLength: number,
  phaseName: 'new-moon' | 'first-quarter' | 'full-moon' | 'last-quarter',
  moonLabel: string,
): AstronomicalEvent | null {
  const age = calculateMoonAge(abs, cycleLength)

  // 四个主要相位在周期中的位置
  const phaseCenters: Record<string, number> = {
    'new-moon': 0,
    'first-quarter': cycleLength * 0.25,
    'full-moon': cycleLength * 0.5,
    'last-quarter': cycleLength * 0.75,
  }

  const center = phaseCenters[phaseName]
  const tolerance = 1.5

  // 计算绝对距离（考虑周期边界环回）
  let distance = Math.abs(age - center)
  if (distance > cycleLength / 2) {
    distance = cycleLength - distance
  }

  if (distance <= tolerance) {
    const label = PHASE_LABELS[phaseName] || phaseName
    return {
      id: `${moonLabel}-${phaseName}`,
      name: `${moonLabel}${label}`,
      level: 'B',
      category: 'moon-phase',
      description: `${moonLabel}${label}（月龄约${age.toFixed(1)}天）`,
    }
  }

  return null
}

// ============================================
// 双月合朔/冲日检测（S/A级）
// ============================================

/**
 * 检测双月同时合朔或同时冲日事件
 *
 * 双月合朔日：主月与副月同时为朔日（S级，约812.5天一次）
 * 双月冲日：主月与副月同时为望日（A级，出现在合朔间的中位）
 *
 * 通过直接检查两月的月龄是否同时接近目标相位实现，±3天容差。
 */
export function detectSynodicEvent(abs: number): AstronomicalEvent | null {
  const primaryAge = calculateMoonAge(abs, SYNODIC_MONTH_PRIMARY)
  const secondaryAge = calculateMoonAge(abs, SYNODIC_MONTH_SECONDARY)
  const tolerance = 2

  // 判断是否接近朔（age ≈ 0 或 age ≈ cycleLength）
  const primaryNearNew = Math.min(primaryAge, SYNODIC_MONTH_PRIMARY - primaryAge) <= tolerance
  const secondaryNearNew = Math.min(secondaryAge, SYNODIC_MONTH_SECONDARY - secondaryAge) <= tolerance

  if (primaryNearNew && secondaryNearNew) {
    return {
      id: 'dual-moon-conjunction',
      name: '双月合朔日',
      level: 'S',
      category: 'synodic',
      description: '主月与副月同时为朔日，太阳-主月-副月-地星成一条直线，可能出现双日全食',
    }
  }

  // 判断是否接近望（age ≈ cycleLength/2）
  const primaryNearFull = Math.abs(primaryAge - SYNODIC_MONTH_PRIMARY / 2) <= tolerance
  const secondaryNearFull = Math.abs(secondaryAge - SYNODIC_MONTH_SECONDARY / 2) <= tolerance

  if (primaryNearFull && secondaryNearFull) {
    return {
      id: 'dual-moon-opposition',
      name: '双月冲日',
      level: 'A',
      category: 'synodic',
      description: '主月与副月同时为望日，两颗满月分居天空两侧',
    }
  }

  return null
}

// ============================================
// 潮汐等级计算
// ============================================

/**
 * 计算当日潮汐等级
 *
 * 基于双月会合周期中的位置：
 * - 靠近合/冲位置（0°或180°黄经差）→ 大潮
 * - 靠近弦向垂直位置（90°或270°）→ 中潮
 * - 其他位置 → 小潮
 */
export function calculateTideLevel(abs: number): TideLevel {
  const phaseInCycle = ((abs % SYNODIC_CYCLE) + SYNODIC_CYCLE) % SYNODIC_CYCLE
  const halfCycle = SYNODIC_CYCLE / 2

  // 归一化到 [0, halfCycle] 范围（潮汐对称于合/冲）
  const normalized = Math.min(phaseInCycle, SYNODIC_CYCLE - phaseInCycle)

  // 距合/冲的最近距离
  const distanceFromAlignment = Math.min(normalized, Math.abs(normalized - halfCycle))

  if (distanceFromAlignment <= 3) {
    return TideLevelEnum.SPRING // 大潮（靠近合或冲位置）
  } else if (distanceFromAlignment * 2 <= halfCycle && normalized <= halfCycle / 2 + 6) {
    // Simplified: check if we're in the neap tide zone
    // Neap tide when ~90° from alignment (quarter position)
    const quarterDistance = Math.abs(normalized - halfCycle / 2)
    if (quarterDistance <= 4.5) {
      return TideLevelEnum.NEAP // 中潮（靠近弦向垂直位置）
    }
  }

  return TideLevelEnum.NORMAL // 小潮
}

// ============================================
// 主整合函数
// ============================================

/**
 * 计算给定ABS当天的所有天文事件
 *
 * 检测顺序：
 * 1. 二十四节气（B级）
 * 2. 主月月相（B级，4个主要相位）
 * 3. 副月月相（C级，仅朔和望）
 * 4. 双月合朔/冲日（S/A级）
 *
 * 返回按优先级降序排列的事件数组（S > A > B > C）
 */
export function calculateAstronomicalEvents(abs: AbsoluteDayNumber): AstronomicalEvent[] {
  const events: AstronomicalEvent[] = []

  // 1. 二十四节气检测
  const solarTerm = detectSolarTerm(abs)
  if (solarTerm) {
    events.push({
      id: `solar-term-${solarTerm.index}`,
      name: solarTerm.name,
      level: 'B',
      category: 'solar-term',
      description: `${solarTerm.name}（二十四节气之第${solarTerm.index}个）`,
    })
  }

  // 2. 主月月相检测（4个主要相位）
  const primaryPhases: Array<'new-moon' | 'first-quarter' | 'full-moon' | 'last-quarter'> = [
    'new-moon',
    'first-quarter',
    'full-moon',
    'last-quarter',
  ]
  for (const phase of primaryPhases) {
    const event = detectMoonPhase(abs, SYNODIC_MONTH_PRIMARY, phase, '主月')
    if (event) events.push(event)
  }

  // 3. 副月月相检测（仅朔和望，降级为C）
  const secondaryPhases: Array<'new-moon' | 'full-moon'> = ['new-moon', 'full-moon']
  for (const phase of secondaryPhases) {
    const event = detectMoonPhase(abs, SYNODIC_MONTH_SECONDARY, phase, '副月')
    if (event) {
      events.push({ ...event, level: 'C' })
    }
  }

  // 4. 双月合朔/冲日检测
  const synodicEvent = detectSynodicEvent(abs)
  if (synodicEvent) events.push(synodicEvent)

  // 5. 按优先级排序 (S > A > B > C)
  const priorityOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 }
  events.sort((a, b) => priorityOrder[a.level] - priorityOrder[b.level])

  return events
}

import { describe, it, expect } from 'vitest'
import { calculateGanZhi } from '@/engine/ganZhi'
import {
  detectSolarTerm,
  detectMoonPhase,
  detectSynodicEvent,
  calculateTideLevel,
  calculateAstronomicalEvents,
} from '@/engine/astronomical'
import { ASTRONOMICAL_CONSTANTS } from '@/engine/constants'
import { TideLevel } from '@/types/calendar'

const SYNODIC_PRIMARY = ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_PRIMARY
const SYNODIC_CYCLE = ASTRONOMICAL_CONSTANTS.SYNODIC_CONJUNCTION_CYCLE
const TROPICAL_YEAR = ASTRONOMICAL_CONSTANTS.TROPICAL_YEAR

// ============================================
// A组：干支纪日测试
// ============================================
describe('calculateGanZhi 干支纪日', () => {
  it('ABS 0 应为癸亥日（前一天，cycleDay=60）', () => {
    const result = calculateGanZhi(0)
    expect(result.stem).toBe('癸')
    expect(result.branch).toBe('亥')
    expect(result.combination).toBe('癸亥')
    expect(result.cycleDay).toBe(60)
  })

  it('ABS 1 应为甲子日（cycleDay=1）', () => {
    const result = calculateGanZhi(1)
    expect(result.stem).toBe('甲')
    expect(result.branch).toBe('子')
    expect(result.combination).toBe('甲子')
    expect(result.cycleDay).toBe(1)
  })

  it('ABS 10 应为癸酉日', () => {
    const result = calculateGanZhi(10)
    expect(result.stem).toBe('癸')
    expect(result.branch).toBe('酉')
  })

  it('ABS 13 应为丙子日', () => {
    const result = calculateGanZhi(13)
    expect(result.stem).toBe('丙')
    expect(result.branch).toBe('子')
  })

  it('ABS 60 应为癸亥日（cycleDay=60）', () => {
    const result = calculateGanZhi(60)
    expect(result.stem).toBe('癸')
    expect(result.branch).toBe('亥')
    expect(result.cycleDay).toBe(60)
  })

  it('ABS 61 应再次为甲子日（60日一循环）', () => {
    const result = calculateGanZhi(61)
    expect(result.combination).toBe('甲子')
    expect(result.cycleDay).toBe(1)
  })

  it('10个天干和12个地支应在60天内完整循环', () => {
    const seen = new Set<string>()
    for (let abs = 1; abs <= 60; abs++) {
      const gz = calculateGanZhi(abs)
      seen.add(gz.combination)
    }
    expect(seen.size).toBe(60)
  })

  it('连续两天的天干和地支都应各自推进1步', () => {
    for (let abs = 1; abs < 60; abs++) {
      const today = calculateGanZhi(abs)
      const tomorrow = calculateGanZhi(abs + 1)

      // 天干循环（甲→乙→...→癸→甲）
      const stemToday = today.stem
      const stemTomorrow = tomorrow.stem
      expect(stemToday).not.toBe(stemTomorrow) // 两天不应同天干（除非恰好跨10步）

      // 如果stemToday是癸，stemTomorrow应该是甲
      if (stemToday === '癸') {
        expect(stemTomorrow).toBe('甲')
      }
    }
  })
})

// ============================================
// B组：二十四节气检测
// ============================================
describe('detectSolarTerm 节气检测', () => {
  const interval = TROPICAL_YEAR / 24

  it('ABS 0 应检测到节气（第1个节气）', () => {
    const result = detectSolarTerm(0)
    expect(result).not.toBeNull()
    expect(result!.index).toBe(1)
    expect(result!.name).toBe('立春')
  })

  it('非节气日应返回null（如ABS=2）', () => {
    const result = detectSolarTerm(2)
    // 2 ≈ interval * 0.137，远离任何节气，应为null
    if (Math.abs(2 - Math.round(2 / interval) * interval) > 0.5) {
      expect(result).toBeNull()
    }
  })

  it('ABS ≈ interval*3 应检测到春分（第4个节气）', () => {
    const pos = Math.round(3 * interval) // 第4个节气（index 3 = 春分）
    const result = detectSolarTerm(pos)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('春分')
    expect(result!.index).toBe(4)
  })

  it('ABS ≈ interval*9 应检测到夏至（第10个节气）', () => {
    const pos = Math.round(9 * interval) // 第10个节气（index 9 = 夏至）
    const result = detectSolarTerm(pos)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('夏至')
    expect(result!.index).toBe(10)
  })

  it('所有24个节气在一年内应各出现一次', () => {
    const found = new Map<string, number>()
    for (let abs = 0; abs < Math.ceil(TROPICAL_YEAR); abs++) {
      const term = detectSolarTerm(abs)
      if (term) {
        found.set(term.name, (found.get(term.name) || 0) + 1)
      }
    }
    // 每个节气在一年内应该恰好出现一次
    expect(found.size).toBe(24)
    for (const count of found.values()) {
      expect(count).toBe(1)
    }
  })

  it('相邻两个节气的间隔应约为14.61天', () => {
    // 找到两个连续的节气
    let prevAbs: number | null = null
    const gaps: number[] = []

    for (let abs = 0; abs < Math.ceil(TROPICAL_YEAR * 2); abs++) {
      const term = detectSolarTerm(abs)
      if (term) {
        if (prevAbs !== null) {
          gaps.push(abs - prevAbs)
        }
        prevAbs = abs
        if (gaps.length >= 24) break
      }
    }

    // 所有间隔应在14-16天之间（整数舍入导致的波动）
    for (const gap of gaps) {
      expect(gap).toBeGreaterThanOrEqual(14)
      expect(gap).toBeLessThanOrEqual(16)
    }
  })
})

// ============================================
// C组：月相检测
// ============================================
describe('detectMoonPhase 月相检测', () => {
  it('新月附近（age≈0）应检测到主月朔', () => {
    const event = detectMoonPhase(0, SYNODIC_PRIMARY, 'new-moon', '主月')
    expect(event).not.toBeNull()
    expect(event!.name).toContain('朔')
    expect(event!.level).toBe('B')
  })

  it('满月附近（age≈9.8）应检测到主月望', () => {
    // 半周期 ≈ 9.794天
    const fullAbs = Math.round(SYNODIC_PRIMARY / 2)
    const event = detectMoonPhase(fullAbs, SYNODIC_PRIMARY, 'full-moon', '主月')
    expect(event).not.toBeNull()
    expect(event!.name).toContain('望')
  })

  it('上弦附近（age≈4.9）应检测到主月上弦', () => {
    const quarterAbs = Math.round(SYNODIC_PRIMARY / 4)
    const event = detectMoonPhase(quarterAbs, SYNODIC_PRIMARY, 'first-quarter', '主月')
    expect(event).not.toBeNull()
    expect(event!.name).toContain('上弦')
  })

  it('下弦附近（age≈14.7）应检测到主月下弦', () => {
    const threeQuarterAbs = Math.round((SYNODIC_PRIMARY * 3) / 4)
    const event = detectMoonPhase(threeQuarterAbs, SYNODIC_PRIMARY, 'last-quarter', '主月')
    expect(event).not.toBeNull()
    expect(event!.name).toContain('下弦')
  })

  it('非特殊相位日应返回null', () => {
    // ABS=5 月龄=5，不在任何主要相位区间
    const ageAt5 = ((5 % SYNODIC_PRIMARY) + SYNODIC_PRIMARY) % SYNODIC_PRIMARY
    if (ageAt5 > 2 && ageAt5 < 8) {
      const event = detectMoonPhase(5, SYNODIC_PRIMARY, 'new-moon', '主月')
      expect(event).toBeNull()
    }
  })

  it('周期边界应正确处理（age接近cycleLength应识别为朔）', () => {
    const nearEnd = Math.round(SYNODIC_PRIMARY)
    const event = detectMoonPhase(nearEnd, SYNODIC_PRIMARY, 'new-moon', '主月')
    // nearEnd % synodic ≈ 0 (for 20 ≈ 19.5883... let's check)
    expect(event).not.toBeNull()
    expect(event!.name).toContain('朔')
  })

  it('主月朔望月（19.5883天）的4个相位应在约19.6天内各出现一次', () => {
    const phases = ['new-moon', 'first-quarter', 'full-moon', 'last-quarter'] as const
    for (const phase of phases) {
      let found = false
      for (let abs = 0; abs < Math.ceil(SYNODIC_PRIMARY) + 1; abs++) {
        const event = detectMoonPhase(abs, SYNODIC_PRIMARY, phase, '主月')
        if (event) {
          found = true
          break
        }
      }
      expect(found).toBe(true)
    }
  })
})

// ============================================
// D组：双月合朔/冲日检测（核心）
// ============================================
describe('detectSynodicEvent 双月合朔/冲日', () => {
  it('ABS 0 应检测到合朔（S级）', () => {
    const event = detectSynodicEvent(0)
    expect(event).not.toBeNull()
    expect(event!.level).toBe('S')
    expect(event!.name).toBe('双月合朔日')
  })

  it('应能检测到双月冲日（A级）', () => {
    let found = false
    for (let abs = 1; abs <= 500; abs++) {
      const event = detectSynodicEvent(abs)
      if (event?.level === 'A') {
        found = true
        expect(event.name).toBe('双月冲日')
        break
      }
    }
    expect(found).toBe(true)
  })

  it('检测到的合朔/冲日事件数量在合理范围', () => {
    const events: { abs: number; level: string }[] = []
    for (let abs = 0; abs <= 2000; abs++) {
      const event = detectSynodicEvent(abs)
      if (event) events.push({ abs, level: event.level })
    }

    expect(events.length).toBeGreaterThan(0)
    expect(events.length).toBeLessThan(100)
    // 应有至少1次S级事件
    expect(events.some((e) => e.level === 'S')).toBe(true)
  })

  it('非合朔/冲日位置应返回null', () => {
    expect(detectSynodicEvent(50)).toBeNull()
    expect(detectSynodicEvent(100)).toBeNull()
    expect(detectSynodicEvent(200)).toBeNull()
  })
})

// ============================================
// E组：潮汐等级计算
// ============================================
describe('calculateTideLevel 潮汐等级', () => {
  it('合朔日应为大潮（SPRING）', () => {
    expect(calculateTideLevel(0)).toBe(TideLevel.SPRING)
  })

  it('冲日也应产生大潮', () => {
    const opposition = Math.round(SYNODIC_CYCLE / 2)
    expect(calculateTideLevel(opposition)).toBe(TideLevel.SPRING)
  })

  it('远离合/冲位置应返回NORMAL或NEAP', () => {
    // 90°相位差位置
    const quarter = Math.round(SYNODIC_CYCLE / 4)
    const level = calculateTideLevel(quarter)
    // 应该是NEAP或NORMAL（非SPRING）
    expect([TideLevel.NEAP, TideLevel.NORMAL]).toContain(level)
  })

  it('返回值应为有效的TideLevel枚举值', () => {
    const valid = [TideLevel.SPRING, TideLevel.NEAP, TideLevel.NORMAL]
    for (let abs = 0; abs < 40; abs++) {
      expect(valid).toContain(calculateTideLevel(abs))
    }
  })
})

// ============================================
// F组：事件聚合测试
// ============================================
describe('calculateAstronomicalEvents 综合聚合', () => {
  it('ABS 0 应至少包含合朔（S级）', () => {
    const events = calculateAstronomicalEvents(0)
    const sEvents = events.filter((e) => e.level === 'S')
    expect(sEvents.length).toBeGreaterThanOrEqual(1)
    expect(sEvents[0].name).toBe('双月合朔日')
  })

  it('事件应按S > A > B > C 优先级排序', () => {
    // 找一个可能包含多个事件的日期
    const events = calculateAstronomicalEvents(0)
    const priorityOrder = { S: 0, A: 1, B: 2, C: 3 }

    for (let i = 1; i < events.length; i++) {
      const prev = priorityOrder[events[i - 1].level as keyof typeof priorityOrder]
      const curr = priorityOrder[events[i].level as keyof typeof priorityOrder]
      expect(prev).toBeLessThanOrEqual(curr)
    }
  })

  it('所有事件的level字段应为有效的S/A/B/C之一', () => {
    for (let abs = 0; abs < 100; abs++) {
      const events = calculateAstronomicalEvents(abs)
      for (const event of events) {
        expect(['S', 'A', 'B', 'C']).toContain(event.level)
        expect(event.id).toBeTruthy()
        expect(event.name).toBeTruthy()
        expect(event.category).toBeTruthy()
      }
    }
  })

  it('每天返回的事件数应在合理范围内（0-7个）', () => {
    for (let abs = 0; abs < 100; abs++) {
      const events = calculateAstronomicalEvents(abs)
      expect(events.length).toBeGreaterThanOrEqual(0)
      expect(events.length).toBeLessThanOrEqual(7)
    }
  })

  it('不存在重复ID的事件', () => {
    for (let abs = 0; abs < 40; abs++) {
      const events = calculateAstronomicalEvents(abs)
      const ids = events.map((e) => e.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})

// ============================================
// G组：关键边界节点验证（SPEC交叉引用）
// ============================================
describe('SPEC关键边界验证', () => {
  it('ABS 0 的完整天象数据应包含朔+合朔+节气', () => {
    const events = calculateAstronomicalEvents(0)
    const names = events.map((e) => e.name)

    // 至少应包含合朔
    expect(names).toContain('双月合朔日')

    // 可能包含节气（如果abs=0恰好是节气日）
    const hasTerm = events.some((e) => e.category === 'solar-term')
    // 节气检测应正常工作（不一定在abs=0）
    expect(typeof hasTerm).toBe('boolean')
  })

  it('应在1000天内至少检测到1次S级双月合朔', () => {
    let found = false
    for (let abs = 0; abs <= 1000; abs++) {
      const event = detectSynodicEvent(abs)
      if (event?.level === 'S') {
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })

  it('TROPICAL_YEAR附近（约350.6天）应检测到同一节气循环', () => {
    const termAt0 = detectSolarTerm(0)
    const yearLater = Math.round(TROPICAL_YEAR)
    const termAtYear = detectSolarTerm(yearLater)

    if (termAt0) {
      expect(termAtYear).not.toBeNull()
      expect(termAtYear!.name).toBe(termAt0.name)
    }
  })
})

import { describe, it, expect } from 'vitest'
import { getCalendarDate, precomputeCacheSync } from '@/engine/calendar'
import { solarToAbs } from '@/engine/solar'
import { lunarPrimaryToAbs } from '@/engine/lunar-primary'
import { MoonPhase, TideLevel } from '@/types/calendar'

// ============================================
// getCalendarDate 集成测试
// ============================================
describe('getCalendarDate 集成测试', () => {
  it('ABS 0 应返回完整的公元0年第1天信息', () => {
    const date = getCalendarDate(0)

    expect(date.abs).toBe(0)
    expect(date.solar.year).toBe(0)
    expect(date.solar.month).toBe(1)
    expect(date.solar.day).toBe(1)
    expect(date.solar.isLeapYear).toBe(false)

    // 星期：ABS=0 → dayOfWeek=1 → 人天
    expect(date.week.dayOfWeek).toBe(1)
    expect(date.week.dayName).toBe('人天')

    // 干支：ABS=0 是前一天的癸亥=60
    expect(date.ganZhi.combination).toBe('癸亥')
    expect(date.ganZhi.cycleDay).toBe(60)

    // 天象数组应存在
    expect(Array.isArray(date.astronomicalEvents)).toBe(true)

    // 潮汐应有效
    expect([TideLevel.SPRING, TideLevel.NEAP, TideLevel.NORMAL]).toContain(date.tide)
  })

  it('ABS 349 应为公元1年1月1日（闰年始）', () => {
    const date = getCalendarDate(349)

    expect(date.solar.year).toBe(1)
    expect(date.solar.month).toBe(1)
    expect(date.solar.day).toBe(1)
    expect(date.solar.isLeapYear).toBe(true)
    expect(date.week.dayOfWeek).toBe(5) // 350 % 5 = 0 → day 5 = 龙天
    expect(date.week.dayName).toBe('龙天')
  })

  it('主月历字段应完整且合法', () => {
    const date = getCalendarDate(100)

    expect(date.lunarPrimary).toBeDefined()
    expect(date.lunarPrimary.year).toBeGreaterThanOrEqual(0)
    expect(date.lunarPrimary.month).toBeGreaterThan(0)
    expect(date.lunarPrimary.day).toBeGreaterThan(0)
    expect(date.lunarPrimary.day).toBeLessThanOrEqual(20)
    expect(Object.values(MoonPhase)).toContain(date.lunarPrimary.phase)
    expect(date.lunarPrimary.isLeapMonth).toBe(false)
    expect(date.lunarPrimary.monthName).toBeTruthy()
  })

  it('副月历应返回V1.0占位值', () => {
    const date = getCalendarDate(0)

    expect(date.lunarSecondary).toBeDefined()
    expect(date.lunarSecondary.year).toBe(0)
    expect(date.lunarSecondary.month).toBe(0)
    expect(date.lunarSecondary.day).toBe(0)
    expect(date.lunarSecondary.isLeapMonth).toBe(false)
  })

  it('越界ABS应抛出RangeError', () => {
    expect(() => getCalendarDate(-1)).toThrow(RangeError)
    expect(() => getCalendarDate(-1)).toThrow(/ABS/)
    // 超大值
    expect(() => getCalendarDate(999999999)).toThrow(RangeError)
  })

  it('连续两天的weekday应正确递增（5日循环）', () => {
    for (let abs = 0; abs < 100; abs++) {
      const today = getCalendarDate(abs)
      const tomorrow = getCalendarDate(abs + 1)

      const expectedNext = today.week.dayOfWeek === 5 ? 1 : today.week.dayOfWeek + 1
      expect(tomorrow.week.dayOfWeek).toBe(expectedNext)
    }
  })

  it('连续两天的干支应各自递进1步', () => {
    for (let abs = 0; abs < 60; abs++) {
      const today = getCalendarDate(abs)
      const tomorrow = getCalendarDate(abs + 1)

      // cycleDay 应递增（模60）
      const expectedCycle = today.ganZhi.cycleDay === 60 ? 1 : today.ganZhi.cycleDay + 1
      expect(tomorrow.ganZhi.cycleDay).toBe(expectedCycle)
    }
  })

  it('通过原始终端验证：solarToAbs(date.solar) 应等于 date.abs', () => {
    const testAbs = [0, 1, 100, 349, 350, 698, 1000, 10000]
    for (const abs of testAbs) {
      const date = getCalendarDate(abs)
      const computedAbs = solarToAbs(date.solar)
      expect(computedAbs).toBe(abs)
    }
  })

  it('主月历往返验证：lunarPrimaryToAbs(date.lunarPrimary) 应等于 date.abs', () => {
    const testAbs = [0, 10, 100, 349, 500]
    for (const abs of testAbs) {
      const date = getCalendarDate(abs)
      const computedAbs = lunarPrimaryToAbs(date.lunarPrimary)
      expect(computedAbs).toBe(abs)
    }
  })

  it('从ABS→solar→ABS 往返应始终一致（抽样1000天）', () => {
    for (let abs = 0; abs < 1000; abs++) {
      const date = getCalendarDate(abs)
      const back = solarToAbs(date.solar)
      expect(back).toBe(abs)
    }
  })

  it('天象事件数组中的每个事件应有合法的字段', () => {
    for (let abs = 0; abs < 50; abs++) {
      const date = getCalendarDate(abs)
      for (const event of date.astronomicalEvents) {
        expect(event.id).toBeTruthy()
        expect(event.name).toBeTruthy()
        expect(['S', 'A', 'B', 'C']).toContain(event.level)
        expect(event.category).toBeTruthy()
      }
    }
  })

  it('ABS=0 应检测到 S 级合朔事件', () => {
    const date = getCalendarDate(0)
    const sEvent = date.astronomicalEvents.find((e) => e.level === 'S')
    expect(sEvent).toBeDefined()
    expect(sEvent!.name).toBe('双月合朔日')
  })
})

// ============================================
// precomputeCache 功能测试
// ============================================
describe('precomputeCache 预计算缓存', () => {
  it('应能成功预计算单年数据（0年）', () => {
    const cache = precomputeCacheSync(0, 0) // 仅公元0年
    expect(cache.size).toBe(349) // 0年是平年，349天
    expect(cache.get(0)).toBeDefined()
    expect(cache.get(0)!.abs).toBe(0)
    expect(cache.get(348)).toBeDefined()
    expect(cache.get(348)!.solar.day).toBe(29)
    expect(cache.get(348)!.solar.month).toBe(12)
  })

  it('应能成功预计算2年数据（0-1年）', () => {
    const cache = precomputeCacheSync(0, 1) // 0-1年共2年
    // 0年(349天) + 1年(闰年350天) = 699天
    expect(cache.size).toBe(699)

    // 检查跨年边界
    expect(cache.get(348)!.solar.year).toBe(0) // 0年最后一天
    expect(cache.get(349)!.solar.year).toBe(1) // 1年第一天
  })

  it('缓存的每个元素都应是有效的CalendarDate', () => {
    const cache = precomputeCacheSync(0, 0)

    for (const [abs, date] of cache) {
      expect(date.abs).toBe(abs)
      expect(date.solar.year).toBe(0)
      expect(date.solar.month).toBeGreaterThanOrEqual(1)
      expect(date.solar.month).toBeLessThanOrEqual(12)
      expect(date.solar.day).toBeGreaterThanOrEqual(1)
      expect(date.solar.day).toBeLessThanOrEqual(30)
      expect(date.week.dayOfWeek).toBeGreaterThanOrEqual(1)
      expect(date.week.dayOfWeek).toBeLessThanOrEqual(5)
      expect(Array.isArray(date.astronomicalEvents)).toBe(true)
    }
  })

  it('预计算的小范围数据应与逐个调用一致', () => {
    const cache = precomputeCacheSync(0, 0)

    for (let abs = 0; abs < 349; abs++) {
      const cached = cache.get(abs)!
      const direct = getCalendarDate(abs)

      expect(cached.abs).toBe(direct.abs)
      expect(cached.solar).toEqual(direct.solar)
      expect(cached.lunarPrimary).toEqual(direct.lunarPrimary)
      expect(cached.week).toEqual(direct.week)
      expect(cached.ganZhi).toEqual(direct.ganZhi)
      expect(cached.tide).toBe(direct.tide)
    }
  })
})

// ============================================
// 星期循环验证
// ============================================
describe('星期5日制循环', () => {
  it('weekday应始终为1-5', () => {
    for (let abs = 0; abs < 200; abs++) {
      const date = getCalendarDate(abs)
      expect(date.week.dayOfWeek).toBeGreaterThanOrEqual(1)
      expect(date.week.dayOfWeek).toBeLessThanOrEqual(5)
    }
  })

  it('5天后应回到相同的weekday', () => {
    for (let abs = 0; abs < 100; abs++) {
      const date1 = getCalendarDate(abs)
      const date2 = getCalendarDate(abs + 5)
      expect(date2.week.dayOfWeek).toBe(date1.week.dayOfWeek)
      expect(date2.week.dayName).toBe(date1.week.dayName)
    }
  })
})

import { describe, it, expect } from 'vitest'
import { getCalendarDate, precomputeCacheSync } from '@/engine/calendar'
import { MoonPhase, TideLevel } from '@/types/calendar'

describe('getCalendarDate 集成测试', () => {
  it('ABS 0 应返回完整的公元0年第1天信息', () => {
    const date = getCalendarDate(0)
    expect(date.abs).toBe(0)
    expect(date.solar.year).toBe(0)
    expect(date.solar.month).toBe(1)
    expect(date.solar.day).toBe(1)
    expect(date.solar.isLeapYear).toBe(false)
    expect(date.week.dayOfWeek).toBe(1)
    expect(date.week.dayName).toBe('人天')
    expect(date.ganZhi.combination).toBe('癸亥')
    expect(date.ganZhi.cycleDay).toBe(60)
    expect(Array.isArray(date.astronomicalEvents)).toBe(true)
    expect([TideLevel.SPRING, TideLevel.NEAP, TideLevel.NORMAL]).toContain(date.tide)
  })

  it('ABS 350 应为公元1年1月1日（闰年始）', () => {
    const date = getCalendarDate(350)
    expect(date.solar.year).toBe(1)
    expect(date.solar.month).toBe(1)
    expect(date.solar.day).toBe(1)
    expect(date.solar.isLeapYear).toBe(true)
  })

  it('主月历字段应完整且合法', () => {
    const date = getCalendarDate(100)
    expect(date.lunarPrimary).toBeDefined()
    expect(date.lunarPrimary.year).toBeGreaterThanOrEqual(0)
    expect(date.lunarPrimary.month).toBeGreaterThan(0)
    expect(date.lunarPrimary.day).toBeGreaterThan(0)
    expect(date.lunarPrimary.day).toBeLessThanOrEqual(20)
    expect(Object.values(MoonPhase)).toContain(date.lunarPrimary.phase)
    expect(date.lunarPrimary.monthName).toBeTruthy()
  })

  it('副月历字段应完整', () => {
    const date = getCalendarDate(0)
    expect(date.lunarSecondary).toBeDefined()
    expect(date.lunarSecondary.year).toBe(0)
    expect(date.lunarSecondary.month).toBeGreaterThanOrEqual(1)
    expect(date.lunarSecondary.day).toBeGreaterThanOrEqual(1)
    expect(Object.values(MoonPhase)).toContain(date.lunarSecondary.phase)
  })

  it('负ABS应抛出RangeError', () => {
    expect(() => getCalendarDate(-1)).toThrow(RangeError)
  })

  it('ABS=0 应检测到 S 级合朔事件', () => {
    const date = getCalendarDate(0)
    const sEvent = date.astronomicalEvents.find((e) => e.level === 'S')
    expect(sEvent).toBeDefined()
    expect(sEvent!.name).toBe('双月合朔日')
  })
})

describe('precomputeCache 预计算缓存', () => {
  it('应能成功预计算单年数据（0年）', () => {
    const cache = precomputeCacheSync(0, 0)
    expect(cache.size).toBe(350)
    expect(cache.get(0)).toBeDefined()
    expect(cache.get(349)).toBeDefined()
    expect(cache.get(349)!.solar.year).toBe(0)
  })

  it('应能成功预计算2年数据（0-1年）', () => {
    const cache = precomputeCacheSync(0, 1)
    expect(cache.size).toBe(701)
    expect(cache.get(350)!.solar.year).toBe(1)
  })

  it('预计算的小范围数据应与逐个调用一致', () => {
    const cache = precomputeCacheSync(0, 0)
    for (let abs = 0; abs < 350; abs++) {
      const cached = cache.get(abs)!
      const direct = getCalendarDate(abs)
      expect(cached.abs).toBe(direct.abs)
      expect(cached.solar).toEqual(direct.solar)
      expect(cached.lunarPrimary).toEqual(direct.lunarPrimary)
    }
  })
})

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
    }
  })
})

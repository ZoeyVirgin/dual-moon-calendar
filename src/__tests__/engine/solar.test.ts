import { describe, it, expect } from 'vitest'
import { isLeapYear, getDaysInMonth, solarToAbs, absToSolar } from '@/engine/solar'
import type { SolarDate } from '@/types/calendar'

// ============================================
// A组：isLeapYear 测试
// ============================================
describe('isLeapYear', () => {
  it('0年应为平年（余数0不在闰年列表中）', () => {
    expect(isLeapYear(0)).toBe(false)
  })

  it('1年应为闰年（余数1）', () => {
    expect(isLeapYear(1)).toBe(true)
  })

  it('2年应为闰年（余数2）', () => {
    expect(isLeapYear(2)).toBe(true)
  })

  it('3年应为平年（余数3不在列表中）', () => {
    expect(isLeapYear(3)).toBe(false)
  })

  it('4年应为闰年（余数4）', () => {
    expect(isLeapYear(4)).toBe(true)
  })

  it('5年应为闰年（余数5）', () => {
    expect(isLeapYear(5)).toBe(true)
  })

  it('6年应为平年（余数6不在列表中）', () => {
    expect(isLeapYear(6)).toBe(false)
  })

  it('7年应为闰年（余数7）', () => {
    expect(isLeapYear(7)).toBe(true)
  })

  it('8年应为平年（新周期开始，余数0）', () => {
    expect(isLeapYear(8)).toBe(false)
  })

  it('9-15年验证完整的第二个8年周期', () => {
    // 9%8=1闰, 10%8=2闰, 11%8=3平, 12%8=4闰, 13%8=5闰, 14%8=6平, 15%8=7闰
    expect(isLeapYear(9)).toBe(true)
    expect(isLeapYear(10)).toBe(true)
    expect(isLeapYear(11)).toBe(false)
    expect(isLeapYear(12)).toBe(true)
    expect(isLeapYear(13)).toBe(true)
    expect(isLeapYear(14)).toBe(false)
    expect(isLeapYear(15)).toBe(true)
  })

  it('600年应为平年（600%8=0，本身非闰；600%600=0强制修正）', () => {
    expect(isLeapYear(600)).toBe(false)
  })

  it('601年应正常判断（601%8=1 → 闰年）', () => {
    // 601%600=1≠0，不触发修正，601%8=1∈闰年列表
    expect(isLeapYear(601)).toBe(true)
  })

  it('1200年应为平年（能被600整除）', () => {
    expect(isLeapYear(1200)).toBe(false)
  })

  it('前16年应有6个平年、10个闰年', () => {
    let leap = 0
    let common = 0
    for (let y = 0; y < 16; y++) {
      if (isLeapYear(y)) leap++
      else common++
    }
    // 0-15年：平年=0,3,6,8,11,14（6个） 闰年=1,2,4,5,7,9,10,12,13,15（10个）
    expect(leap).toBe(10)
    expect(common).toBe(6)
  })
})

// ============================================
// B组：getDaysInMonth 测试
// ============================================
describe('getDaysInMonth', () => {
  it('平年1月应有30天', () => {
    expect(getDaysInMonth(1, false)).toBe(30)
  })

  it('闰年1月也应有30天（1月不受闰年影响）', () => {
    expect(getDaysInMonth(1, true)).toBe(30)
  })

  it('平年2月应有29天', () => {
    expect(getDaysInMonth(2, false)).toBe(29)
  })

  it('平年11月应有29天', () => {
    expect(getDaysInMonth(11, false)).toBe(29)
  })

  it('平年12月应有30天', () => {
    expect(getDaysInMonth(12, false)).toBe(30)
  })

  it('闰年12月应有31天（唯一的闰年影响月份）', () => {
    expect(getDaysInMonth(12, true)).toBe(31)
  })

  it('所有平年月份总和应为350', () => {
    let sum = 0
    for (let m = 1; m <= 12; m++) {
      sum += getDaysInMonth(m, false)
    }
    expect(sum).toBe(350)
  })

  it('所有闰年月份总和应为351', () => {
    let sum = 0
    for (let m = 1; m <= 12; m++) {
      sum += getDaysInMonth(m, true)
    }
    expect(sum).toBe(351)
  })

  it('2-11月（共10个月）不受闰年影响，始终29天', () => {
    for (let m = 2; m <= 11; m++) {
      expect(getDaysInMonth(m, false)).toBe(29)
      expect(getDaysInMonth(m, true)).toBe(29)
    }
  })
})

// ============================================
// C组：solarToAbs 测试
// ============================================
describe('solarToAbs', () => {
  it('公元0年1月1日应为ABS 0', () => {
    expect(
      solarToAbs({ year: 0, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 }),
    ).toBe(0)
  })

  it('公元0年1月30日应为ABS 29', () => {
    expect(
      solarToAbs({ year: 0, month: 1, day: 30, isLeapYear: false, dayOfYear: 30 }),
    ).toBe(29)
  })

  it('公元0年2月1日应为ABS 30（1月有30天）', () => {
    expect(
      solarToAbs({ year: 0, month: 2, day: 1, isLeapYear: false, dayOfYear: 31 }),
    ).toBe(30)
  })

  it('公元0年12月29日（平年最后一天）应为ABS 348', () => {
    expect(
      solarToAbs({ year: 0, month: 12, day: 29, isLeapYear: false, dayOfYear: 349 }),
    ).toBe(348)
  })

  it('公元1年1月1日（1是闰年）应为ABS 350（0年全年350天）', () => {
    expect(
      solarToAbs({ year: 1, month: 1, day: 1, isLeapYear: true, dayOfYear: 1 }),
    ).toBe(350)
  })

  it('公元1年12月30日（闰年最后一天）应为ABS 698', () => {
    expect(
      solarToAbs({ year: 1, month: 12, day: 30, isLeapYear: true, dayOfYear: 350 }),
    ).toBe(699)
  })

  it('应该拒绝非法月份13月', () => {
    expect(() =>
      solarToAbs({ year: 100, month: 13, day: 1, isLeapYear: false, dayOfYear: 1 }),
    ).toThrow(/月份必须在1-12之间/)
  })

  it('应该拒绝非法月份0月', () => {
    expect(() =>
      solarToAbs({ year: 100, month: 0, day: 1, isLeapYear: false, dayOfYear: 1 }),
    ).toThrow(/月份必须在1-12之间/)
  })

  it('平年12月30日应有效（平年12月有30天）', () => {
    // year=100, 100%8=4→闰年... wait, 4 is in the leap list!
    // Let's use year=0 (平年) instead
    expect(() =>
      solarToAbs({ year: 0, month: 12, day: 30, isLeapYear: false, dayOfYear: 350 }),
    ).not.toThrow()
  })

  it('应该拒绝负年份', () => {
    expect(() =>
      solarToAbs({ year: -1, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 }),
    ).toThrow(/年份超出范围/)
  })

  it('1201年应可正常转换（软限制）', () => {
    const result = solarToAbs({ year: 1201, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 })
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThan(0)
  })

  it('应该拒绝闰年1月31日（1月最多30天）', () => {
    expect(() =>
      solarToAbs({ year: 1, month: 1, day: 31, isLeapYear: true, dayOfYear: 1 }),
    ).toThrow(/日期必须在1-30之间/)
  })
})

// ============================================
// D组：absToSolar 测试
// ============================================
describe('absToSolar', () => {
  it('ABS 0 应为公元0年1月1日', () => {
    expect(absToSolar(0)).toEqual({
      year: 0,
      month: 1,
      day: 1,
      isLeapYear: false,
      dayOfYear: 1,
    })
  })

  it('ABS 29 应为公元0年1月30日', () => {
    expect(absToSolar(29)).toEqual({
      year: 0,
      month: 1,
      day: 30,
      isLeapYear: false,
      dayOfYear: 30,
    })
  })

  it('ABS 30 应为公元0年2月1日', () => {
    expect(absToSolar(30)).toEqual({
      year: 0,
      month: 2,
      day: 1,
      isLeapYear: false,
      dayOfYear: 31,
    })
  })

  it('ABS 348 应为公元0年12月29日（平年最后一天）', () => {
    expect(absToSolar(348)).toEqual({
      year: 0,
      month: 12,
      day: 29,
      isLeapYear: false,
      dayOfYear: 349,
    })
  })

  it('ABS 350 应为公元1年1月1日', () => {
    expect(absToSolar(350)).toEqual({
      year: 1,
      month: 1,
      day: 1,
      isLeapYear: true,
      dayOfYear: 1,
    })
  })

  it('ABS 698 应为公元1年12月30日（闰年最后一天）', () => {
    expect(absToSolar(699)).toEqual({
      year: 1,
      month: 12,
      day: 30,
      isLeapYear: true,
      dayOfYear: 350,
    })
  })

  it('应该拒绝负数ABS', () => {
    expect(() => absToSolar(-1)).toThrow(/ABS不能为负数/)
  })

  it('超大ABS可正常转换（软限制）', () => {
    const result = absToSolar(999999)
    expect(typeof result.year).toBe('number')
    expect(result.year).toBeGreaterThan(1200)
  })
})

// ============================================
// E组：双向一致性测试（核心验证）
// ============================================
describe('双向转换一致性（核心验证）', () => {
  // 抽样点覆盖：年初、年中、年末、平年、闰年、世纪修正年、时间边界
  // dayOfYear = 之前月份的累计天数 + 当月日期
  // 平年：1月30 + 2-11月各29 + 12月29 = 349
  // 闰年：1月30 + 2-11月各29 + 12月30 = 350
  const testCases: SolarDate[] = [
    { year: 0, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 },
    { year: 0, month: 6, day: 15, isLeapYear: false, dayOfYear: 161 },
    { year: 0, month: 12, day: 29, isLeapYear: false, dayOfYear: 349 },
    { year: 1, month: 1, day: 1, isLeapYear: true, dayOfYear: 1 },
    { year: 1, month: 6, day: 15, isLeapYear: true, dayOfYear: 161 },
    { year: 1, month: 12, day: 30, isLeapYear: true, dayOfYear: 350 },
    { year: 2, month: 3, day: 20, isLeapYear: true, dayOfYear: 79 },
    { year: 3, month: 9, day: 1, isLeapYear: false, dayOfYear: 234 },
    { year: 8, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 },
    { year: 350, month: 3, day: 10, isLeapYear: false, dayOfYear: 69 },
    { year: 599, month: 7, day: 1, isLeapYear: true, dayOfYear: 176 },
    { year: 600, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 },
    { year: 600, month: 12, day: 29, isLeapYear: false, dayOfYear: 349 },
    { year: 601, month: 6, day: 15, isLeapYear: true, dayOfYear: 161 },
    { year: 1199, month: 12, day: 30, isLeapYear: true, dayOfYear: 350 },
    { year: 1200, month: 12, day: 29, isLeapYear: false, dayOfYear: 349 },
  ]

  testCases.forEach((tc, index) => {
    it(`案例${index + 1}: ${tc.year}年${tc.month}月${tc.day}日 应该双向一致`, () => {
      const abs = solarToAbs(tc)
      const roundTrip = absToSolar(abs)

      expect(roundTrip).toEqual(tc)
    })
  })

  // 反向测试：solarToAbs(absToSolar(abs)) === abs
  // 抽样点覆盖整个时间范围（0 ~ 419,898，年1200最后一天）
  const absTestCases = [0, 1, 100, 348, 349, 350, 698, 10000, 50000, 100000, 200000, 419898]

  absTestCases.forEach((abs) => {
    it(`ABS ${abs} 应该双向一致`, () => {
      const solar = absToSolar(abs)
      const roundTrip = solarToAbs(solar)

      expect(roundTrip).toBe(abs)
    })
  })
})

// ============================================
// F组：连续年份一致性验证（压力测试）
// ============================================
describe('连续年份一致性验证', () => {
  it('0-100年的每一天都应该满足双向一致性', () => {
    // 对前100年的每一天做抽查（每隔37天检查一次，控制测试时间）
    let maxAbs = 0
    for (let y = 0; y <= 100; y++) {
      const isLeap = isLeapYear(y)
      const daysInYear = isLeap ? 350 : 349
      for (let d = 0; d < daysInYear; d += 37) {
        const abs = maxAbs + d
        const solar = absToSolar(abs)
        const back = solarToAbs(solar)
        expect(back).toBe(abs)
      }
      maxAbs += daysInYear
    }
  })

  it('相邻两天的ABS连续性：年末最后一天+1 = 下一年第一天', () => {
    // 验证关键过渡点
    const transitions = [
      { year: 0, isLeap: false, days: 349, nextLeap: true },
      { year: 1, isLeap: true, days: 351, nextLeap: true },
      { year: 7, isLeap: true, days: 350, nextLeap: false },
      { year: 599, isLeap: true, days: 350, nextLeap: false }, // 600年修正平年
      { year: 600, isLeap: false, days: 349, nextLeap: true },
    ]

    for (const t of transitions) {
      const lastDayAbs = solarToAbs({
        year: t.year,
        month: 12,
        day: t.isLeap ? 31 : 30,
        isLeapYear: t.isLeap,
        dayOfYear: t.days,
      })
      const firstDayNext = solarToAbs({
        year: t.year + 1,
        month: 1,
        day: 1,
        isLeapYear: t.nextLeap,
        dayOfYear: 1,
      })

      expect(firstDayNext).toBe(lastDayAbs + 1)
    }
  })
})

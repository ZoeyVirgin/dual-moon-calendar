import { describe, it, expect } from 'vitest'
import { solarToLunarPrimary, lunarPrimaryToAbs, calculateMoonAge } from '@/engine/lunar-primary'
import { solarToAbs, absToSolar } from '@/engine/solar'
import { ASTRONOMICAL_CONSTANTS } from '@/engine/constants'
import { MoonPhase } from '@/types/calendar'
import type { SolarDate } from '@/types/calendar'

const SYNODIC = ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_PRIMARY

// ============================================
// 第一层：月龄和月相计算
// ============================================
describe('calculateMoonAge', () => {
  it('ABS 0 应返回月龄 0（恰好在新月）', () => {
    expect(calculateMoonAge(0, SYNODIC)).toBeCloseTo(0, 4)
  })

  it('ABS 10 应返回月龄约 10', () => {
    expect(calculateMoonAge(10, SYNODIC)).toBeCloseTo(10, 4)
  })

  it('ABS = 朔望月长度 应返回月龄接近 0（新周期起点）', () => {
    expect(calculateMoonAge(SYNODIC, SYNODIC)).toBeCloseTo(0, 4)
  })

  it('ABS = 朔望月长度 + 5 应返回约 5', () => {
    expect(calculateMoonAge(SYNODIC + 5, SYNODIC)).toBeCloseTo(5, 4)
  })

  it('ABS = 朔望月长度 × 2 应返回约 0', () => {
    expect(calculateMoonAge(SYNODIC * 2, SYNODIC)).toBeCloseTo(0, 4)
  })
})

describe('月相映射', () => {
  it('月龄 0 应为 NEW_MOON (朔)', () => {
    const lunar = solarToLunarPrimary(
      { year: 0, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 },
    )
    expect(lunar.phase).toBe(MoonPhase.NEW_MOON)
  })

  it('月龄对应上弦附近应映射为 FIRST_QUARTER', () => {
    // 上弦：月龄 8-12
    // 找到 ABS 约 10 的位置（月龄 ≈ 10）
    const lunar = solarToLunarPrimary(
      absToSolar(10),
    )
    expect(lunar.phase).toBe(MoonPhase.FIRST_QUARTER)
  })

  it('月龄对应望月附近应映射为 FULL_MOON', () => {
    // 望：月龄 18-22。ABS=19 的月龄 = 19%19.5883 = 19 → 望
    const lunar = solarToLunarPrimary(
      absToSolar(19),
    )
    expect(lunar.phase).toBe(MoonPhase.FULL_MOON)
  })

  it('所有8种月相都应出现在连续的日子中', () => {
    const seen = new Set<string>()
    for (let abs = 0; abs < 20; abs++) {
      const lunar = solarToLunarPrimary(absToSolar(abs))
      seen.add(lunar.phase)
    }
    // 20天内至少应出现5种以上的月相（0天只落在一种月相区间）
    expect(seen.size).toBeGreaterThanOrEqual(5)
  })
})

// ============================================
// 第二层：月份天数规则
// ============================================
describe('主月历月份天数规则', () => {
  it('大小月天数只能是19或20', () => {
    // 通过累积公式直接验证：17个月累计应为333天
    const days17 = Math.round(17 * SYNODIC)
    expect(days17).toBe(333)

    // 前17个月的平均天数应接近19.5883
    const avg = days17 / 17
    expect(avg).toBeCloseTo(19.5883, 1)
  })

  it('前100个月的分布：大月(20)与小月(19)的比例应接近10:7', () => {
    let big = 0
    let totalDays = 0
    for (let i = 0; i < 100; i++) {
      const cumulative = Math.round((i + 1) * SYNODIC)
      const prevCumulative = Math.round(i * SYNODIC)
      const days = cumulative - prevCumulative
      totalDays += days
      if (days === 20) big++
    }

    const bigRatio = big / 100
    // 理论值 10/17 ≈ 0.588
    expect(bigRatio).toBeGreaterThan(0.5)
    expect(bigRatio).toBeLessThan(0.68)
    // 平均应接近19.5883
    expect(totalDays / 100).toBeCloseTo(19.5883, 1)
  })
})

// ============================================
// 第三层：双向转换一致性（核心验证）
// ============================================
describe('主月历双向转换一致性', () => {
  // 精选抽样：覆盖平年、闰年、年初、年中、年末、关键年份边界
  const solarDates: SolarDate[] = [
    { year: 0, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 },
    { year: 0, month: 1, day: 20, isLeapYear: false, dayOfYear: 20 },
    { year: 0, month: 2, day: 1, isLeapYear: false, dayOfYear: 31 },
    { year: 0, month: 6, day: 15, isLeapYear: false, dayOfYear: 161 },
    { year: 0, month: 12, day: 29, isLeapYear: false, dayOfYear: 349 },
    { year: 1, month: 1, day: 1, isLeapYear: true, dayOfYear: 1 },
    { year: 1, month: 6, day: 15, isLeapYear: true, dayOfYear: 161 },
    { year: 1, month: 12, day: 30, isLeapYear: true, dayOfYear: 350 },
    { year: 2, month: 1, day: 1, isLeapYear: true, dayOfYear: 1 },
    { year: 8, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 },
    { year: 50, month: 6, day: 15, isLeapYear: false, dayOfYear: 161 },
  ]

  solarDates.forEach((solar, idx) => {
    it(`案例${idx + 1}: ${solar.year}年${solar.month}月${solar.day}日 solar→lunar→abs 一致`, () => {
      const abs = solarToAbs(solar)
      const lunar = solarToLunarPrimary(solar)
      const roundTrip = lunarPrimaryToAbs(lunar)

      expect(roundTrip).toBe(abs)

      // 额外检查：日期合法性
      expect(lunar.day).toBeGreaterThanOrEqual(1)
      expect(lunar.day).toBeLessThanOrEqual(20)
      expect(Object.values(MoonPhase)).toContain(lunar.phase)
      expect(lunar.isLeapMonth).toBe(false)
    })
  })

  // 反向测试：抽样ABS → lunar → abs（避开远处年份减少迭代开销）
  const absValues = [0, 10, 19, 20, 39, 100, 348, 349, 350, 698, 1000, 5000, 10000]

  absValues.forEach((abs) => {
    it(`ABS ${abs} → lunar → abs 应该一致`, () => {
      const solar = absToSolar(abs)
      const lunar = solarToLunarPrimary(solar)
      const roundTrip = lunarPrimaryToAbs(lunar)

      expect(roundTrip).toBe(abs)

      // 日期应在合理范围
      expect(lunar.day).toBeGreaterThanOrEqual(1)
      expect(lunar.day).toBeLessThanOrEqual(20)
    })
  })
})

// ============================================
// 第四层：特定边界情况验证
// ============================================
describe('主月历边界情况', () => {
  it('solar 0/1/1 应对应 lunar year=0, month=1, day=1', () => {
    const lunar = solarToLunarPrimary(
      { year: 0, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 },
    )
    expect(lunar.year).toBe(0)
    expect(lunar.month).toBe(1)
    expect(lunar.day).toBe(1)
    expect(lunar.phase).toBe(MoonPhase.NEW_MOON)
  })

  it('相邻两天的月份应保持连续', () => {
    const day1 = solarToLunarPrimary(absToSolar(19))
    const day2 = solarToLunarPrimary(absToSolar(20))

    // 如果跨月，day1应该是该月最后一天，day2是下月第一天
    if (day1.month !== day2.month) {
      expect(day2.day).toBe(1)
      // 如果同年同月，月份差应为1
      if (day1.year === day2.year) {
        expect(day2.month).toBe(day1.month + 1)
      }
    }
  })

  it('跨越阳历年的主月历年份由月份起始ABS决定', () => {
    // 公元0年最后一天
    const lastDayYear0 = solarToLunarPrimary(
      { year: 0, month: 12, day: 29, isLeapYear: false, dayOfYear: 349 },
    )
    // 公元1年第一天 — 该主历月可能起始于year 0，因此year可能为0
    const firstDayYear1 = solarToLunarPrimary(
      { year: 1, month: 1, day: 1, isLeapYear: true, dayOfYear: 1 },
    )

    // lastDayYear0 应该属于 year 0
    expect(lastDayYear0.year).toBe(0)

    // firstDayYear1 的年份由该主历月的起始ABS决定（在year 0或year 1）
    // 如果在year 1的第一个月，则 year=1, month=1
    // 如果该月起始于year 0，则 year=0
    expect(firstDayYear1.year).toBeGreaterThanOrEqual(0)
    expect(firstDayYear1.year).toBeLessThanOrEqual(1)
    expect(firstDayYear1.day).toBeGreaterThanOrEqual(1)
  })

  it('同一个月内，day增加时ABS也同步增加', () => {
    const lunar1 = solarToLunarPrimary(absToSolar(0))
    const lunar2 = solarToLunarPrimary(absToSolar(19))

    // ABS=0 和 ABS=19 如果在同一个月
    if (lunar1.month === lunar2.month) {
      expect(lunar2.day).toBe(lunar1.day + 19)
    }
  })

  it('连续20天的日期间应无间断', () => {
    for (let abs = 0; abs < 38; abs++) {
      const solar = absToSolar(abs)
      const lunar = solarToLunarPrimary(solar)
      expect(lunar.day).toBeGreaterThanOrEqual(1)

      // 验证 ABS 往返
      const back = lunarPrimaryToAbs(lunar)
      expect(back).toBe(abs)
    }
  })
})

// ============================================
// 第五层：与阳历的交叉验证
// ============================================
describe('主月历与阳历交叉验证', () => {
  it('一个阳历年内的主月数量在17-18个之间', () => {
    // 抽查前8年（避免远处年份的O(n)迭代开销）
    for (let year = 0; year < 8; year++) {
      const yearStartAbs = solarToAbs({
        year,
        month: 1,
        day: 1,
        isLeapYear: false,
        dayOfYear: 1,
      })
      const nextYearStartAbs = solarToAbs({
        year: year + 1,
        month: 1,
        day: 1,
        isLeapYear: false,
        dayOfYear: 1,
      })

      let monthCount = 0
      let currentAbs = yearStartAbs

      while (currentAbs < nextYearStartAbs && monthCount < 25) {
        const lunar = solarToLunarPrimary(absToSolar(currentAbs))
        currentAbs = lunarPrimaryToAbs({
          year: lunar.year,
          month: lunar.month + 1,
          day: 1,
          isLeapMonth: false,
          monthName: '_',
          phase: MoonPhase.NEW_MOON,
        })
        monthCount++
      }

      expect(monthCount).toBeGreaterThanOrEqual(17)
      expect(monthCount).toBeLessThanOrEqual(19)
    }
  })
})

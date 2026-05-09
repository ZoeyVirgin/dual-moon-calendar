import { describe, it, expect } from 'vitest'
import { solarToLunarSecondary, lunarSecondaryToAbs, calculateMoonAge } from '@/engine/lunar-secondary'
import { solarToAbs, absToSolar } from '@/engine/solar'
import { ASTRONOMICAL_CONSTANTS } from '@/engine/constants'
import { MoonPhase } from '@/types/calendar'
import type { SolarDate } from '@/types/calendar'

const SYNODIC = ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_SECONDARY // 41.4948

// ============================================
// 月龄计算
// ============================================
describe('calculateMoonAge (副月)', () => {
  it('ABS 0 应返回月龄 0', () => {
    expect(calculateMoonAge(0, SYNODIC)).toBeCloseTo(0, 4)
  })

  it('ABS = 朔望月长度 应返回月龄接近 0', () => {
    expect(calculateMoonAge(SYNODIC, SYNODIC)).toBeCloseTo(0, 4)
  })

  it('ABS 20 应返回月龄约 20', () => {
    expect(calculateMoonAge(20, SYNODIC)).toBeCloseTo(20, 4)
  })
})

// ============================================
// 月份天数
// ============================================
describe('副月历月份天数', () => {
  it('每天天数应在 41-42 之间', () => {
    // 通过累积公式间接验证：第1个月的天数
    let total = 0
    for (let i = 0; i < 20; i++) {
      const cumulative = Math.round((i + 1) * SYNODIC)
      const prev = Math.round(i * SYNODIC)
      const days = cumulative - prev
      expect([41, 42]).toContain(days)
      total += days
    }
    // 20个月平均值应接近 41.4948
    expect(total / 20).toBeCloseTo(41.4948, 1)
  })
})

// ============================================
// 双向一致性（核心验证）
// ============================================
describe('副月历双向转换一致性', () => {
  const solarDates: SolarDate[] = [
    { year: 0, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 },
    { year: 0, month: 6, day: 15, isLeapYear: false, dayOfYear: 161 },
    { year: 0, month: 12, day: 29, isLeapYear: false, dayOfYear: 349 },
    { year: 1, month: 1, day: 1, isLeapYear: true, dayOfYear: 1 },
    { year: 1, month: 12, day: 30, isLeapYear: true, dayOfYear: 350 },
    { year: 2, month: 1, day: 1, isLeapYear: true, dayOfYear: 1 },
    { year: 8, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 },
    { year: 50, month: 6, day: 15, isLeapYear: false, dayOfYear: 161 },
  ]

  solarDates.forEach((solar, idx) => {
    it(`案例${idx + 1}: ${solar.year}年${solar.month}月${solar.day}日 solar→lunar→abs`, () => {
      const abs = solarToAbs(solar)
      const lunar = solarToLunarSecondary(solar)
      const roundTrip = lunarSecondaryToAbs(lunar)

      expect(roundTrip).toBe(abs)
      expect(lunar.day).toBeGreaterThanOrEqual(1)
      expect(lunar.day).toBeLessThanOrEqual(42)
      expect(Object.values(MoonPhase)).toContain(lunar.phase)
      expect(lunar.isLeapMonth).toBe(false)
    })
  })

  // 反向：ABS → lunar → abs
  const absValues = [0, 10, 41, 42, 83, 100, 349, 350, 698, 1000, 5000]

  absValues.forEach((abs) => {
    it(`ABS ${abs} → lunar → abs 一致`, () => {
      const solar = absToSolar(abs)
      const lunar = solarToLunarSecondary(solar)
      const roundTrip = lunarSecondaryToAbs(lunar)

      expect(roundTrip).toBe(abs)
      expect(lunar.day).toBeGreaterThanOrEqual(1)
      expect(lunar.day).toBeLessThanOrEqual(42)
    })
  })
})

// ============================================
// 跨年边界验证
// ============================================
describe('副月历年边界', () => {
  it('一个阳历年内的副月数量在 8-9 个之间', () => {
    for (let year = 0; year < 8; year++) {
      const yearStartAbs = solarToAbs({
        year, month: 1, day: 1, isLeapYear: false, dayOfYear: 1,
      })
      const nextYearStartAbs = solarToAbs({
        year: year + 1, month: 1, day: 1, isLeapYear: false, dayOfYear: 1,
      })

      let monthCount = 0
      let currentAbs = yearStartAbs

      while (currentAbs < nextYearStartAbs && monthCount < 15) {
        const lunar = solarToLunarSecondary(absToSolar(currentAbs))
        currentAbs = lunarSecondaryToAbs({
          year: lunar.year,
          month: lunar.month + 1,
          day: 1,
          isLeapMonth: false,
          phase: MoonPhase.NEW_MOON,
        })
        monthCount++
      }

      expect(monthCount).toBeGreaterThanOrEqual(8)
      expect(monthCount).toBeLessThanOrEqual(10)
    }
  })
})

// ============================================
// 边界情况
// ============================================
describe('副月历边界', () => {
  it('solar 0/1/1 应对应 lunar year=0, month=1, day=1', () => {
    const lunar = solarToLunarSecondary(
      { year: 0, month: 1, day: 1, isLeapYear: false, dayOfYear: 1 },
    )
    expect(lunar.year).toBe(0)
    expect(lunar.month).toBe(1)
    expect(lunar.day).toBe(1)
  })

  it('连续 83 天（~2个副月）的往返验证', () => {
    for (let abs = 0; abs < 83; abs++) {
      const solar = absToSolar(abs)
      const lunar = solarToLunarSecondary(solar)
      const back = lunarSecondaryToAbs(lunar)
      expect(back).toBe(abs)
    }
  })
})

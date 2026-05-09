import { STEMS, BRANCHES } from './constants'
import type { AbsoluteDayNumber, GanZhiInfo } from '@/types/calendar'

/**
 * 根据绝对日序数计算干支纪日
 *
 * 60干支循环独立于年月之外，连续无中断。
 * 60是5的倍数，12周（12×5=60天）完成一个干支循环。
 *
 * 算法：
 * 天干索引 = (abs - 1) % 10  → 映射到 STEMS 数组
 * 地支索引 = (abs - 1) % 12  → 映射到 BRANCHES 数组
 * 循环位置 = (abs - 1) % 60 + 1  → 1-based
 */
export function calculateGanZhi(abs: AbsoluteDayNumber): GanZhiInfo {
  // 使用正余数确保负数情况下的正确性（虽然V1.0假设abs≥0）
  const adjusted = abs - 1
  const stemIndex = ((adjusted % 10) + 10) % 10
  const branchIndex = ((adjusted % 12) + 12) % 12
  const cycleDay = ((adjusted % 60) + 60) % 60 + 1

  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    combination: `${STEMS[stemIndex]}${BRANCHES[branchIndex]}`,
    cycleDay,
  }
}

export type { AbsoluteDayNumber, SolarDate, MoonPhase, LunarPrimaryDate, LunarSecondaryDate, WeekInfo, GanZhiInfo, TideLevel, AstronomicalEvent, CalendarDate, ViewMode } from '@/types/calendar';
export type { EventType, BaseEvent, RecurringHoliday, HistoricalEvent, AstronomicalTriggerEvent, CalendarEvent } from '@/types/events';

import type { MoonPhase } from '@/types/calendar';

// ============================================
// 月相计算中间结果
// ============================================
export interface MoonAgeResult {
  age: number;              // 月龄（0 - 周期长度）
  phase: MoonPhase;         // 对应的相位枚举
  illumination: number;     // 照度百分比 (0-100)
}

// ============================================
// 节气检测结果
// ============================================
export interface SolarTermDetection {
  index: number;            // 1-24
  name: string;             // 中文名称
  exactAbs: number;         // 精确发生的ABS（可能带小数，需取整）
}

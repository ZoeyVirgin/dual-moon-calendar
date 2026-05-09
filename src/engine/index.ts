// ============================================
// 历法引擎统一入口
// ============================================

// 类型导出
export type {
  CalendarDate,
  SolarDate,
  LunarPrimaryDate,
  LunarSecondaryDate,
  WeekInfo,
  GanZhiInfo,
  TideLevel,
  AstronomicalEvent,
  MoonPhase,
  ViewMode,
  AbsoluteDayNumber,
} from '@/types/calendar';

export type {
  CalendarEvent,
  BaseEvent,
  RecurringHoliday,
  HistoricalEvent,
  AstronomicalTriggerEvent,
  EventType,
} from '@/types/events';

// 常量导出
export {
  ASTRONOMICAL_CONSTANTS,
  SOLAR_RULES,
  WEEKDAY_NAMES,
  STEMS,
  BRANCHES,
  SOLAR_TERMS,
  MOON_PHASE_CONFIG,
  SYNODIC_EVENT_CONFIG,
} from './constants';

// 核心算法导出（低级API）
export { absToSolar, solarToAbs, isLeapYear, getDaysInMonth, getYearStartAbs } from './solar';
export { solarToLunarPrimary, lunarPrimaryToAbs, calculateMoonAge } from './lunar-primary';
export { solarToLunarSecondary, lunarSecondaryToAbs } from './lunar-secondary';

// 功能模块导出
export { calculateGanZhi } from './ganZhi';
export {
  calculateAstronomicalEvents,
  calculateTideLevel,
  detectSolarTerm,
  detectSynodicEvent,
  detectMoonPhase,
} from './astronomical';

// ★★★ 统一API（推荐使用）★★★
export { getCalendarDate, getMaxAbsoluteDay, precomputeCache, precomputeCacheSync } from './calendar';



// ============================================
// 类型别名：绝对日序数（内部计算基准）
// ============================================
export type AbsoluteDayNumber = number;

// ============================================
// 阳历日期结构
// ============================================
export interface SolarDate {
  year: number;        // 0 - 1200
  month: number;       // 1 - 12
  day: number;         // 动态：根据月份规则（29或30天）
  isLeapYear: boolean; // 闰年判断结果
  dayOfYear: number;   // 一年中的第几天 (1 - 349/350)
}

// ============================================
// 月相枚举
// ============================================
export enum MoonPhase {
  NEW_MOON = 'new-moon',           // 朔
  WAXING_CRESCENT = 'waxing-crescent', // 盈月
  FIRST_QUARTER = 'first-quarter',     // 上弦
  WAXING_GIBBOUS = 'waxing-gibbous',   // 盈凸
  FULL_MOON = 'full-moon',             // 望
  WANING_GIBBOUS = 'waning-gibbous',   // 亏凸
  LAST_QUARTER = 'last-quarter',       // 下弦
  WANING_CRESCENT = 'waning-crescent'  // 残月
}

// ============================================
// 主月历日期（塞勒涅历）
// ============================================
export interface LunarPrimaryDate {
  year: number;           // 回归年编号（与阳历year一致）
  month: number;          // 1 - 19（含闰月可达20+）
  day: number;            // 1 - 19 或 1 - 20
  isLeapMonth: boolean;   // 是否为闰月
  monthName: string;      // 中文名称（如"正月"、"闰二月"）
  phase: MoonPhase;       // 当日主月月相
}

// ============================================
// 副月历日期（恩底弥翁历）
// ============================================
export interface LunarSecondaryDate {
  year: number;
  month: number;          // 1 - 9（含闰月）
  day: number;            // 1 - 41 或 1 - 42
  isLeapMonth: boolean;
  phase: MoonPhase;       // 当日副月月相
}

// ============================================
// 星期信息（5日制）
// ============================================
export interface WeekInfo {
  dayOfWeek: number;      // 1 - 5
  dayName: string;        // "人天" | "兽天" | "碧森天" | "岩矿天" | "龙天"
}

// ============================================
// 干支纪日
// ============================================
export interface GanZhiInfo {
  stem: string;           // 天干（甲乙丙丁戊己庚辛壬癸）
  branch: string;         // 地支（子丑寅卯辰巳午未申酉戌亥）
  combination: string;    // 组合（如"甲子"）
  cycleDay: number;       // 60日循环中的位置 (1 - 60)
}

// ============================================
// 潮汐等级
// ============================================
export enum TideLevel {
  SPRING = 'spring',      // 大潮（双月合/冲）
  NEAP = 'neap',          // 中潮（双月弦向垂直）
  NORMAL = 'normal'       // 小潮（其他位置）
}

// ============================================
// 天文事件（自动计算的客观天象）
// ============================================
export interface AstronomicalEvent {
  id: string;             // 唯一标识（如"solar-term-spring-equinox"）
  name: string;           // 显示名称（如"春分"、"双月合朔"）
  level: 'S' | 'A' | 'B' | 'C';  // 优先级（见PRD.md 3.6.1节表格）
  category: 'solar-term' | 'moon-phase' | 'synodic' | 'gan-zhi' | 'tide';
  description?: string;   // Tooltip中显示的详细描述
}

// ============================================
// 视图模式
// ============================================
export type ViewMode = 'solar' | 'lunar-primary' | 'lunar-secondary';

// ============================================
// 聚合日期对象（引擎输出）
// ============================================
export interface CalendarDate {
  abs: AbsoluteDayNumber;

  solar: SolarDate;
  lunarPrimary: LunarPrimaryDate;
  lunarSecondary: LunarSecondaryDate;

  week: WeekInfo;
  ganZhi: GanZhiInfo;

  astronomicalEvents: AstronomicalEvent[];
  tide: TideLevel;
}

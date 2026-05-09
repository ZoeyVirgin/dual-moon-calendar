// ============================================
// 天文周期常量（单位：民用日）
// 来源：历法.md 表格"历法核心周期的精确计算"
// ============================================
export const ASTRONOMICAL_CONSTANTS = {
  // 回归年
  TROPICAL_YEAR: 350.6266,

  // 朔望月周期
  SYNODIC_MONTH_PRIMARY: 19.5883,      // 主月（塞勒涅）
  SYNODIC_MONTH_SECONDARY: 41.4948,    // 副月（恩底弥翁）

  // 双月会合周期
  SYNODIC_CONJUNCTION_CYCLE: 37.1040,

  // 岁差周期
  PRECESSION_CYCLE: 18000,             // 回归年

  // 时间范围边界
  MIN_YEAR: 0,
  MAX_YEAR: 1200,

  // ABS起点定义（历法.md已明确）
  ABS_ORIGIN: 0,                       // ABS=0 = 公元0年第1天
} as const;

// ============================================
// 阳历规则常量
// ============================================
export const SOLAR_RULES = {
  // 平年/闰年天数
  DAYS_IN_COMMON_YEAR: 349,           // ✅ 已修正（原错误值为350）
  DAYS_IN_LEAP_YEAR: 350,

  // 月份天数分配表（索引1-12，index 0占位）
  MONTH_DAYS: [
    0,                                // 占位
    30,                               // 1月
    29, 29, 29, 29, 29, 29, 29, 29, 29, 29,  // 2-11月（共10个月）
    29                                // 12月（平年）/ 30（闰年）
  ],

  // 闰年判定：年份 % 8 的余数
  LEAP_YEAR_REMAINDERS: [1, 2, 4, 5, 7],

  // 长期修正：每600年去掉1个闰年
  CENTURIAL_CORRECTION_CYCLE: 600,
} as const;

// ============================================
// 星期名称映射
// ============================================
export const WEEKDAY_NAMES: Record<number, string> = {
  1: '人天',
  2: '兽天',
  3: '碧森天',
  4: '岩矿天',
  5: '龙天',
};

// ============================================
// 干支系统
// ============================================
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const GAN_ZHI_CYCLE = 60;  // 10和12的最小公倍数

// ============================================
// 二十四节气名称（暂沿用地球命名，后续可替换）
// 见历法.md 第88行说明
// ============================================
export const SOLAR_TERMS = [
  '立春', '雨水', '惊蛰', '春分',         // 春季 (1-4)
  '清明', '谷雨', '立夏', '小满',         // 夏季起始 (5-8)
  '芒种', '夏至', '小暑', '大暑',         // 夏季 (9-12)
  '立秋', '处暑', '白露', '秋分',         // 秋季 (13-16)
  '寒露', '霜降', '立冬', '小雪',         // 秋冬季过渡 (17-20)
  '大雪', '冬至', '小寒', '大寒'          // 冬季 (21-24)
] as const;

// ============================================
// 月相配置（用于月龄→相位映射）
// ============================================
export const MOON_PHASE_CONFIG = {
  PRIMARY: {
    cycleLength: 19.5883,  // 主月朔望月
    phases: [
      { name: 'new-moon', label: '朔', startAge: 0, endAge: 2 },
      { name: 'waxing-crescent', label: '盈月', startAge: 3, endAge: 7 },
      { name: 'first-quarter', label: '上弦', startAge: 8, endAge: 12 },
      { name: 'waxing-gibbous', label: '盈凸', startAge: 13, endAge: 17 },
      { name: 'full-moon', label: '望', startAge: 18, endAge: 22 },
      { name: 'waning-gibbous', label: '亏凸', startAge: 23, endAge: 27 },
      { name: 'last-quarter', label: '下弦', startAge: 28, endAge: 32 },
      { name: 'waning-crescent', label: '残月', startAge: 33, endAge: 38 },
      // >38 接近下一个朔
    ] as const,
  },
  SECONDARY: {
    cycleLength: 41.4948,  // 副月朔望月
    phases: [
      { name: 'new-moon', label: '朔', startAge: 0, endAge: 5 },
      { name: 'waxing-crescent', label: '盈月', startAge: 6, endAge: 15 },
      { name: 'first-quarter', label: '上弦', startAge: 16, endAge: 25 },
      { name: 'waxing-gibbous', label: '盈凸', startAge: 26, endAge: 35 },
      { name: 'full-moon', label: '望', startAge: 36, endAge: 46 },
      { name: 'waning-gibbous', label: '亏凸', startAge: 47, endAge: 56 },
      { name: 'last-quarter', label: '下弦', startAge: 57, endAge: 67 },
      { name: 'waning-crescent', label: '残月', startAge: 68, endAge: 78 },
      // >78 接近下一个朔
    ] as const,
  },
} as const;

// ============================================
// 双月合朔/冲日周期配置
// ============================================
export const SYNODIC_EVENT_CONFIG = {
  conjunctionCycle: 812.5,      // 约812.5天一次双月合朔（近似值，需精确计算）
  oppositionOffset: 406.25,     // 合朔与冲日的间隔（约半个周期）
} as const;

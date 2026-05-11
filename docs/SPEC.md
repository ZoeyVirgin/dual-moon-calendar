# 双月合历日历系统 - 技术规格书 (Technical Specification)

> **文档版本**: v1.0.0  
> **基于**: PRD.md v1.0.0 + 历法.md (已修正版)  
> **目标读者**: AI编程助手 / 开发者（直接用于编码实现）  
> **使用方式**: 将此文件 + 历法.md + PRD.md 一同放入项目根目录，AI可全局访问

---

## 目录

1. [项目初始化配置](#1-项目初始化配置)
2. [核心数据模型](#2-核心数据模型)
3. [历法引擎算法规格](#3-历法引擎算法规格)
4. [状态管理架构](#4-状态管理架构)
5. [组件架构与API](#5-组件架构与api)
6. [CSS设计系统Token](#6-css设计系统token)
7. [开发任务分解（Phase-by-Phase）](#7-开发任务分解phase-by-phase)
8. [测试规格](#8-测试规格)
9. [交叉引用索引](#9-交叉引用索引)

---

## 1. 项目初始化配置

### 1.1 技术栈锁定

```json
{
  "framework": "React 18 + TypeScript 5.3+",
  "build": "Vite 5.x",
  "styling": "Tailwind CSS 3.4+ (原子化)",
  "state": "Zustand 4.x",
  "routing": "React Router DOM 6.x (预留)",
  "testing": "Vitest + Testing Library + Playwright",
  "deployment": "Vercel (静态托管)"
}
```

### 1.2 package.json 核心依赖

```json
{
  "name": "dual-moon-calendar",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.7",
    "date-fns": "^3.3.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "lucide-react": "^0.303.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/uuid": "^9.0.7",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "postcss": "^8.4.33",
    "prettier": "^3.2.4",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.2.1",
    "@testing-library/jest-dom": "^6.4.2",
    "playwright": "^1.41.1"
  }
}
```

### 1.3 项目目录结构（必须严格遵守）

```
dual-moon-calendar/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                          # 入口
│   ├── App.tsx                           # 根组件
│   ├── index.css                         # Tailwind指令 + 全局样式
│   │
│   ├── engine/                           # ⚙️ 历法引擎（纯函数，无UI依赖）
│   │   ├── constants.ts                  # 天文常量
│   │   ├── types.ts                      # 引擎内部类型
│   │   ├── solar.ts                      # 阳历算法
│   │   ├── lunar-primary.ts              # 主月历算法
│   │   ├── lunar-secondary.ts            # 副月历算法
│   │   ├── astronomical.ts               # 天象计算
│   │   ├── ganZhi.ts                     # 干支计算
│   │   └── index.ts                      # 统一导出CalendarDate类型和转换函数
│   │
│   ├── store/                            # 📦 Zustand状态
│   │   ├── useCalendarStore.ts           # 视图状态（当前年月、选中日期、视图模式）
│   │   └── useEventStore.ts              # 事件CRUD状态
│   │
│   ├── hooks/                            # 🪝 React Hooks
│   │   ├── useCalendarEngine.ts          # 引擎调用封装
│   │   └── useEvents.ts                  # 事件查询封装
│   │
│   ├── components/                       # 🧩 UI组件（原子设计）
│   │   ├── ui/                           # 基础UI原子
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── calendar/                     # 日历特有组件
│   │   │   ├── CalendarGrid.tsx          # 网格容器
│   │   │   ├── GridCell.tsx              # 单元格
│   │   │   ├── WeekdayHeader.tsx         # 星期标题行
│   │   │   ├── Navigation.tsx            # 月份导航
│   │   │   ├── ViewSwitcher.tsx          # 视图切换按钮
│   │   │   └── DetailPanel.tsx           # 详情面板（Master-Detail下半部）
│   │   ├── events/                       # 事件相关组件
│   │   │   ├── EventCard.tsx             # 事件卡片
│   │   │   ├── EventModal.tsx            # 创建/编辑对话框
│   │   │   └── EventList.tsx             # 事件列表
│   │   └── layout/                       # 布局组件
│   │       └── MainLayout.tsx            # 主布局（Header + Content）
│   │
│   ├── utils/                            # 🛠️ 工具函数
│   │   ├── formatters.ts                 # 日期格式化
│   │   ├── validators.ts                 # 输入校验
│   │   └── storage.ts                    # LocalStorage封装
│   │
│   ├── types/                            # 📝 全局TypeScript类型
│   │   ├── calendar.ts                   # CalendarDate等核心类型
│   │   └── events.ts                     # 事件类型定义
│   │
│   └── styles/                           # 🎨 CSS变量
│       └── theme.css                     # Design Tokens
│
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.cjs
├── .prettierrc
├── 历法.md                              # 🔑 权威天文数据源
├── PRD.md                               # 📖 完整产品需求
└── SPEC.md                              # 📋 本文档（技术开发规格）
```

### 1.4 关键配置文件

**tsconfig.json**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**tailwind.config.ts**:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 从theme.css同步的Design Tokens（见第6章）
        accent: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
        },
        event: {
          s: '#EF4444',
          a: '#F97316',
          b: '#F59E0B',
          c: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## 2. 核心数据模型

### 2.1 基础类型定义 (`src/types/calendar.ts`)

> 详细业务背景见 PRD.md 第3章，此处仅保留技术接口。

```typescript
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
```

### 2.2 事件类型定义 (`src/types/events.ts`)

```typescript
import type { AbsoluteDayNumber, SolarDate, LunarPrimaryDate } from './calendar';

// ============================================
// 事件类型枚举
// ============================================
export type EventType = 
  | 'recurring-holiday'      // 周期性节假日（按阳历年重复）
  | 'historical-event'       // 单次历史事件
  | 'astronomical-trigger';  // 天文触发事件（基于天象周期）

// ============================================
// 基础事件接口（所有事件共有字段）
// ============================================
export interface BaseEvent {
  id: string;                    // UUID v4
  title: string;                 // 最大长度50字符
  description: string;           // 最大长度500字符（纯文本V1.0）
  type: EventType;
  createdAt: number;             // Unix timestamp (ms)
  updatedAt: number;
  
  dateAnchor: {
    abs: AbsoluteDayNumber;
    solar?: SolarDate;           // 冗余存储，加速展示
    lunarPrimary?: LunarPrimaryDate;
  };
  
  display: {
    color: string;               // HEX色值（如"#EF4444"）
    isVisible: boolean;
    priority: number;            // 1 - 5（5为最高）
  };
}

// ============================================
// 周期性节假日
// ============================================
export interface RecurringHoliday extends BaseEvent {
  type: 'recurring-holiday';
  recurrence: {
    rule: 'yearly';              // V1.0仅支持按年重复
    anchorMonth: number;         // 阳历月份 (1-12)
    anchorDay: number;           // 阳历日期（动态：29或30）
  };
}

// ============================================
// 单次历史事件
// ============================================
export interface HistoricalEvent extends BaseEvent {
  type: 'historical-event';
  // 无额外字段，仅发生一次
}

// ============================================
// 天文触发事件
// ============================================
export interface AstronomicalTriggerEvent extends BaseEvent {
  type: 'astronomical-trigger';
  trigger: {
    astronomicalType: 'synodic-conjunction' | 'synodic-opposition' | 'lunar-phase';
    condition: string;           // 如"every-3rd-conjunction"
    offsetDays?: number;         // 相对天象偏移天数
  };
}

// ============================================
// 联合类型（外部使用）
// ============================================
export type CalendarEvent = 
  | RecurringHoliday 
  | HistoricalEvent 
  | AstronomicalTriggerEvent;
```

---

## 3. 历法引擎算法规格

> ⚠️ 所有天文常量和物理公式详见 `历法.md` 第1章，本章节仅描述**算法实现步骤**。

### 3.1 引擎常量 (`src/engine/constants.ts`)

```typescript
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
  ABS_ORIGIN: 0,                      // ABS=0 = 公元0年第1天
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
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

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
```

### 3.2 核心算法模块

#### 模块A：绝对日序数 ↔ 阳历转换 (`src/engine/solar.ts`)

**函数签名**：

```typescript
/**
 * 将绝对日序数转换为阳历日期
 * @param abs - 绝对日序数 (0 ≤ abs ≤ 420,752)
 * @returns SolarDate 对象
 * @throws RangeError 当abs超出范围时抛出
 */
export function absToSolar(abs: AbsoluteDayNumber): SolarDate;

/**
 * 将阳历日期转换为绝对日序数（逆运算）
 * @param solar - 阳历日期对象
 * @returns 绝对日序数
 * @throws Error 当日期非法时抛出（如13月、32日）
 */
export function solarToAbs(solar: SolarDate): AbsoluteDayNumber;

/**
 * 判断给定年份是否为闰年
 * @param year - 年份 (0-1200)
 * @returns boolean
 */
export function isLeapYear(year: number): boolean;
```

**算法伪代码**：

```
FUNCTION absToSolar(abs):
  INPUT CHECK:
    IF abs < 0 OR abs > MAX_ABS THEN
      THROW RangeError("ABS超出有效范围")
    END IF
  
  STEP 1: 计算近似年份
    year = FLOOR(abs / TROPICAL_YEAR)  // 向下取整
  
  STEP 2: 年份校正（处理累积误差）
  // 因为每年实际不是精确的350.6266天（而是349或350整数天）
  // 需要逐年前推验证
  WHILE TRUE:
    yearStartAbs = solarToAbs({year, month: 1, day: 1})
    IF yearStartAbs > abs THEN
      year = year - 1
    ELSE
      BREAK
    END IF
  END WHILE
  
  STEP 3: 计算年内偏移量
  dayOfYear = abs - yearStartAbs + 1  // 转换为1-based
  
  STEP 4: 分配月份和日期
  isLeap = isLeapYear(year)
  remainingDays = dayOfYear
  
  FOR month FROM 1 TO 12:
    daysInThisMonth = getDaysInMonth(month, isLeap)
    IF remainingDays <= daysInThisMonth THEN
      RETURN SolarDate {
        year: year,
        month: month,
        day: remainingDays,
        isLeapYear: isLeap,
        dayOfYear: dayOfYear
      }
    END IF
    remainingDays = remainingDays - daysInThisMonth
  END FOR
  
  // 不应到达此处（除非逻辑错误）
  THROW Error("月份分配失败")

END FUNCTION


FUNCTION isLeapYear(year):
  // 规则1：基本8年5闰
  remainder = year % 8
  IF remainder IN [1, 2, 4, 5, 7] THEN
    isBasicLeap = TRUE
  ELSE
    isBasicLeap = FALSE
  END IF
  
  // 规则2：600年长期修正
  IF year % CENTURIAL_CORRECTION_CYCLE == 0 AND isBasicLeap THEN
    RETURN FALSE  // 去掉该闰年
  END IF
  
  RETURN isBasicLeap

END FUNCTION


FUNCTION getDaysInMonth(month: number, isLeap: boolean):
  IF month == 12 AND isLeap THEN
    RETURN 30  // 闰年12月有30天
  ELSE
    RETURN SOLAR_RULES.MONTH_DAYS[month]
  END IF
END FUNCTION


FUNCTION solarToAbs(solar):
  INPUT VALIDATION:
    IF solar.year < 0 OR solar.year > MAX_YEAR THEN
      THROW Error("年份超出范围")
    END IF
    IF solar.month < 1 OR solar.month > 12 THEN
      THROW Error("月份必须在1-12之间")
    END IF
    
    maxDay = getDaysInMonth(solar.month, isLeapYear(solar.year))
    IF solar.day < 1 OR solar.day > maxDay THEN
      THROW Error(`日期必须在1-${maxDay}之间`)
    END IF
  
  STEP 1: 累加之前所有年份的总天数
  totalDays = 0
  FOR y FROM 0 TO solar.year - 1:
    IF isLeapYear(y) THEN
      totalDays = totalDays + DAYS_IN_LEAP_YEAR  // 350
    ELSE
      totalDays = totalDays + DAYS_IN_COMMON_YEAR  // 349
    END IF
  END FOR
  
  STEP 2: 加上当年内之前月份的天数
  isLeap = isLeapYear(solar.year)
  FOR m FROM 1 TO solar.month - 1:
    totalDays = totalDays + getDaysInMonth(m, isLeap)
  END FOR
  
  STEP 3: 加上当月日期（转为0-based）
  totalDays = totalDays + (solar.day - 1)
  
  RETURN totalDays  // 这就是ABS值

END FUNCTION
```

#### 模块B：阳历 ↔ 主月历转换 (`src/engine/lunar-primary.ts`)

**关键参数**：
- 朔望月周期：`SYNODIC_MONTH_PRIMARY = 19.5883` 天
- 大月20天，小月19天
- 平均月长度逼近19.5883的调整规则

**函数签名**：

```typescript
export function solarToLunarPrimary(solar: SolarDate): LunarPrimaryDate;
export function lunarPrimaryToAbs(lunar: LunarPrimaryDate): AbsoluteDayNumber;
```

**算法要点**：

```
FUNCTION solarToLunarPrimary(solar):
  abs = solarToAbs(solar)  // 先转ABS作为桥梁
  
  STEP 1: 近似计算主月数
  approximateMonths = abs / SYNODIC_MONTH_PRIMARY
  
  STEP 2: 应用大小月调整算法
  // 每2个月：1大(20) + 1小(19) = 平均19.5天
  // 每17个月额外增加1个大月，使平均更接近19.5883
  
  // 具体调整逻辑：
  // 设总月数为M
  // 基础循环：每2个月一组 (20+19=39天，平均19.5)
  // 组数 G = FLOOR(M / 2)
  // 余数 R = M % 2
  // 基础天数 = G * 39 + (R === 1 ? 20 : 0)
  // 额外大月数 E = FLOOR(M / 17)  // 每17个月多1个大月
  // 总天数 ≈ 基础天数 + E * 1
  
  // 通过迭代逼近找到正确的月份和日期
  
  STEP 3: 判断闰月（无中气置闰法）
  // 计算该太阳月是否包含"中气"
  // 若某主月内无中气 → 该月为闰月
  // 中气定义：见历法.md（二十四节气中的偶数位节气）
  
  STEP 4: 计算当日月相
  // 月龄 = (abs % SYNODIC_MONTH_PRIMARY) 
  // 根据月龄范围映射到 MoonPhase 枚举：
  //   0-2: NEW_MOON (朔)
  //   3-7: WAXING_CRESCENT (盈月)
  //   8-12: FIRST_QUARTER (上弦，约±2天误差容忍)
  //   13-17: WAXING_GIBBOUS (盈凸)
  //   18-22: FULL_MOON (望)
  //   23-27: WANING_GIBBOUS (亏凸)
  //   28-32: LAST_QUARTER (下弦)
  //   33-38: WANING_CRESCENT (残月)
  //   39+: 接近下一个朔
  
  RETURN LunarPrimaryDate { ... }

END FUNCTION
```

#### 模块C：天文事件计算器 (`src/engine/astronomical.ts`)

**函数签名**：

```typescript
/**
 * 计算给定绝对日序数当天的所有天文事件
 * @param abs - 绝对日序数
 * @returns 按优先级排序的天文事件数组
 */
export function calculateAstronomicalEvents(abs: AbsoluteDayNumber): AstronomicalEvent[];

/**
 * 计算当日潮汐等级
 * 基于双月黄经差角度
 */
export function calculateTideLevel(abs: AbsoluteDayNumber): TideLevel;
```

**算法概要**：

```
FUNCTION calculateAstronomicalEvents(abs):
  events = []
  
  // 1. 二十四节气检测
  solarTerm = detectSolarTerm(abs)
  IF solarTerm THEN
    events PUSH {
      id: `solar-term-${solarTerm.index}`,
      name: solarTerm.name,
      level: 'B',
      category: 'solar-term',
      description: `${solarTerm.name}（二十四节气之第${solarTerm.index}个）`
    }
  END IF
  
  // 2. 主月月相检测
  primaryPhase = calculateMoonPhase(abs, SYNODIC_MONTH_PRIMARY)
  IF primaryPhase IS特殊相位(朔/上弦/望/下弦) THEN
    events PUSH { ... level:'B', category:'moon-phase' ... }
  END IF
  
  // 3. 副月月相检测（降低显示优先级）
  secondaryPhase = calculateMoonPhase(abs, SYNODIC_MONTH_SECONDARY)
  // 类似上述逻辑...
  
  // 4. 双月合朔/冲日检测（S/A级高优事件）
  synodicEvent = detectSynodicEvent(abs)
  IF synodicEvent THEN
    events PUSH {
      level: synodicEvent.type === 'conjunction' ? 'S' : 'A',
      name: synodicEvent.type === 'conjunction' ? '双月合朔日' : '双月冲日',
      ...
    }
  END IF
  
  // 5. 干支纪日节点（每60日循环的特殊日子，如甲子日）
  ganZhiEvent = detectGanZhiSpecial(abs)
  IF ganZhiEvent THEN
    events PUSH { level:'C', ... }
  END IF
  
  // 6. 按优先级排序 (S > A > B > C)
  SORT events BY level_order DESC
  
  RETURN events

END FUNCTION
```

#### 模块D：干支计算 (`src/engine/ganZhi.ts`)

```typescript
/**
 * 根据绝对日序数计算干支纪日
 * 算法：简单的模运算
 * 天干索引 = (abs - 1) % 10  → 映射到 STEMS 数组
 * 地支索引 = (abs - 1) % 12  → 映射到 BRANCHES 数组
 * 循环位置 = (abs - 1) % 60 + 1
 */
export function calculateGanZhi(abs: AbsoluteDayNumber): GanZhiInfo;
```

### 3.3 引擎统一入口 (`src/engine/index.ts`)

```typescript
/**
 * 历法引擎的核心API
 * 所有外部调用通过此文件进行
 */
export function getCalendarDate(abs: AbsoluteDayNumber): CalendarDate {
  // 1. 基础转换
  const solar = absToSolar(abs);
  const lunarPrimary = solarToLunarPrimary(solar);
  const lunarSecondary = /* 类似逻辑 */;
  
  // 2. 星期计算（简单模5运算）
  const week = calculateWeekInfo(abs);
  
  // 3. 干支计算
  const ganZhi = calculateGanZhi(abs);
  
  // 4. 天文事件批量计算
  const astronomicalEvents = calculateAstronomicalEvents(abs);
  const tide = calculateTideLevel(abs);
  
  return {
    abs,
    solar,
    lunarPrimary,
    lunarSecondary,
    week,
    ganZhi,
    astronomicalEvents,
    tide,
  };
}

/**
 * 批量预计算（应用启动时调用）
 * 返回 Map<ABS, CalendarDate> 供O(1)查询
 */
export function precomputeCache(
  startYear: number = 0, 
  endYear: number = 1200
): Map<AbsoluteDayNumber, CalendarDate>;
```

---

## 4. 状态管理架构

### 4.1 Zustand Store 设计

**`src/store/useCalendarStore.ts`** (视图状态):

```typescript
import { create } from 'zustand';
import type { AbsoluteDayNumber, ViewMode } from '@/types/calendar';

interface CalendarState {
  // 当前视图模式
  viewMode: ViewMode;  // 'solar' | 'lunar-primary'
  
  // 当前显示的年月（阳历基准）
  currentYear: number;
  currentMonth: number;  // 1-12
  
  // 选中的日期（ABS）
  selectedAbs: AbsoluteDayNumber | null;
  
  // 详情面板是否展开
  isDetailPanelOpen: boolean;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  navigateMonth: (direction: 'prev' | 'next') => void;
  goToYearMonth: (year: number, month: number) => void;
  selectDate: (abs: AbsoluteDayNumber) => void;
  clearSelection: () => void;
  toggleDetailPanel: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  // 初始状态：公元0年1月1日，阳历视图，无选中
  viewMode: 'solar',
  currentYear: 0,
  currentMonth: 1,
  selectedAbs: null,
  isDetailPanelOpen: false,
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  navigateMonth: (direction) => set((state) => {
    if (direction === 'prev') {
      if (state.currentMonth === 1) {
        return { currentYear: state.currentYear - 1, currentMonth: 12 };
      }
      return { currentMonth: state.currentMonth - 1 };
    } else {
      if (state.currentMonth === 12) {
        return { currentYear: state.currentYear + 1, currentMonth: 1 };
      }
      return { currentMonth: state.currentMonth + 1 };
    }
  }),
  
  goToYearMonth: (year, month) => set({ currentYear: year, currentMonth: month }),
  
  selectDate: (abs) => set({ selectedAbs: abs, isDetailPanelOpen: true }),
  clearSelection: () => set({ selectedAbs: null, isDetailPanelOpen: false }),
  toggleDetailPanel: () => set((state) => ({ isDetailPanelOpen: !state.isDetailPanelOpen })),
}));
```

**`src/store/useEventStore.ts`** (事件CRUD状态):

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';  // LocalStorage持久化
import type { CalendarEvent } from '@/types/events';
import { v4 as uuidv4 } from 'uuid';

interface EventState {
  events: CalendarEvent[];
  
  // CRUD Actions
  addEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  
  // Query Actions
  getEventById: (id: string) => CalendarEvent | undefined;
  getEventsByAbs: (abs: number) => CalendarEvent[];
  getEventsByRange: (startAbs: number, endAbs: number) => CalendarEvent[];
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      
      addEvent: (eventData) => {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: uuidv4(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({ events: [...state.events, newEvent] }));
      },
      
      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((evt) =>
            evt.id === id ? { ...evt, ...updates, updatedAt: Date.now() } : evt
          ),
        }));
      },
      
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((evt) => evt.id !== id),
        }));
      },
      
      getEventById: (id) => {
        return get().events.find((evt) => evt.id === id);
      },
      
      getEventsByAbs: (abs) => {
        return get().events.filter((evt) => {
          // 直接匹配 + 周期性事件展开（简化版：仅检查anchor.abs）
          if (evt.type === 'recurring-holiday') {
            const eventSolar = evt.dateAnchor.solar;
            if (eventSolar && 
                eventSolar.month === /* 当前月的month */ && 
                eventSolar.day === /* 当前日的day */) {
              return true;
            }
          }
          return evt.dateAnchor.abs === abs;
        });
      },
      
      getEventsByRange: (startAbs, endAbs) => {
        return get().events.filter((evt) => {
          const abs = evt.dateAnchor.abs;
          return abs >= startAbs && abs <= endAbs;
        });
      },
    }),
    {
      name: 'dual-moon-calendar-events',  // LocalStorage key
      version: 1,  // 数据迁移版本号
    }
  )
);
```

---

## 5. 组件架构与API

### 5.1 组件依赖关系图

```
App.tsx
 └─ MainLayout
      ├─ Header (Logo + 设置按钮)
      └─ ContentArea
           ├─ Navigation (◀ 年月 ▶ + ViewSwitcher)
           ├─ WeekdayHeader (人天|兽天|...)
           ├─ CalendarGrid (虚拟化列表)
           │    └─ GridCell[] × 35-42个
           │         ├─ Badge (S/A级天象圆点)
           │         ├─ Text (日期数字)
           │         ├─ Label (B级文字标签)
           │         ├─ ColorBar (事件彩色条)
           │         └─ Icon (C级图标)
           └─ DetailPanel (Master-Detail下半部分)
                ├─ DateSummary (阳历/阴历/星期/干支)
                ├─ AstronomicalList (天象列表)
                ├─ EventList (关联事件卡片)
                │    └─ EventCard[] 
                └─ CreateEventButton (+ 创建新事件)

独立Modal层（Portal渲染）：
└─ EventModal (创建/编辑事件对话框)
     ├─ Input (标题)
     ├─ Textarea (描述)
     ├─ RadioGroup (事件类型选择)
     ├─ DynamicFields (根据类型变化的表单)
     └─ ColorPicker (颜色标签)
```

### 5.2 关键组件Props接口

**GridCell.tsx** (最复杂组件，高频渲染):

```typescript
interface GridCellProps {
  date: CalendarDate;              // 完整日期数据（从引擎获取）
  isSelected: boolean;             // 是否被选中
  isToday?: boolean;               // 是否是"今天"（可选功能）
  events: CalendarEvent[];         // 当日关联的事件（从store查询）
  astronomicalEvents: AstronomicalEvent[]; // 当日天象（已在date中）
  onSelect: (abs: AbsoluteDayNumber) => void;
  onHover: (abs: AbsoluteDayNumber | null) => void;
}

// 渲染结构（内部实现）：
// <button role="gridcell" aria-label="...">
//   <Badge position="top-right" />     {/* S级红点 */}
//   <span className="date-number">{day}</span>
//   <Label position="bottom-center" /> {/* B级文字 */}
//   <ColorBar position="bottom" />     {/* 事件横条 */}
//   <Icon position="bottom-left" />    {/* C级图标 */}
// </button>
```

**DetailPanel.tsx**:

```typescript
interface DetailPanelProps {
  date: CalendarDate | null;         // 选中的日期数据（null时收起）
  events: CalendarEvent[];           // 该日的事件列表
  isOpen: boolean;                   // 控制展开/收起动画
  onCreateEvent: () => void;         // 打开创建对话框
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

// 布局要求：
// - 固定高度或max-height（可滚动）
// - 平滑展开动画（max-height transition, 400ms）
// - 内部区域划分清晰（用分隔线或卡片分组）
```

**EventModal.tsx**:

```typescript
interface EventModalProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CalendarEvent>;  // 编辑模式时的预填数据
  anchorDate: CalendarDate;              // 用户点击的日期（自动填充dateAnchor）
  onSubmit: (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

// 交互规范：
// - 居中Modal，背景半透明遮罩（rgba(0,0,0,0.5)）
// - ESC键关闭
// - 焦点陷阱（Tab循环在Modal内部）
// - 提交时前端校验，错误显示在对应字段下方
```

### 5.3 自定义Hooks

**`useCalendarEngine.ts`** (封装引擎调用 + 缓存):

```typescript
function useCalendarEngine() {
  const [cache, setCache] = useState<Map<AbsoluteDayNumber, CalendarDate>>(new Map());
  const [isPrecomputing, setIsPrecomputing] = useState(true);
  
  useEffect(() => {
    // 应用启动时异步预计算全量数据
    async function init() {
      const cacheMap = await precomputeCache(0, 1200);
      setCache(cacheMap);
      setIsPrecomputing(false);
    }
    init();
  }, []);
  
  const getDate = useCallback((abs: AbsoluteDayNumber): CalendarDate | undefined => {
    return cache.get(abs);
  }, [cache]);
  
  const getMonthDates = useCallback((year: number, month: number): CalendarDate[] => {
    // 返回该月所有日期的数组（35-42个元素，含前后月填补空白）
    const startAbs = solarToAbs({ year, month, day: 1 });
    const daysInMonth = getDaysInMonth(month, isLeapYear(year));
    const dates: CalendarDate[] = [];
    
    for (let d = 1; d <= daysInMonth; d++) {
      const date = cache.get(startAbs + d - 1);
      if (date) dates.push(date);
    }
    
    return dates;
  }, [cache]);
  
  return { getDate, getMonthDates, isPrecomputing };
}
```

---

## 6. CSS设计系统Token

> 完整视觉风格 rationale 见 PRD.md 第6章，此处仅提供可直接使用的CSS变量值。

**`src/styles/theme.css`** (在 main.tsx 中最先导入):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* ========================================
     背景色阶（白色护眼主题）
     ======================================== */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  --bg-active: #EEF2FF;  /* 选中态浅靛蓝 */

  /* ========================================
     文字色阶
     ======================================== */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --text-disabled: #D1D5DB;

  /* ========================================
     品牌主题色（Indigo靛蓝系）
     ======================================== */
  --accent-50: #EEF2FF;
  --accent-100: #E0E7FF;
  --accent-200: #C7D2FE;
  --accent-300: #A5B4FC;
  --accent-400: #818CF8;
  --accent-500: #6366F1;  /* 主色调 */
  --accent-600: #4F46E5;  /* Hover态 */
  --accent-700: #4338CA;
  --accent-800: #3730A3;
  --accent-900: #312E81;

  /* ========================================
     功能语义色
     ======================================== */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;

  /* ========================================
     天象标记专用色
     ======================================== */
  --event-S: #EF4444;    /* S级 - 红（双月合朔）*/
  --event-A: #F97316;    /* A级 - 橙（双月冲日）*/
  --event-B: #F59E0B;    /* B级 - 琥珀（节气/月相）*/
  --event-C: #6B7280;    /* C级 - 灰（干支/潮汐）*/

  /* ========================================
     边框与分割线
     ======================================== */
  --border-light: #E5E7EB;
  --border-medium: #D1D5DB;
  --border-focus: #6366F1;

  /* ========================================
     阴影系统
     ======================================== */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-tooltip: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04);

  /* ========================================
     圆角系统
     ======================================== */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* ========================================
     字体系统
     ======================================== */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */

  /* ========================================
     间距系统（8pt Grid）
     ======================================== */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */

  /* ========================================
     动效系统
     ======================================== */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
  
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}

/* ==========================================
   全局基础样式重置
   ========================================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: var(--font-sans);
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
}

/* 焦点可见性（无障碍）*/
:focus-visible {
  outline: 2px solid var(--accent-500);
  outline-offset: 2px;
}

/* 减少动效偏好（前庭障碍用户）*/
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. 开发任务分解（Phase-by-Phase）

### Phase 0: 项目脚手架 (预计1-2小时)

**目标**：可运行的空项目框架

**任务清单**：
- [ ] 使用 `npm create vite@latest . -- --template react-ts` 初始化项目
- [ ] 安装所有 dependencies 和 devDependencies（见第1章package.json）
- [ ] 配置 `tailwind.config.ts`、`postcss.config.js`、`tsconfig.json`（复制第1章内容）
- [ ] 创建目录结构（严格按照1.3节的树形结构创建空文件夹和索引文件）
- [ ] 创建 `src/styles/theme.css` 并在 `main.tsx` 中导入
- [ ] 配置 `.eslintrc.cjs` 和 `.prettierrc`
- [ ] 验证：`npm run dev` 能启动空白页面，`npm run build` 编译通过

**验收标准**：
```bash
✅ npm run dev → 显示空白页面，控制台无报错
✅ npm run build → dist/ 目录生成，无TS类型错误
✅ npm run lint → 0 errors
```

---

### Phase 1: 历法引擎核心 (预计3-5天)

**目标**：所有日期转换算法可用且通过单元测试

**开发顺序**：

#### Step 1.1: 基础常量和类型 (2小时)
- [ ] 实现 `src/engine/constants.ts`（复制第3.1节全部内容）
- [ ] 实现 `src/types/calendar.ts` 和 `src/types/events.ts`（复制第2章全部内容）
- [ ] 编写常量的单元测试（验证数值正确性）

#### Step 1.2: 阳历转换算法 (1天)
- [ ] 实现 `src/engine/solar.ts`：
  - [ ] `isLeapYear()` 函数 + 测试用例（覆盖平年、闰年、600年修正边界）
  - [ ] `getDaysInMonth()` 函数 + 测试
  - [ ] `solarToAbs()` 函数 + 测试（双向验证：A→B→A一致性）
  - [ ] `absToSolar()` 函数 + 测试（重点测试边界：0年1月1日、1200年12月30/31日）
- [ ] **关键测试数据**：
  ```
  absToSolar(0) → { year:0, month:1, day:1, isLeap:false, dayOfYear:1 }
  solarToAbs({year:0, month:1, day:1}) → 0
  isLeapYear(1) → true  (1%8=1 ∈ [1,2,4,5,7])
  isLeapYear(0) → false (0%8=0 ∉ [1,2,4,5,7])
  isLeapYear(600) → false (600%600==0, 即使600%8=0∉闰年余数也需验证)
  ```

#### Step 1.3: 主月历转换算法 (1-2天)
- [ ] 实现 `src/engine/lunar-primary.ts`：
  - [ ] 大小月交替规则（每2月1大1小，每17月额外1大）
  - [ ] 朔望月相位计算（月龄→MoonPhase映射）
  - [ ] `solarToLunarPrimary()` + 测试
- [ ] **难点提示**：无中气置闰法的实现需要先完成Step 1.4的节气计算，可以先硬编码闰月位置，后续迭代优化

#### Step 1.4: 天文事件计算器 (1-2天)
- [ ] 实现 `src/engine/astronomical.ts`：
  - [ ] 二十四节气检测（基于回归年350.6266天的均匀分布）
  - [ ] 月相计算（主月+副月）
  - [ ] 双月合朔/冲日检测（基于会合周期37.1040天）
  - [ ] 潮汐等级计算（双月角度差→Spring/Neap/Normal）
- [ ] 实现 `src/engine/ganZhi.ts`（简单模运算，0.5天可完成）

#### Step 1.5: 引擎集成与缓存 (0.5天)
- [ ] 实现 `src/engine/index.ts`（统一导出`getCalendarDate()`）
- [ ] 实现 `precomputeCache()` 函数（0-1200年全量预计算）
- [ ] 性能测试：预计算耗时应 < 2秒，内存占用 < 100MB

**Phase 1 验收标准**：
```bash
✅ npm run test → engine/ 下所有测试通过，覆盖率 > 90%
✅ 手动验证：getCalendarDate(0) 返回正确的公元0年1月1日完整数据
✅ 手动验证：getCalendarDate(812) 应包含"双月合朔日"S级事件
✅ 性能：precomputeCache() 在3秒内完成
```

---

### Phase 2: UI骨架搭建 (预计2-3天)

**目标**：可见的日历界面，可交互但无真实数据

**开发顺序**：

#### Step 2.1: 基础UI原子组件 (0.5天)
- [ ] `Button.tsx`（支持variant: primary/secondary/ghost/danger, size: sm/md/lg）
- [ ] `Input.tsx`（支持error状态）
- [ ] `Tooltip.tsx`（使用@radix-ui/react-tooltip或自实现）

#### Step 2.2: 布局组件 (0.5天)
- [ ] `MainLayout.tsx`（Header + 两栏ContentArea）
- [ ] 响应式断点适配（Desktop ≥1024px / Tablet / Mobile）

#### Step 2.3: 日历网格组件 (1-1.5天)
- [ ] `Navigation.tsx`（◀ ▶ 按钮 + 年月显示）
- [ ] `WeekdayHeader.tsx`（人天|兽天|碧森天|岩矿天|龙天）
- [ ] `CalendarGrid.tsx`（7列×6行网格容器）
- [ ] `GridCell.tsx`（单元格：日期数字 + 事件标记插槽）
- [ ] `ViewSwitcher.tsx`（阳历 ⇄ 主月历切换按钮）

#### Step 2.4: 详情面板 (0.5天)
- [ ] `DetailPanel.tsx`（Master-Detail下半部分）
- [ ] 展开/收起动画（CSS max-height transition）
- [ ] 信息分区展示（阳历/阴历/星期/干支/天象/事件）

**Phase 2 验收标准**：
```bash
✅ 页面显示完整的月视图网格（42个格子，含前后月填补的灰色日期）
✅ 点击◀▶能切换月份（带滑动动画）
✅ 点击日期格，下方详情面板平滑展开（显示Mock数据即可）
✅ 视图切换按钮可点击（暂时不实现真实切换逻辑）
✅ 响应式：缩窄浏览器窗口至768px以下，布局不崩坏
```

---

### Phase 3: 数据对接与交互完善 (预计2-3天)

**目标**：真实数据驱动UI，完整交互流程可用

**开发顺序**：

#### Step 3.1: 状态管理接入 (0.5天)
- [ ] 实现 `useCalendarStore.ts`（复制第4章代码）
- [ ] 实现 `useEventStore.ts`（含LocalStorage持久化）
- [ ] 所有组件改为从Store读取状态，不再使用本地useState

#### Step 3.2: 引擎Hook封装 (0.5天)
- [ ] 实现 `useCalendarEngine.ts`（见第5.3节）
- [ ] 应用启动时显示Loading界面，预计算完成后隐藏
- [ ] `GridCell` 和 `DetailPanel` 从hook获取真实的 `CalendarDate` 数据

#### Step 3.3: 天象标记渲染 (0.5天)
- [ ] `GridCell` 内部根据 `date.astronomicalEvents` 渲染标记：
  - [ ] S级 → 右上角红色圆点（带pulse动画）
  - [ ] B级 → 底部文字标签（节气名、月相名）
  - [ ] C级 → 仅Tooltip显示
- [ ] 实现 `Tooltip` 内容动态生成（汇总当天所有重要信息）

#### Step 3.4: 视图切换逻辑 (0.5天)
- [ ] 实现"阳历→主月历"的真实切换：
  - [ ] 网格重组（月份名称、日期范围变化）
  - [ ] 选中的ABS保持不变
  - [ ] 详情面板自动更新为主月历格式
  - [ ] 事件数据跟随ABS重新查询并显示

#### Step 3.5: 事件管理系统 (1天)
- [ ] `EventModal.tsx`（创建/编辑对话框）：
  - [ ] 表单字段：标题、描述、类型单选、颜色选择
  - [ ] 动态字段：根据类型显示不同选项（周期性→月份日期，天文触发→条件输入）
  - [ ] 前端校验（实时 + 提交时双重校验）
  - [ ] 二次确认删除对话框
- [ ] `EventCard.tsx` 和 `EventList.tsx`：
  - [ ] 在详情面板底部渲染事件列表
  - [ ] 每个事件显示标题、描述摘要、操作按钮（编辑/删除）

**Phase 3 验收标准**：
```bash
✅ 打开页面后2-3秒内显示公元0年1月的完整日历（含真实天象数据）
✅ 点击任意日期，详情面板显示准确的阳历/阴历/星期/干支/潮汐信息
✅ 鼠标悬停日期格，150ms后显示Tooltip（内容与详情面板一致但更简洁）
✅ 切换到主月历视图，数据显示正确且选中日期不变
✅ 创建一个"测试事件"，刷新页面后事件仍然存在（LocalStorage持久化成功）
✅ 编辑/删除事件功能正常，删除有二次确认
```

---

### Phase 4: 打磨与优化 (预计1-2天)

**目标**：达到生产发布质量

**任务清单**：
- [ ] **性能优化**：
  - [ ] 使用 react-window 或 react-virtuoso 虚拟化网格渲染（仅渲染可见行）
  - [ ] Chrome DevTools Performance面板录制，确保切换月份60fps无掉帧
  - [ ] Lighthouse审计：FCP < 1.5s, LCP < 2.5s, CLS < 0.1
- [ ] **视觉打磨**：
  - [ ] 所有动画曲线调整为 `var(--ease-out-expo)` （Linear风格）
  - [ ] Tooltip、Modal、Panel的阴影和圆角统一使用Design Token
  - [ ] Loading界面设计（Logo + 进度条 + 文字"正在初始化历法引擎..."）
- [ ] **健壮性**：
  - [ ] LocalStorage损坏时的容灾提示和恢复机制
  - [ ] 边界情况测试：1200年最后一天、事件数量达1000个时的性能
  - [ ] 错误边界（Error Boundary）组件，防止白屏
- [ ] **可访问性基础**：
  - [ ] 纯键盘可完成所有操作（Tab/Enter/Esc/方向键）
  - [ ] 所有交互元素有正确的 `aria-label` 和 `role`
  - [ ] 焦点指示器清晰可见（CSS `:focus-visible`）
- [ ] **部署准备**：
  - [ ] `npm run build` 成功，dist/体积 < 250KB (gzipped)
  - [ ] 配置 `vercel.json`（见PRD.md 7.3.1节）
  - [ ] 部署到Vercel，公网可访问

**Phase 4 验收标准**：
```bash
✅ Lighthouse评分：Performance > 90, Accessibility > 90, Best Practices > 90
✅ 包体体积：gzip后 < 250KB
✅ 连续快速点击◀▶ 20次，无明显卡顿或内存泄漏
✅ 手机Chrome访问（User-Agent模拟），可查看日历（降级模式）
✅ Vercel部署成功，URL可公开访问
```

---

## 8. 测试规格

### 8.1 单元测试（Vitest）

**测试文件位置**：`src/__tests__/engine/*.test.ts`

**必须覆盖的关键路径**：

```typescript
// __tests__/engine/solar.test.ts
describe('absToSolar', () => {
  it('应该正确处理纪元起点', () => {
    expect(absToSolar(0)).toEqual({
      year: 0, month: 1, day: 1,
      isLeapYear: false, dayOfYear: 1
    });
  });

  it('应该是solarToAbs的逆运算（随机抽样验证）', () => {
    const testCases = [
      { year: 0, month: 1, day: 1 },
      { year: 1, month: 6, day: 15 },  // 闰年
      { year: 350, month: 12, day: 30 }, // 闰年末日
      { year: 600, month: 3, day: 10 },  // 600年修正边界
      { year: 1200, month: 12, day: 29 }, // 时间范围上限
    ];
    
    for (const tc of testCases) {
      const abs = solarToAbs(tc);
      expect(absToSolar(abs)).toEqual(tc);  // 双向一致性
    }
  });

  it('应该在输入越界时抛出错误', () => {
    expect(() => absToSolar(-1)).toThrow();
    expect(() => absToSolar(999999)).toThrow();  // 超过1200年
  });
});

describe('isLeapYear', () => {
  it('应该正确识别8年5闰规则', () => {
    const leapYears = [1, 2, 4, 5, 7, 9, 10, 12, 13, 15];  // 0-15年内的闰年
    for (const y of leapYears) {
      expect(isLeapYear(y)).toBe(true);
    }
  });

  it('应该正确处理600年长期修正', () => {
    // 600能被600整除，即使满足8年5闰条件也不应为闰年
    expect(isLeapYear(600)).toBe(false);
    // 1200同理
    expect(isLeapYear(1200)).toBe(false);
  });
});
```

### 8.2 组件测试（Testing Library）

**测试文件位置**：`src/__tests__/components/*.test.tsx`

```typescript
// __tests__/components/GridCell.test.tsx
describe('GridCell', () => {
  it('应该在有S级天象时显示红点', () => {
    const mockDate: CalendarDate = {
      // ... 构造包含S级事件的mock数据
      astronomicalEvents: [{
        id: 'synodic-test',
        name: '测试合朔',
        level: 'S',
        category: 'synodic'
      }]
    };
    
    render(<GridCell date={mockDate} {...defaultProps} />);
    expect(screen.getByTestId('badge-S')).toBeInTheDocument();
  });

  it('点击时应该调用onSelect回调', () => {
    const onSelect = jest.fn();
    render(<GridCell date={mockDate} onSelect={onSelect} {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('gridcell'));
    expect(onSelect).toHaveBeenCalledWith(mockDate.abs);
  });
});
```

### 8.3 E2E测试（Playwright）

**测试文件位置**：`e2e/*.spec.ts`

**关键用户旅程**：

```typescript
// e2e/core-flow.spec.ts
test('完整用户旅程：查询日期并创建事件', async ({ page }) => {
  // 1. 等待历法引擎加载完成
  await page.waitForSelector('[data-testid="calendar-grid"]', { timeout: 10000 });
  
  // 2. 点击某个日期
  await page.click('[data-testid="cell-abs-812"]');  // 假设这是合朔日
  
  // 3. 验证详情面板展开
  await expect(page.locator('[data-testid="detail-panel"]')).toBeVisible();
  
  // 4. 验证合朔日标记显示
  await expect(page.locator('text=双月合朔日')).toBeVisible();
  
  // 5. 点击"创建事件"
  await page.click('text=创建新事件');
  
  // 6. 填写表单
  await page.fill('[data-testid="input-title"]', '第一次大典');
  await page.selectOption('[data-testid="select-type"]', 'historical-event');
  
  // 7. 提交
  await page.click('text=创建事件');
  
  // 8. 验证事件出现在详情面板
  await expect(page.locator('text=第一次大典')).toBeVisible();
  
  // 9. 刷新页面验证持久化
  await page.reload();
  await page.click('[data-testid="cell-abs-812"]');
  await expect(page.locator('text=第一次大典')).toBeVisible();
});
```

---

## 9. 交叉引用索引

本SPEC文档在实现过程中可能需要回溯查阅的资料：

| 需求场景 | 查阅文件 | 具体位置 |
|:---------|:---------|:---------|
| **天文常量的物理意义和来源** | `历法.md` | 第1章"历法核心周期的精确计算"表格 |
| **阳历置闰规则的详细推导过程** | `历法.md` | 第2章"平年与闰年规则" |
| **无中气置闰法的具体算法** | `历法.md` | 第2章"主月历"小节的"置闰规则"段落 |
| **副月历的大小月分配细节** | `历法.md` | 第2章"副月历"小节 |
| **星期五天制的文化背景** | `历法.md` | 第2章"星期（周）的定义" |
| **双月合朔/冲日的详细描述** | `历法.md` | 第3章"双月系统独有的历法特殊标记"第1-2条 |
| **产品设计理念和用户画像** | `PRD.md` | 第2章"产品概述" |
| **UI/UX交互流程图** | `PRD.md` | 第6.4节"交互流程图"（Journey 1-3）|
| **组件视觉设计细节** | `PRD.md` | 第6.2节"组件库规格"（Atoms/Molecules/Organisms）|
| **性能KPI和优化策略** | `PRD.md` | 第7.2节"性能优化策略" |
| **版本规划和未来路线图** | `PRD.md` | 第9章"版本迭代路线图" |
| **非功能性需求（安全/国际化/可访问性）** | `PRD.md` | 第8章 |

---

## 附录：快速启动命令清单

对于AI编程助手，可以直接执行以下命令序列开始开发：

```bash
# 1. 初始化项目
npm create vite@latest . -- --template react-ts
cd .

# 2. 安装依赖（复制1.2节的package.json内容后执行）
npm install

# 3. 创建目录结构（按照1.3节的树形结构手动创建或用脚本生成）
# 可选：使用脚本自动创建空文件夹
mkdir -p src/{engine,store,hooks,components/{ui,calendar,events,layout},utils,types,styles,__tests__/{engine,components}}

# 4. 开始Phase 0验收
npm run dev     # 应该看到Vite + React模板页面
npm run build   # 应该编译成功
npm run lint    # 应该0 error

# 5. 开始Phase 1（历法引擎）
# 按照7.1节Step 1.1 - 1.5的顺序逐步实现

# 6. 运行测试
npm run test        # 单元测试
npm run test:e2e    # E2E测试（需要先写playwright配置）

# 7. 生产构建
npm run build       # 生成dist/目录
npm run preview     # 本地预览生产构建
```

---

> **文档结束**  
> **下一步**：将此SPEC.md连同历法.md、PRD.md一同放入项目根目录，启动AI编程助手开始实现！
> 
> **建议提示词**（给Claude Code/Cursor/Copilot）：  
> ```
> "请阅读项目根目录下的SPEC.md、历法.md和PRD.md三份文档，
>  然后按照SPEC.md第7章'开发任务分解'的Phase顺序，
>  从Phase 0（项目脚手架）开始逐步实现双月合历日历系统。
>  每完成一个Phase请暂停，等待我的验收反馈后再继续下一阶段。"
> ```

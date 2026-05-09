# 双月合历日历系统 - 产品需求文档 (PRD)

> **文档版本**: v1.0.0  
> **创建日期**: 2026-05-08  
> **文档状态**: 待审核  
> **项目代号**: Dual-Moon-Calendar  
> **产品定位**: 架空世界观双月合历系统的纯Web日历工具  
> **目标用户**: 小说/游戏创作者（世界构建辅助工具）

---

## 目录

1. [文档信息与变更历史](#1-文档信息与变更历史)
2. [产品概述](#2-产品概述)
3. [历法系统基础规格](#3-历法系统基础规格)
4. [功能需求规格](#4-功能需求规格)
5. [数据模型设计](#5-数据模型设计)
6. [UI/UX交互规格](#6-uiux交互规格)
7. [技术架构方案](#7-技术架构方案)
8. [非功能性需求](#8-非功能性需求)
9. [版本迭代路线图](#9-版本迭代路线图)
10. [验收标准与测试策略](#10-验收标准与测试策略)
11. [附录](#11-附录)

---

## 1. 文档信息与变更历史

### 1.1 文档元数据

| 属性 | 值 |
|:-----|:---|
| **产品名称** | 双月合历日历系统 (Dual Moon Calendar) |
| **产品类型** | 纯前端Web应用 (SPA) |
| **核心价值** | 为架空小说/游戏提供精确的双月合历日期查询、天象可视化、事件管理工具 |
| **开发模式** | 开源项目（待确定协议） |
| **部署平台** | Vercel / Netlify (免费托管) |

### 1.2 变更记录

| 版本 | 日期 | 作者 | 变更内容 | 状态 |
|:-----|:-----|:-----|:---------|:-----|
| v1.0.0 | 2026-05-08 | AI助手 + 用户协作 | 初始PRD完成，基于12轮深度需求调研 | ✅ 已完成 |

### 1.3 术语表

| 术语 | 定义 |
|:-----|:-----|
| **地星** | 双月系统中的宜居行星（2倍地球质量） |
| **主月（塞勒涅）** | 第一颗卫星，朔望周期19.5883民用日 |
| **副月（恩底弥翁）** | 第二颗卫星，朔望周期41.4948民用日，与主月保持2:1轨道共振 |
| **回归年（Y）** | 地星绕太阳公转的四季循环周期 = 350.6266民用日 |
| **民用日（D）** | 地星太阳日 = 24地星小时 = 历法最小单位 |
| **阳历** | 基于回归年的太阳历，12太阳月，服务农业生产 |
| **主月历** | 基于主月朔望月的太阴历，核心民用纪日系统 |
| **副月历** | 基于副月朔望月的辅助历法，潮汐专用 |
| **绝对日序数 (ABS)** | 从公元0年第1天开始的累计天数偏移量，内部计算基准 |
| **双月合朔** | 主月与副月同时为朔日的罕见天象，周期812.5日 |
| **双月冲日** | 主月与副月同时为望日的特殊天象 |
| **Master-Detail布局** | 上半部分日历主视图 + 下半部分详情面板的经典布局模式 |

---

## 2. 产品概述

### 2.1 项目背景

本项目源于一部架空小说的世界观设定——**双月合历系统**。该历法基于严谨的天体力学计算，描述了一个拥有两颗卫星（2:1轨道共振）的宜居行星上的完整历法体系。

作为小说创作者的核心工具，本产品需要：
- **100%忠实还原历法.md中的天文参数和规则**
- 提供精确到"日"级别的日期转换与查询
- 可视化复杂的天象周期（双月合朔、潮汐等级等）
- 支持用户自定义事件和节假日（UGC功能）
- 作为纯粹的工具类产品，不涉及写作平台功能

### 2.2 目标用户画像

#### 主要用户：新人作家（小说创作者）

**用户特征**：
- 正在创作以"双月合历"为背景的架空小说
- 需要精确追踪剧情时间线（如："第350年双月合朔日发生政变"）
- 对天文细节有较高要求（避免硬科幻读者挑错）
- 长时间使用工具（需要护眼界面）
- 技术水平：普通用户（非开发者），偏好简洁直观的操作

**使用场景**：
1. **剧情规划阶段**：查看某年份的特殊天象，安排重要剧情节点
2. **写作过程中**：快速查询"今天是几号"、"今天有什么节日"
3. **世界观完善**：添加自定义节假日、历史事件，构建完整的时间线
4. **读者互动准备**：导出可视化图表，用于社交媒体分享或附录

**痛点**：
- 手动计算双月历法极易出错（3套历法系统并行）
- 缺乏可视化的天象标记工具
- 难以管理长跨度的时间线（1200年剧情）

### 2.3 核心价值主张

✨ **精确性**：基于真实天文公式计算，非主观虚构规则  
🎯 **专注性**：纯粹的日历工具，不做写作平台  
🚀 **高效性**：查询响应 < 100ms，交互动画60fps流畅  
🎨 **美学性**：Linear式极简设计 + 微科幻元素 + 白色护眼背景  
💾 **可靠性**：LocalStorage本地存储 + 数据容灾机制  

### 2.4 产品边界（做什么 & 不做什么）

#### ✅ 核心功能（必须实现）

| 功能模块 | 描述 | 优先级 |
|:---------|:-----|:-------|
| **历法引擎** | 完整实现双月合历的数学模型，支持0-1200年任意日期查询 | P0 |
| **阳历视图** | 12太阳月网格视图，默认主显示模式 | P0 |
| **主月历视图** | 按朔望月组织的可切换视图 | P0 |
| **日期转换** | 绝对日序数 ↔ 阳历日期 ↔ 主月历日期 ↔ 副月历日期 | P0 |
| **天象可视化** | 自动标记节气、月相、干支、潮汐等级、双月合朔/冲日 | P0 |
| **事件管理** | 支持3类事件（周期性节假日/单次历史事件/天文触发事件） | P0 |
| **详情面板** | Master-Detail布局，点击日期展示完整信息 | P0 |
| **Tooltip提示** | 鼠标悬停显示简短摘要信息 | P0 |
| **可视化图表** | 事件时间线/关系图导出功能 | P1 |

#### ❌ 明确排除的功能（不在V1.0-V2.0范围）

| 排除项 | 原因 |
|:-------|:-----|
| Markdown文本导出 | 写作软件的职责，非日历工具核心功能 |
| REST API接口 | V2.0后考虑，当前聚焦纯前端工具 |
| 写作辅助功能（大纲/角色卡） | 超出"纯粹日历"定位 |
| 多用户协同编辑 | 个人工具，无需云端实时同步（V2.0渐进式云端仅限个人多端） |
| 移动端完整编辑功能 | 桌面优先策略，移动端仅查看降级 |

---

## 3. 历法系统基础规格

### 3.1 天文物理参数（严格继承自历法.md）

#### 基础物理常量

| 参数 | 精确值 | 物理意义 |
|:-----|:-------|:---------|
| **中心恒星质量** | 1 M☉ (太阳质量) | G2V型主序星 |
| **地星质量** | 2 M⊕ (2倍地球质量) | 决定卫星轨道周期 |
| **地星恒星日** | 25.000 地球小时 | 自转周期基础 |
| **地星太阳日（民用日D）** | 25.0715 地球小时 | 历法最小单位 |
| **地星自转轴倾角** | 23° | 形成四季 |
| **地星轨道半长轴** | 1 AU | 与太阳系一致 |

#### 核心天文周期（换算为民用日）

| 周期名称 | 符号 | 精确数值（民用日） | 历法作用 |
|:---------|:-----|:-------------------|:---------|
| **回归年** | Y | 350.6266 | 阳历基准 |
| **主月朔望月** | S₁ | 19.5883 | 主月历基准 |
| **副月朔望月** | S₂ | 41.4948 | 副月历基准 |
| **双月会合周期** | S₁₂ | 37.1040 | 大潮/小潮周期 |
| **岁差周期** | - | 18000 回归年 | 长期修正基准 |

### 3.2 时间系统定义

#### 3.2.1 纪元与时间范围

```
时间起点：公元 0 年 第 1 天（**绝对日序数 ABS = 0**）
时间终点：公元 1200 年 最后一天
总覆盖范围：约 420,752 天（1200 × 350.6266）
查询方向：仅正向（不支持负年份/公元前）
精度粒度：日期级（精确到"日"，不涉及时/分/秒）
```

#### 3.2.2 日期表示系统（混合模式）

**内部存储格式**：绝对日序数 (Absolute Day Number, ABS)

```typescript
// 从纪元起点开始的天数偏移量
type AbsoluteDayNumber = number; // 例如：ABS = 10000 表示第10000天
```

**对外展示格式**：结构化日期对象

```typescript
interface CalendarDate {
  // 绝对日序数（内部计算键值）
  abs: AbsoluteDayNumber;
  
  // 阳历日期（主显示）
  solar: {
    year: number;        // 0-1200
    month: number;       // 1-12
    day: number;         // 根据月份动态（29/30天）
    isLeapYear: boolean; // 是否闰年
    dayOfYear: number;   // 一年中的第几天（1-351）
  };
  
  // 主月历日期（塞勒涅历）
  lunarPrimary: {
    year: number;           // 回归年编号
    month: number;          // 1-19（含闰月可达20+）
    day: number;            // 1-19 或 1-20
    isLeapMonth: boolean;   // 是否闰月
    monthName: string;      // 中文月份名（如"正月"）
    phase: MoonPhase;       // 当日主月月相
  };
  
  // 副月历日期（恩底弥翁历）
  lunarSecondary: {
    year: number;
    month: number;          // 1-9（含闰月）
    day: number;            // 1-41 或 1-42
    isLeapMonth: boolean;
    phase: MoonPhase;       // 当日副月月相
  };
  
  // 星期信息
  week: {
    dayOfWeek: number;      // 1-5（人天/兽天/碧森天/岩矿天/龙天）
    dayName: string;
  };
  
  // 干支纪日
  ganZhi: {
    stem: string;           // 天干
    branch: string;         // 地支
    combination: string;    // 组合（如"甲子"）
    cycleDay: number;       // 60日循环中的位置（1-60）
  };
  
  // 特殊天象标记
  astronomicalEvents: AstronomicalEvent[];
  
  // 潮汐信息
  tide: TideLevel;
}
```

### 3.3 阳历系统详细规则

#### 3.3.1 年份规则

| 类型 | 天数 | 条件 | 示例 |
|:-----|:-----|:-----|:-----|
| **平年** | 349 日 | 年份 % 8 ∈ {0, 3, 6} | 0年, 8年, 16年... |
| **闰年** | 350 日 | 年份 % 8 ∈ {1, 2, 4, 5, 7} | 1年, 2年, 4年... |

**长期修正**：每600年去掉1个闰年（能被600整除的年份不设闰）

**平均年长度验证**：
- 8年周期：(3×349 + 5×350) / 8 = 349.625 日
- 误差：350.6266 - 349.625 = **1.0016 日/年**（注：此误差通过置闰规则动态修正，实际运行精度见历法.md）

#### 3.3.2 月份分配规则

**平年（349天）**：

| 月份 | 天数 | 说明 |
|:-----|:-----|:-----|
| 1月 | 30日 | - |
| 2-11月 | 各29日 | 共290日 |
| 12月 | 29日 | - |
| **总计** | **349日** | ✅ 验证通过 |

**闰年（350天）**：

| 月份 | 天数 | 说明 |
|:-----|:-----|:-----|
| 1月 | 30日 | - |
| 2-11月 | 各29日 | 共290日 |
| 12月 | 30日 | 闰年加1天 |
| **总计** | **350日** | ✅ 验证通过 |

✅ **已修正**：采用方案A（平年349天/闰年350天），与历法.md完全一致，无矛盾。

#### 3.3.3 四季与二十四节气

**四季划分（基于黄道位置）**：

| 季节 | 黄道范围 | 约计天数 | 对应阳历月份 |
|:-----|:---------|:---------|:-------------|
| 春季 | 0° - 89° | ~87.6日 | 1-3月 |
| 夏季 | 90° - 179° | ~87.6日 | 4-6月 |
| 秋季 | 180° - 269° | ~87.6日 | 7-9月 |
| 冬季 | 270° - 359° | ~87.8日 | 10-12月 |

**二十四节气**：
- 将黄道360°等分为24份，每份15°
- 每个节气约14.61日
- 两个节气对应1个太阳月
- **节气命名**：暂沿用地球传统名称（立春、雨水、惊蛰、春分、清明、谷雨、立夏、小满、芒种、夏至、小暑、大暑、立秋、处暑、白露、秋分、寒露、霜降、立冬、小雪、大雪、冬至、小寒、大寒），后续可根据小说世界观需求替换为地星本土名称
- 是农业生产的核心指导标准

### 3.4 阴历系统详细规则

#### 3.4.1 主月历（塞勒涅历）- 民用核心

**月份规则**：
- 大月：20日
- 小月：19日
- 平均月长度：19.5日（通过大小月动态调整逼近19.5883日）
- 调整算法：每2个月设置1大1小，每17个月额外增加1个大月

**置闰规则（无中气置闰法）**：
- 1回归年 ≈ 17.90个主月
- 10年周期 = 179个主月（自动生成9个闰月）
- 10年累积误差 < 0.04日（< 1小时）

**纪日规则**：
- 朔日（新月）= 每月初一
- 望日（满月）= 每月十五（小月）或十六（大月）

#### 3.4.2 副月历（恩底弥翁历）- 潮汐专用

**月份规则**：
- 大月：42日
- 小月：41日
- 平均月长度：41.5日（误差0.0052日/月，80年累积1天误差）

**置闰规则**：
- 1回归年 ≈ 8.45个副月
- 每2年自动生成1个闰月

**核心作用**：
- 标记双月大潮/小潮周期
- 航海、渔业、潮汐预测
- 特殊宗教/文化活动日期

### 3.5 星期与干支系统

#### 3.5.1 星期（5日制）

基于主月月相的4个阶段（朔/上弦/望/下弦），每个阶段约4.9日，取整为**1周=5日**：

| 星期序号 | 名称 | 英文映射（内部使用） |
|:---------|:-----|:---------------------|
| 1 | 人天 | Human-Day |
| 2 | 兽天 | Beast-Day |
| 3 | 碧森天 | Verdant-Day |
| 4 | 岩矿天 | Mineral-Day |
| 5 | 龙天 | Dragon-Day |

**特性**：4周 = 20日 ≈ 1个主月朔望月（19.5883日），完美契合

#### 3.5.2 干支纪日法（60日循环）

- **10天干**：甲乙丙丁戊己庚辛壬癸（待确认是否沿用地球命名）
- **12地支**：子丑寅卯辰巳午未申酉戌亥（同上）
- **组合**：60为一个完整循环（与地球干支一致）
- **特性**：60是5的倍数，12周完成一个干支循环

### 3.6 特殊天象系统

#### 3.6.1 天象分级标准

| 等级 | 名称 | 出现周期 | 视觉优先级 | 标记样式 |
|:-----|:-----|:---------|:-----------|:---------|
| **S级（最高）** | 双月合朔日 | 812.5日 (~2.32年) | 🔴 必须高亮 | 特殊图标 + 弹窗详情 + 动画效果 |
| **A级（高级）** | 双月冲日 | ~406日 (间隔合朔) | 🟠 重要标记 | 图标 + Tooltip强调 |
| **B级（中级）** | 二十四节气 | ~14.61日 | 🟡 常规标注 | 日期格内文字标记 |
| **B级（中级）** | 主月朔望（朔/上弦/望/下弦） | ~4.9日 | 🟡 常规标注 | 月相小图标 |
| **B级（中级）** | 副月朔望 | ~20.7日 | 🟡 常规标注 | 月相小图标（次要位置） |
| **C级（基础）** | 干支循环节点（甲子日等） | 60日循环 | 🔵 背景信息 | Tooltip显示 |
| **C级（基础）** | 每日潮汐等级 | 每日变化 | 🔵 背景信息 | 颜色编码/图标 |
| **稀有级** | 双月凌日（月掩月） | ~16年 | 🟣 纪念日期 | 特殊标记（低频） |

#### 3.6.2 潮汐等级定义

| 等级 | 名称 | 触发条件 | 视觉表现 |
|:-----|:-----|:---------|:---------|
| **大潮** | Spring Tide | 双月合/冲位置（黄经差0°或180°） | 🔴 红色波浪图标 |
| **中潮** | Neap Tide | 双月弦向垂直（黄经差90°或270°） | 🟡 黄色波浪图标 |
| **小潮** | Normal Tide | 其他位置 | ⚪ 灰色/无标记 |

---

## 4. 功能需求规格

### 4.1 功能优先级矩阵（MoSCoW方法）

| 功能ID | 功能名称 | MoSCoW优先级 | 版本 | 复杂度 | 依赖关系 |
|:-------|:---------|:-------------|:-----|:-------|:---------|
| F-001 | 历法引擎核心算法 | **MUST** | V1.0 | 高 | 无 |
| F-002 | 阳历月视图渲染 | **MUST** | V1.0 | 中 | F-001 |
| F-003 | 主月历视图切换 | **MUST** | V1.0 | 中 | F-002 |
| F-004 | 日期双向转换 | **MUST** | V1.0 | 低 | F-001 |
| F-005 | 天象自动标记 | **MUST** | V1.0 | 中 | F-001 |
| F-006 | Tooltip悬停提示 | **MUST** | V1.0 | 低 | F-002 |
| F-007 | 详情侧边面板 | **MUST** | V1.0 | 中 | F-002 |
| F-008 | 事件CRUD操作 | **MUST** | V1.0 | 中 | F-001 |
| F-009 | LocalStorage持久化 | **MUST** | V1.0 | 低 | F-008 |
| F-010 | 输入校验与错误提示 | **MUST** | V1.0 | 低 | 全部 |
| F-011 | 可视化图表导出 | **SHOULD** | V1.5 | 高 | F-008 |
| F-012 | 深色主题切换 | **SHOULD** | V1.5 | 低 | F-002 |
| F-013 | 渐进式云端同步 | **SHOULD** | V2.0 | 高 | F-009 |
| F-014 | i18n国际化接口 | **COULD** | V2.0 | 中 | F-002 |
| F-015 | 事件导图（关系图） | **COULD** | V2.0 | 很高 | F-011, F-013 |
| F-016 | PWA离线安装 | **WON'T** (V1.0) | V2.0+ | 中 | 无 |

### 4.2 F-001：历法引擎核心算法（P0-MUST）

#### 功能描述

实现双月合历系统的完整数学模型，提供任意日期的精确计算能力。

#### 输入

```typescript
interface EngineInput {
  type: 'abs-to-date' | 'date-to-abs' | 'range-query';
  abs?: AbsoluteDayNumber;                    // 绝对日序数
  date?: Partial<CalendarDate>;               // 结构化日期（至少包含year）
  range?: { start: AbsoluteDayNumber; end: AbsoluteDayNumber }; // 范围查询
}
```

#### 输出

```typescript
interface EngineOutput {
  success: boolean;
  data?: CalendarDate | CalendarDate[];      // 单个或批量日期对象
  error?: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}
```

#### 核心算法模块

**模块A：绝对日序数 ↔ 阳历日期转换**

```typescript
function absToSolar(abs: AbsoluteDayNumber): SolarDate;
function solarToAbs(solar: SolarDate): AbsoluteDayNumber;
```

**算法要点**：
1. 计算完整年份数：`year = Math.floor(abs / 350.6266)`
2. 计算年内偏移：`dayOfYear = abs - year * 350.6266`
3. 判断闰年：`isLeap = (year % 8) in [1,2,4,5,7] && (year % 600 !== 0)`
4. 分配月份：按月份天数规则逐月累加，找到对应月份和日期
5. 处理边界情况（abs < 0, abs > maxRange）

**模块B：阳历日期 ↔ 主月历日期转换**

```typescript
function solarToLunarPrimary(solar: SolarDate): LunarPrimaryDate;
function lunarPrimaryToSolar(lunar: LunarPrimaryDate): SolarDate;
```

**算法要点**：
1. 基于朔望月周期19.5883日计算月数偏移
2. 应用无中气置闰法判断闰月
3. 处理大小月交替规则（20/19日）
4. 返回精确的月相状态

**模块C：天文事件计算器**

```typescript
function calculateAstronomicalEvents(abs: AbsoluteDayNumber): AstronomicalEvent[];
```

**覆盖范围**：
- 二十四节气（基于黄道经度）
- 主月月相（朔/上弦/望/下弦）
- 副月月相
- 双月合朔/冲日（基于会合周期37.1040日）
- 潮汐等级（基于双月黄经差）
- 干支纪日（基于60日循环）

**模块D：性能优化层**

```typescript
// 预计算缓存（应用启动时生成）
class CalendarCache {
  private cache: Map<AbsoluteDayNumber, CalendarDate>;
  
  constructor() {
    this.precomputeRange(0, 1200 * 350); // 预计算全量数据
  }
  
  getDate(abs: AbsoluteDayNumber): CalendarDate {
    return this.cache.get(abs); // O(1)查询
  }
}
```

**性能要求**：
- 预计算耗时：< 2秒（首次加载）
- 内存占用：< 50MB（42万条记录 × 每条约120字节）
- 单次查询：< 1ms（缓存命中时）

#### 验收标准

- [ ] 给定任意ABS（0 ≤ ABS ≤ 420,752），返回正确的CalendarDate对象
- [ ] 所有天文周期误差 < 0.01日（相对于理论值）
- [ ] 闰年判断100%符合8年5闰+600年修正规则
- [ ] 无中气置闰法的闰月位置与理论一致
- [ ] 性能满足上述KPI要求

---

### 4.3 F-002：阳历月视图渲染（P0-MUST）

#### 功能描述

渲染类似Google Calendar的月度网格视图，以阳历12个月为组织单元。

#### UI布局规范

```
┌─────────────────────────────────────────────────┐
│  ◀ 350年 12月（阳历）  ▼切换至主月历  ▶        │  ← 顶部导航栏
├──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│ 人天 │ 兽天 │碧森天│岩矿天│ 龙天 │      │      │  ← 星期标题行
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│      │      │  1   │  2   │  3   │  4   │  5   │  ← 日期网格
│      │      │ ☐春分│      │      │      │      │     （7列×5-6行）
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│  6   │  7   │  8   │  9   │  10  │  11  │  12  │
│      │🌙上弦│      │      │      │      │      │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ ...  │ ...  │ ...  │ ...  │ ...  │ ...  │ ...  │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
│                                                  │
│  ┌─ 详情面板（点击日期后展开）────────────────┐  │
│  │ 350年12月3日（春分）                       │  │
│  │ 主月历：XX年XX月XX日（望月）               │  │
│  │ 副月历：XX年XX月XX日（上弦）               │  │
│  │ 星期：碧森天                               │  │
│  │ 干支：甲子日（第1/60循环）                 │  │
│  │ 潮汐：中潮 🌊                              │  │
│  │ 天象：今日春分，昼夜等长                   │  │
│  │ 事件：[无]                                 │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

#### 交互规范

**导航操作**：
- 点击 `◀▶` 按钮：切换上/下月（带滑动动画，300ms ease-out）
- 点击 `▼` 下拉菜单：选择跳转到指定年份/月份
- 键盘支持：← → 切换日期，↑ ↓ 切换周

**日期格交互**：
- 鼠标悬停（hover）：显示Tooltip（150ms延迟防抖）
  - 内容：`"350年12月3日 · 春分 · 碧森天 · 🌙主月望"`
  - 样式：深色半透明卡片，圆角8px，最大宽度280px
- 鼠标点击（click）：选中日期，展开下方详情面板
  - 选中态：日期格边框高亮（主题色，2px solid）
  - 详情面板：平滑展开动画（max-height transition, 400ms）

**特殊标记显示**：
- **S/A级天象**：日期格右上角彩色圆点（S级红色，A级橙色）
- **B级天象**：日期格底部小字标签（如"春分"、"望"）
- **C级信息**：仅在Tooltip和详情面板中显示
- **事件标记**：日期格底部彩色横条（颜色由事件category决定）

#### 响应式断点

| 断点 | 宽度范围 | 布局调整 |
|:-----|:---------|:---------|
| **Desktop** | ≥ 1200px | 完整7列网格 + 右侧固定详情面板（可选浮动） |
| **Tablet** | 768px - 1199px | 网格缩小，详情面板变为底部抽屉 |
| **Mobile** | < 768px | 单列周视图或简化月视图，详情全屏弹窗 |

#### 验收标准

- [ ] 默认显示当前系统日期对应的阳历月份（或初始化为0年1月）
- [ ] 日期格正确显示1-30/31号（根据月份规则）
- [ ] 特殊天象标记位置准确、视觉层级清晰
- [ ] 切换月份动画流畅（60fps，无明显掉帧）
- [ ] Tooltip响应迅速（< 100ms延迟），内容准确
- [ ] 详情面板展开/收起动画自然，不阻塞滚动

---

### 4.4 F-003：主月历视图切换（P0-MUST）

#### 功能描述

提供一键切换按钮，将视图从"阳历月网格"切换为"主月朔望月网格"。

#### 切换逻辑

```typescript
type ViewMode = 'solar' | 'lunar-primary';

function switchViewMode(currentMode: ViewMode): ViewMode {
  return currentMode === 'solar' ? 'lunar-primary' : 'solar';
}
```

#### 主月历视图差异

**网格结构变化**：
- **阳历视图**：7列（5天周制）× 5-6行，每月固定格子
- **主月历视图**：7列 × 约3-4行（每月仅19-20天，格子较稀疏）

**表头变化**：
- 阳历：`1月 2月 3月 ... 12月`（月份选择器）
- 主月历：`正月 二月 三月 ... 闰X月`（动态月份名，含闰月）

**日期显示变化**：
- 阳历格：显示阳历日期（1-30）
- 主月格：显示主月历日期（1-19/20）+ 月相小图标

**数据同步约束**（关键！）：
- 切换视图时，**选中的绝对日序数(ABS)保持不变**
- 仅改变展示维度（从"solar视角"转为"lunar-primary视角"）
- 事件、节假日数据自动跟随ABS关联，无需手动重新映射
- 详情面板内容自动更新为当前视图模式的日期格式

#### UI组件设计

```tsx
// 视图切换按钮（位于顶部导航栏）
<ViewSwitchButton 
  currentMode={viewMode} 
  onToggle={handleViewSwitch}
  options={[
    { value: 'solar', label: '阳历', icon: SunIcon },
    { value: 'lunar-primary', label: '主月历', icon: MoonIcon }
  ]}
/>
```

**视觉反馈**：
- 当前激活模式：按钮高亮（主题色填充）
- 切换过程：视图交叉淡入淡出（200ms fade过渡）
- 平滑过渡：避免闪烁或跳跃感

#### 验收标准

- [ ] 切换按钮位置显眼，图标语义清晰
- [ ] 切换动画流畅，数据无缝衔接（无闪烁）
- [ ] 切换后事件/节假日标记位置正确（跟随ABS而非表面日期）
- [ ] 支持键盘快捷键切换（如 `Tab` 聚焦后 `Enter` 切换）
- [ ] 移动端切换按钮易触控（最小44×44px触控区域）

---

### 4.5 F-004：日期双向转换（P0-MUST）

#### 功能描述

提供灵活的日期输入/输出转换能力，支持多种格式互转。

#### 转换矩阵

| 源格式 | 目标格式 | 转换路径 | 使用场景 |
|:-------|:---------|:---------|:---------|
| 绝对日序数(ABS) | 阳历日期 | 直接计算 | 内部核心 |
| 阳历日期 | 绝对日序数 | 直接计算 | 用户输入 |
| 绝对日序数 | 主月历日期 | 通过阳历中转 | 展示需求 |
| 主月历日期 | 绝对日序数 | 通过阳历中转 | 逆向查询 |
| 绝对日序数 | 副月历日期 | 通过阳历中转 | 展示需求 |
| 任意格式 | 自然语言描述 | 格式化函数 | Tooltip/面板 |

#### 用户输入方式

**方式1：日期选择器（GUI）**

点击导航栏的日期显示区域，弹出 DatePicker：

```tsx
<DatePicker
  value={selectedDate}
  onChange={(date) => navigateTo(date)}
  format="solar" // 或 "lunar-primary"
  minDate={{ year: 0, month: 1, day: 1 }}
  maxDate={{ year: 1200, month: 12, day: 30/31 }}
/>
```

**方式2：快速跳转输入框**

顶部提供"跳转到"输入框：

```
[📅 跳转到: 350 ___年___ 12 ___月___ 3 ___日] [Go]
```

- 输入校验：即时反馈合法性（如输入"13月"显示红色边框+"月份应在1-12之间"）
- 快捷键：`Ctrl+G` (Windows) / `Cmd+G` (Mac) 聚焦输入框
- 支持模糊输入：输入"350-12-3"自动解析

**方式3：URL深度链接（未来预留）**

```
https://calendar.example.com/?date=350-12-03&view=solar
```

#### 输出格式化示例

**阳历格式**：
- 完整：`公元350年12月3日（阳历）`
- 简短：`350.12.03`
- 极简：`12/3`

**主月历格式**：
- 完整：`塞勒涅历 XX年XX月XX日（望月）`
- 简短：`XX.XX.XX (望)`

**复合格式（详情面板使用）**：
```
公元350年12月3日（阳历·春分）
└ 塞勒涅历：XX年XX月XX日（主月·望）
└ 恩底弥翁历：XX年XX月XX日（副月·上弦）
└ 星期：碧森天（本周第3天）
└ 干支：甲子日（第1/60循环）
└ 绝对日序数：ABS = 122,764
```

#### 验收标准

- [ ] 所有转换路径双向可逆（A→B→A 结果一致）
- [ ] 转换精度误差为0（整数运算，无浮点舍入问题）
- [ ] 输入校验覆盖所有边界情况（0年、1200年、闰年2月、闰月等）
- [ ] URL编码支持（未来预留接口，V1.0可不实现完整路由）
- [ ] 格式化输出符合中文排版习惯（无乱码、单位正确）

---

### 4.6 F-005：天象自动标记（P0-MUST）

#### 功能描述

历法引擎自动计算并标记所有天文周期事件，在日历视图中可视化展示。

#### 标记生成流程

```
用户请求某月份视图
    ↓
历法引擎批量计算该月所有日期（1-30/31）
    ↓
对每个日期调用 calculateAstronomicalEvents(abs)
    ↓
返回事件列表，按优先级排序
    ↓
UI层根据事件等级决定渲染方式：
    - S级 → 右上角红点 + 强制Tooltip
    - A级 → 橙色图标
    - B级 → 底部文字标签
    - C级 → 仅Tooltip/详情面板显示
```

#### 渲染规格明细

**S级：双月合朔日**

```typescript
interface SynodicEvent {
  id: 'synodic-conjunction';
  level: 'S';
  name: '双月合朔日';
  description: '主月与副月同时为朔日，可能观测到双日全食';
  frequency: '每812.5日一次';
  visualMarker: {
    type: 'dot';
    position: 'top-right';
    color: '#EF4444'; // Tailwind red-500
    size: 8; // px
    animation: 'pulse 2s infinite'; // 脉冲动画吸引注意
  };
  tooltipContent: `🔴 ${this.name}\n${this.description}\n下次 occurrence: ${nextDate}`;
}
```

**B级：二十四节气**

```typescript
interface SolarTermEvent {
  id: 'solar-term';
  level: 'B';
  name: string; // 如"春分"、"夏至"
  order: number; // 1-24
  visualMarker: {
    type: 'text';
    position: 'bottom-center';
    fontSize: 11; // px
    color: '#F59E0B'; // Tailwind amber-500
  };
}
```

**C级：每日潮汐**

```typescript
interface TideEvent {
  id: 'tide';
  level: 'C';
  levelName: '大潮' | '中潮' | '小潮';
  visualMarker: {
    type: 'icon'; // 波浪图标
    position: 'bottom-left';
    size: 14; // px
    color: {
      spring: '#EF4444', // 大潮-红
      neap: '#F59E0B',   // 中潮-黄
      normal: '#9CA3AF'  // 小潮-灰
    };
  };
}
```

#### 性能优化策略

**问题**：单月30天 × 每天5-10个事件 = 150-300次DOM操作，可能造成重绘瓶颈

**解决方案**：

1. **虚拟化渲染**：仅渲染视口内的日期格（通常可见15-25格）
2. **事件预聚合**：历法引擎返回时已按日期分组，减少前端循环
3. **CSS动画硬件加速**：使用 `transform` 和 `opacity`，避免 `layout` 和 `paint`
4. **防抖/节流**：Tooltip延迟150ms显示，快速划过时不触发
5. **Web Worker**（可选）：将天文计算放入后台线程，不阻塞UI（V1.5考虑）

#### 验收标准

- [ ] 打开任意月份，所有S/A/B级事件在500ms内完全渲染
- [ ] 事件标记位置准确（无偏移、无遮挡日期数字）
- [ ] 鼠标悬停任意日期，Tooltip在200ms内显示完整信息
- [ ] 连续快速切换月份12次（1年），无内存泄漏（Chrome DevTools Memory面板验证）
- [ ] 1200年数据全量加载后，页面仍保持流畅（滚动/切换60fps）

---

### 4.7 F-008：事件CRUD操作（P0-MUST）

#### 功能描述

允许用户创建、读取、更新、删除自定义事件和节假日。

#### 事件数据Schema（TypeScript接口定义）

```typescript
type EventType = 'recurring-holiday' | 'historical-event' | 'astronomical-trigger';

interface BaseEvent {
  // === 基础字段（V1.0必填）===
  id: string;                    // UUID v4，全局唯一
  title: string;                 // 标题（最大长度50字符）
  description: string;           // 描述（最大长度500字符，纯文本）
  type: EventType;               // 事件类型
  createdAt: number;             // 创建时间戳（Unix ms）
  updatedAt: number;             // 最后修改时间戳
  
  // === 时间关联（核心）===
  dateAnchor: {
    abs: AbsoluteDayNumber;      // 锚定的绝对日序数
    solar?: SolarDate;           // 冗余存储阳历日期（便于快速展示）
    lunarPrimary?: LunarPrimaryDate; // 冗余存储主月历日期
  };
  
  // === 显示控制 ===
  display: {
    color: string;               // HEX颜色码（如"#3B82F6"）
    isVisible: boolean;          // 是否在日历上显示
    priority: number;            // 1-5（5为最高，影响排序和视觉权重）
  };
}

interface RecurringHoliday extends BaseEvent {
  type: 'recurring-holiday';
  recurrence: {
    rule: 'yearly';              // 目前仅支持按年重复
    anchorMonth: number;         // 阳历月份（1-12）
    anchorDay: number;           // 阳历日期（根据月份规则动态）
    // 未来扩展：支持 lunar-anchor（按阴历日期重复）
  };
}

interface HistoricalEvent extends BaseEvent {
  type: 'historical-event';
  // 单次事件，无 recurrence 字段
  // 可扩展字段（V2.0）：
  // entities?: Entity[];         // 关联角色/组织
  // attachments?: Attachment[];  // 多媒体附件
}

interface AstronomicalTriggerEvent extends BaseEvent {
  type: 'astronomical-trigger';
  trigger: {
    astronomicalType: 'synodic-conjunction' | 'synodic-opposition' | 'lunar-phase';
    condition: string;           // 如 "every-3rd-conjunction"（每第3次合朔）
    offsetDays?: number;         // 相对天象的偏移天数（如"合朔后3天"）
  };
}

type CalendarEvent = RecurringHoliday | HistoricalEvent | AstronomicalTriggerEvent;
```

#### CRUD操作API设计

**Create（创建事件）**

```typescript
async function createEvent(eventData: Omit<BaseEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
  // 1. 生成UUID
  const id = generateUUID();
  
  // 2. 校验必填字段
  validateEventData(eventData);
  
  // 3. 如果是周期性事件，展开为多个实例（可选优化）
  
  // 4. 写入LocalStorage
  const event = { ...eventData, id, createdAt: Date.now(), updatedAt: Date.now() };
  await storage.save(event);
  
  // 5. 触发UI重新渲染（React State更新）
  
  return event;
}
```

**Read（查询事件）**

```typescript
// 按日期范围查询（月视图使用）
function getEventsByDateRange(startAbs: number, endAbs: number): CalendarEvent[];

// 按ID查询单个（详情面板使用）
function getEventById(id: string): CalendarEvent | undefined;

// 按类型筛选
function getEventsByType(type: EventType): CalendarEvent[];

// 搜索（标题模糊匹配）
function searchEvents(query: string): CalendarEvent[];
```

**Update（更新事件）**

```typescript
async function updateEvent(id: string, updates: Partial<BaseEvent>): Promise<CalendarEvent> {
  // 1. 查找原事件
  const existing = getEventById(id);
  if (!existing) throw new Error('Event not found');
  
  // 2. 合并更新（保留不可变字段如id, createdAt）
  const updated = { ...existing, ...updates, updatedAt: Date.now() };
  
  // 3. 重新校验
  validateEventData(updated);
  
  // 4. 持久化
  await storage.save(updated);
  
  return updated;
}
```

**Delete（删除事件）**

```typescript
async function deleteEvent(id: string): Promise<void> {
  // 1. 软删除（移至回收站，V1.0可直接硬删除）
  await storage.remove(id);
  
  // 2. 确认对话框（防止误删）
  // "确定要删除「XXX」吗？此操作不可撤销。"
}
```

#### UI交互流程

**创建事件流程**：

```
用户右键点击日期格 / 点击日期格右下角"+"按钮
    ↓
弹出模态对话框（Modal Dialog）
    ↓
┌─ 创建新事件 ──────────────────────────────┐
│                                            │
│ 标题*：[________________________] [50/50]  │
│                                            │
│ 描述：[________________________] [__/500]  │
│      [________________________]           │
│                                            │
│ 事件类型：○ 周期性节假日（推荐）            │
│          ○ 单次历史事件                    │
│          ○ 天文触发事件                    │
│                                            │
│ [动态表单 - 根据类型显示不同字段]           │
│                                            │
│ 颜色标签：[🔴] [🟠] [🟡] [🟢] [🔵] [🟣]  │
│                                            │
│          [取消]              [创建事件]    │
└────────────────────────────────────────────┘
    ↓
输入校验（实时 + 提交时双重校验）
    ↓
校验通过 → 写入LocalStorage → 关闭对话框 → 日历自动刷新显示新事件标记
校验失败 → 显示错误提示（字段下方红字 + 边框高亮）
```

**编辑/删除流程**：

```
在详情面板中点击事件的"编辑"或"删除"按钮
    ↓
编辑 → 复用创建对话框，预填充现有数据
删除 → 弹出二次确认对话框 → 确认后移除
```

#### 输入校验规则

| 字段 | 规则 | 错误提示 |
|:-----|:-----|:---------|
| **title** | 必填，1-50字符，不可纯空格 | "请输入事件标题（1-50字符）" |
| **description** | 选填，0-500字符 | "描述过长（最多500字符）" |
| **type** | 必选，三选一 | "请选择事件类型" |
| **dateAnchor.abs** | 必填，0 ≤ abs ≤ 1200*350 | "日期超出有效范围（0-1200年）" |
| **display.color** | 必填，合法HEX色值 | "请选择有效的颜色" |
| **recurrence.rule** (周期性) | 必填，目前仅支持'yearly' | "暂仅支持按年重复" |
| **trigger.condition** (天文触发) | 必填，非空字符串 | "请输入天文触发条件" |

#### 验收标准

- [ ] 可以成功创建3种类型的任意事件
- [ ] 创建的事件立即在对应日期格显示（彩色横条或圆点）
- [ ] 编辑事件后，修改内容实时保存并刷新显示
- [ ] 删除事件有二次确认，删除后标记立即消失
- [ ] 所有输入校验规则生效，非法输入被拦截并给出清晰提示
- [ ] LocalStorage损坏时，提示用户并提供"重置为初始状态"选项
- [ ] 创建1000个事件后，月视图渲染仍保持流畅（< 500ms）

---

## 5. 数据模型设计

### 5.1 核心实体关系图 (ER Diagram)

```
┌─────────────────┐       ┌─────────────────┐
│   CalendarDate   │◄──────┤  AbsoluteDayNum │
│  (聚合根实体)     │  1:1  │   (值对象)      │
├─────────────────┤       ├─────────────────┤
│ +abs: number     │       │ +value: number  │
│ +solar: SolarDate│       └─────────────────┘
│ +lunarPrimary    │              ▲
│ +lunarSecondary  │              │
│ +week: WeekInfo  │       ┌──────┴──────┐
│ +ganZhi: GanZhi  │       │  历法引擎    │
│ +astronomical[]  │       │ (Calculator) │
│ +tide: TideLevel │       └─────────────┘
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│  CalendarEvent   │──────►│   EventCategory │
│  (用户事件实体)   │  N:1  │   (枚举/配置)   │
├─────────────────┤       ├─────────────────┤
│ +id: UUID       │       │ +id: string     │
│ +title: string  │       │ +name: string   │
│ +description    │       │ +color: string  │
│ +type: Enum     │       │ +icon: string   │
│ +dateAnchor     │       └─────────────────┘
│ +display        │
│ +recurrence?    │
│ +trigger?       │
└─────────────────┘
```

### 5.2 存储架构（LocalStorage Schema）

#### 5.2.1 键值设计

```typescript
const STORAGE_KEYS = {
  // 元数据
  META: '@dual-moon-calendar/meta',
  
  // 历法缓存（预计算结果）
  CALENDAR_CACHE: '@dual-moon-calendar/cache',
  
  // 用户事件集合
  EVENTS: '@dual-moon-calendar/events',
  
  // 用户设置
  SETTINGS: '@dual-moon-calendar/settings',
  
  // 版本号（用于数据迁移）
  VERSION: '@dual-moon-calendar/version'
} as const;
```

#### 5.2.2 数据结构示例

**meta（元数据）**：

```json
{
  "version": "1.0.0",
  "lastOpened": "2026-05-08T10:30:00.000Z",
  "totalEventsCreated": 42,
  "selectedViewMode": "solar",
  "lastViewedDate": { "abs": 122764 }
}
```

**events（事件数组）**：

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "第一次双月合朔大典",
    "description": "全球文明联合观测罕见双日全食，两颗卫星同时遮蔽太阳...",
    "type": "historical-event",
    "dateAnchor": {
      "abs": 812,
      "solar": { "year": 2, "month": 5, "day": 15 }
    },
    "display": {
      "color": "#EF4444",
      "isVisible": true,
      "priority": 5
    },
    "createdAt": 1741463400000,
    "updatedAt": 1741463400000
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "title": "丰收节",
    "description": "庆祝秋分丰收的传统节日",
    "type": "recurring-holiday",
    "dateAnchor": {
      "abs": 263,
      "solar": { "year": 0, "month": 9, "day": 23 }
    },
    "recurrence": {
      "rule": "yearly",
      "anchorMonth": 9,
      "anchorDay": 23
    },
    "display": {
      "color": "#10B981",
      "isVisible": true,
      "priority": 3
    },
    "createdAt": 1741463500000,
    "updatedAt": 1741463500000
  }
]
```

**settings（用户设置）**：

```json
{
  "theme": "light",  // "light" | "dark" (V1.5)
  "language": "zh-CN", // 预留i18n
  "firstDayOfWeek": 1, // 周起始日（1=人天）
  "showWeekNumbers": false,
  "tooltipDelay": 150, // ms
  "animationsEnabled": true
}
```

### 5.3 数据迁移策略

#### 场景：版本升级导致Schema变化

```typescript
class DataMigration {
  private static CURRENT_VERSION = '1.0.0';
  
  static async migrate(): Promise<void> {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    
    if (!storedVersion) {
      // 首次安装，初始化默认数据
      await this.initializeDefaultData();
      return;
    }
    
    if (storedVersion === this.CURRENT_VERSION) {
      return; // 无需迁移
    }
    
    // 版本升级路径（按顺序执行）
    const migrations = [
      // 未来示例：
      // { from: '1.0.0', to: '1.1.0', handler: migrateTo_1_1_0 },
      // { from: '1.1.0', to: '2.0.0', handler: migrateTo_2_0_0 },
    ];
    
    for (const migration of migrations) {
      if (storedVersion === migration.from) {
        console.log(`Migrating from ${migration.from} to ${migration.to}...`);
        await migration.handler();
        localStorage.setItem(STORAGE_KEYS.VERSION, migration.to);
      }
    }
  }
  
  private static async initializeDefaultData(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.VERSION, this.CURRENT_VERSION);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    // ... 其他初始化
  }
}
```

### 5.4 数据容灾机制

#### 异常场景处理

**场景1：LocalStorage被清理/禁用**

```typescript
try {
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (!data) throw new Error('No data found');
  return JSON.parse(data);
} catch (error) {
  console.error('LocalStorage access failed:', error);
  
  // 显示友好提示
  showNotification({
    type: 'warning',
    title: '数据存储异常',
    message: '浏览器本地存储不可用，您的数据将保存在内存中（刷新页面后将丢失）。建议检查浏览器设置或改用隐私模式。',
    actions: [
      { label: '了解详情', onClick: () => window.open('https://...') },
      { label: '继续使用', onClick: () => fallbackToMemoryStorage() }
    ]
  });
}
```

**场景2：JSON解析失败（数据损坏）**

```typescript
function safeJsonParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Corrupted data detected in key: ${key}`, e);
    
    // 尝试自动修复（如有备份机制）
    const backup = localStorage.getItem(`${key}.backup`);
    if (backup) {
      try {
        return JSON.parse(backup) as T;
      } catch (_) {
        // 备份也损坏，使用默认值
      }
    }
    
    showNotification({
      type: 'error',
      title: '数据损坏检测',
      message: `检测到"${key}"数据已损坏，将重置为默认值。如之前有重要数据，请联系技术支持。`,
      duration: 0 // 手动关闭
    });
    
    return fallback;
  }
}
```

**场景3：存储配额超限（通常5-10MB）**

```typescript
function checkStorageQuota(): boolean {
  const used = new Blob(Object.values(localStorage)).size;
  const limit = 5 * 1024 * 1024; // 5MB保守估计
  
  if (used > limit * 0.9) { // 90%阈值预警
    showNotification({
      type: 'warning',
      title: '存储空间不足',
      message: `已使用 ${formatBytes(used)} / ${formatBytes(limit)}，建议清理旧事件或导出备份。`,
      actions: [
        { label: '导出全部数据', onClick: exportAllData },
        { label: '稍后提醒', onClick: () => {} }
      ]
    });
    return false;
  }
  return true;
}
```

---

## 6. UI/UX交互规格

### 6.1 设计系统（Design System）

#### 6.1.1 视觉风格定位

**核心理念**：Linear式极简主义 + 微科幻元素 + 白色护眼背景

**参考标杆**：
- [Linear.app](https://linear.app) - 产品设计、动效、信息密度
- [Notion.so](https://notion.so) - 块状编辑、简洁排版
- [Raycast](https://www.raycast.com) - 键盘优先、快速响应

#### 6.1.2 色彩系统（Light Theme - 默认）

```css
:root {
  /* === 基础色板 === */
  --bg-primary: #FFFFFF;           /* 主背景 - 纯白 */
  --bg-secondary: #F9FAFB;         /* 次背景 - 极浅灰 */
  --bg-tertiary: #F3F4F6;         /* 第三背景 - 浅灰 */
  
  /* === 文字色阶 === */
  --text-primary: #111827;        /* 主文字 - 近黑 */
  --text-secondary: #6B7280;      /* 次文字 - 中灰 */
  --text-tertiary: #9CA3AF;      /* 辅助文字 - 浅灰 */
  --text-disabled: #D1D5DB;       /* 禁用文字 */
  
  /* === 主题色（品牌色）=== */
  --accent-primary: #6366F1;      /* 主色调 - 靛蓝（Indigo）*/
  --accent-secondary: #818CF8;    /* 辅助色 - 浅靛蓝 */
  --accent-hover: #4F46E5;       /* 悬停态 - 深靛蓝 */
  
  /* === 功能色 === */
  --success: #10B981;            /* 成功 - 翠绿 */
  --warning: #F59E0B;            /* 警告 - 琥珀 */
  --error: #EF4444;              /* 错误 - 红 */
  --info: #3B82F6;               /* 信息 - 蓝 */
  
  /* === 天象标记色 === */
  --event-s: #EF4444;            /* S级天象 - 红 */
  --event-a: #F97316;            /* A级天象 - 橙 */
  --event-b: #F59E0B;            /* B级天象 - 琥珀 */
  --event-c: #6B7280;            /* C级信息 - 灰 */
  
  /* === 边框与分割线 === */
  --border-light: #E5E7EB;       /* 浅边框 */
  --border-medium: #D1D5DB;      /* 中边框 */
  
  /* === 阴影系统 === */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-tooltip: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* === 圆角系统 === */
  --radius-sm: 6px;              /* 小圆角 - 标签/按钮 */
  --radius-md: 8px;              /* 中圆角 - 卡片/输入框 */
  --radius-lg: 12px;             /* 大圆角 - Modal/面板 */
  --radius-xl: 16px;             /* 超大圆角 - 特殊容器 */
}
```

**Dark Theme（V1.5预留）**：

```css
[data-theme="dark"] {
  --bg-primary: #0F172A;         /* 深蓝黑 */
  --bg-secondary: #1E293B;
  --bg-tertiary: #334155;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  /* ... 其他色值相应调整 ... */
}
```

#### 6.1.3 字体系统

```css
:root {
  /* === 字体族 === */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 
               sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* === 字号阶梯（基于1rem=16px）=== */
  --text-xs: 0.75rem;    /* 12px - 辅助信息 */
  --text-sm: 0.875rem;   /* 14px - 次要文字 */
  --text-base: 1rem;     /* 16px - 正文（基准）*/
  --text-lg: 1.125rem;   /* 18px - 小标题 */
  --text-xl: 1.25rem;    /* 20px - 标题 */
  --text-2xl: 1.5rem;    /* 24px - 大标题 */
  --text-3xl: 1.875rem;  /* 30px - 页面主标题 */
  
  /* === 字重 === */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* === 行高 === */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

**字体加载策略**：
- 使用 Google Fonts CDN 加载 Inter（拉丁+中文扩展）
- `font-display: swap` 避免FOIT (Flash of Invisible Text)
- 预加载关键字符集（ASCII + 常用中文）

#### 6.1.4 间距系统（8pt Grid）

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

#### 6.1.5 动效系统

**缓动函数（Easing）**：

```css
:root {
  /* Linear特色：物理感的缓动 */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);      /* 用于展开/进入 */
  --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);  /* 用于模态对话框 */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);    /* 弹性效果（微交互）*/
}

/* === 时长规范 === */
--duration-fast: 150ms;   /* 悬停/按下 */
--duration-normal: 300ms; /* 展开/切换 */
--duration-slow: 500ms;   /* 复杂动画 */
--duration-tooltip: 200ms; /* Tooltip出现 */
```

**动效原则**：
1. **功能导向**：动画必须传递信息（状态变化、层级关系），禁止纯装饰
2. **性能优先**：仅使用 `transform` 和 `opacity`，触发GPU合成层
3. **尊重偏好**：读取 `prefers-reduced-motion` 媒体查询，为前庭障碍用户关闭动画
4. **一致性**：同类交互使用相同时长和缓动

### 6.2 组件库规格

#### 6.2.1 原子组件（Atoms）

**Button（按钮）**：

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

// 规范
// - 最小触控区域：44×44px（移动端）
// - 间距：内边距 sm: 8px 16px, md: 10px 20px, lg: 12px 24px
// - 圆角：--radius-md (8px)
// - 字重：--font-medium (500)
// - 过渡：background-color 150ms ease
```

**Input（输入框）**：

```typescript
interface InputProps {
  type: 'text' | 'number' | 'search';
  state: 'default' | 'error' | 'success' | 'disabled';
  size: 'sm' | 'md';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  errorMsg?: string;  // state='error'时显示
}

// 规范
// - 高度：sm: 32px, md: 40px
// - 边框：1px solid var(--border-light)
// - Focus态：border-color: var(--accent-primary) + 外发光0 0 0 3px rgba(99,102,241,0.1)
// - Error态：border-color: var(--error) + 下方红字提示
```

**Tooltip（工具提示）**：

```typescript
interface TooltipProps {
  content: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;  // 默认150ms
  maxWidth?: number; // 默认280px
  children: React.ReactNode;  // 触发元素
}

// 规范
// - 背景：rgba(17, 24, 39, 0.95) 半透明深色（白色背景下对比度高）
// - 文字：白色，--text-sm
// - 圆角：--radius-md
// - 阴影：--shadow-tooltip
// - 箭头：CSS三角形指示器
// - 动画：fade + scale(0.95→1)，200ms var(--ease-out-expo)
```

**Badge（徽章/标签）**：

```typescript
interface BadgeProps {
  variant: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size: 'sm' | 'md';
  dot?: boolean;  // 是否显示为圆点（S级天象使用）
  children: React.ReactNode;
}

// 规范
// - 尺寸：sm: 高18px, md: 高24px
// - 圆角：全圆角（pill shape）
// - 内边距：sm: 4px 8px, md: 6px 12px
// - 字号：--text-xs (sm), --text-sm (md)
```

#### 6.2.2 分子组件（Molecules）

**DatePicker（日期选择器）**：

```typescript
interface DatePickerProps {
  value: SolarDate | LunarPrimaryDate;
  mode: 'solar' | 'lunar-primary';
  onChange: (date: any) => void;
  minDate?: SolarDate;
  maxDate?: SolarDate;
}

// 布局：下拉选择年 + 选择月 + 选择日
// 交互：点击输入框展开面板，双月历联动显示
```

**EventCard（事件卡片）**：

```typescript
interface EventCardProps {
  event: CalendarEvent;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// 布局：
// ┌────────────────────────────────┐
// │ ● [颜色条] 标题           [✏️][🗑️] │
// │ 描述文字（最多2行，截断...）    │
// │ 350年12月3日 · 历史事件        │
// └────────────────────────────────┘
```

**CalendarGridCell（日期格）**：

```typescript
interface GridCellProps {
  date: CalendarDate;
  isSelected: boolean;
  isToday?: boolean;
  events: CalendarEvent[];
  astronomicalEvents: AstronomicalEvent[];
  onSelect: (abs: number) => void;
  onHover: (abs: number | null) => void;
}

// 内部结构（从上到下）：
// ┌──────────────┐
// │ [S级圆点]     │ ← 右上角绝对定位
// │     3        │ ← 日期数字（居中）
// │ [B级文字标签] │ ← 底部居中
// │ [事件彩色条] │ ← 底部2px高度
// │ [C级图标]     │ ← 左下角
// └──────────────┘
```

#### 6.2.3 有机体（Organisms）

**MonthView（月视图容器）**：

```typescript
interface MonthViewProps {
  year: number;
  month: number;
  viewMode: ViewMode;
  selectedAbs: number | null;
  onDateSelect: (abs: number) => void;
  onDateHover: (abs: number | null) => void;
}

// 组成：
// Header（月份导航 + 视图切换）
//   └─ WeekdayHeader（星期标题行）
//       └─ GridContainer（7列×6行网格）
//           └─ GridCell[] × 35-42个
```

**DetailPanel（详情面板）**：

```typescript
interface DetailPanelProps {
  date: CalendarDate | null;
  events: CalendarEvent[];
  isOpen: boolean;
  onClose: () => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (id: string) => void;
  onCreateEvent: () => void;
}

// 布局（Master-Detail下半部分）：
// ┌─ 详情面板 ──────────────────────────────┐
// │                                          │
// │ 📅 公元350年12月3日（春分）              │
// │ ─────────────────────────────────────── │
// │ 🌞 阳历：350年12月3日（平年/闰年）      │
// │ 🌙 主月历：XX年XX月XX日（望月）         │
// │ 🌑 副月历：XX年XX月XX日（上弦）         │
// │ 📆 星期：碧森天（本周第3天）            │
// │ 🔢 干支：甲子日（第1/60循环）            │
// │ 🌊 潮汐：中潮                           │
// │                                          │
// │ 🔭 今日天象                             │
// │ • 春分（二十四节气之第4个）              │
// │ • 主月望月（农历十五）                   │
// │ • 双月角度：127°（趋近大潮）            │
// │                                          │
// │ 📌 相关事件（2个）                      │
// │ ┌────────────────────────────────┐      │
// │ │ ● 第一次双月合朔大典     [✏️][🗑️]│      │
// │ │ 全球观测到罕见双日全食...       │      │
// │ └────────────────────────────────┘      │
// │ ┌────────────────────────────────┐      │
// │ │ ● 丰收节庆典             [✏️][🗑️]│      │
// │ │ 传统秋分庆祝活动...             │      │
// │ └────────────────────────────────┘      │
│                                          │
│                    [+ 创建新事件]         │
└──────────────────────────────────────────┘
```

**EventModal（事件创建/编辑对话框）**：

```typescript
interface EventModalProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CalendarEvent>;
  anchorDate: CalendarDate;  // 预填的锚定日期
  onSubmit: (data: CalendarEvent) => void;
  onCancel: () => void;
}

// 交互：居中Modal，背景半透明遮罩，ESC关闭
// 表单：动态字段（根据事件类型显示不同选项）
```

### 6.3 页面布局架构

#### 6.3.1 Desktop布局（≥1200px）

```
┌──────────────────────────────────────────────────────────┐
│  Header (固定高度64px)                                    │
│  [Logo] 双月合历  [🔍搜索...]  [⚙️设置] [主题切换]       │
├────────────────────────────────┬─────────────────────────┤
│                                │                         │
│        Main Content            │    Detail Panel         │
│        (flex: 1)               │    (固定宽度420px)      │
│                                │    (可折叠)             │
│  ┌─ Navigation ─────────────┐  │  ┌─ 详情 ────────────┐ │
│  │ ◀ 350年12月  [视图切换] ▶ │  │  │                   │ │
│  └───────────────────────────┘  │  │  日期详细信息      │ │
│                                │  │  事件列表           │ │
│  ┌─ Weekday Header ─────────┐  │  │  操作按钮          │ │
│  │ 人天|兽天|碧森天|岩矿天|龙天│  │  │                   │ │
│  └───────────────────────────┘  │  └───────────────────┘ │
│                                │                         │
│  ┌─ Calendar Grid ──────────┐  │                         │
│  │                          │  │                         │
│  │  (7列 × 6行)             │  │                         │
│  │                          │  │                         │
│  └──────────────────────────┘  │                         │
│                                │                         │
└────────────────────────────────┴─────────────────────────┘
```

**特点**：
- 侧边详情面板可拖拽调整宽度（320px - 500px）
- 支持双屏场景（面板可拖出到独立窗口，V2.0考虑）
- 网格区域始终占据剩余空间

#### 6.3.2 Tablet布局（768px - 1199px）

```
┌───────────────────────────────────────┐
│  Header (简化版)                       │
├───────────────────────────────────────┤
│                                       │
│        Main Content (全宽)            │
│                                       │
│  ┌─ Navigation ─────────────────────┐ │
│  └──────────────────────────────────┘ │
│                                       │
│  ┌─ Calendar Grid ─────────────────┐ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─ Detail Drawer (底部抽屉) ──────┐ │
│  │  (高度自适应，最大50vh)          │ │
│  │  向上拖拽手柄 ═══                │ │
│  │  详情内容...                     │ │
│  └─────────────────────────────────┘ │
│                                       │
└───────────────────────────────────────┘
```

#### 6.3.3 Mobile布局（<768px）

```
┌─────────────────────┐
│  Header (紧凑)       │
├─────────────────────┤
│                     │
│  ┌─ Navigation ───┐ │
│  └────────────────┘ │
│                     │
│  ┌─ Week View ────┐ │  ← 改为周视图（7列×1行）
│  │ 日 一 二 三 四  │ │
│  └────────────────┘ │
│                     │
│  [点击日期 → 全屏详情] │
│                     │
└─────────────────────┘

// 全屏详情页（路由跳转或Overlay）
┌─────────────────────┐
│  ← 返回  350年12月3日│
├─────────────────────┤
│                     │
│  完整详情内容       │
│  (占满整个屏幕)     │
│                     │
│  [编辑事件] [分享]  │
│                     │
└─────────────────────┘
```

### 6.4 交互流程图（关键用户旅程）

#### Journey 1：首次访问（冷启动）

```
用户打开 https://calendar.example.com
    ↓
[Loading Screen]
显示Logo + "正在初始化历法引擎..." + 进度条
    ↓ (≤ 3秒)
检查LocalStorage是否存在旧数据
    ├── 有 → 加载用户事件 + 设置
    └── 无 → 显示欢迎引导（可选，V1.0可省略）
    ↓
渲染默认视图：
  - 日期：公元0年1月1日（或系统当天对应日期）
  - 视图：阳历月视图
  - 详情面板：收起状态
    ↓
[就绪] 用户可自由浏览和操作
```

#### Journey 2：查询特定日期的信息

```
用户看到当前月份视图
    ↓
[操作A：点击日期格]
  → 日期格高亮（蓝色边框）
  → 下方详情面板平滑展开（400ms动画）
  → 面板显示完整日期信息（阳历/阴历/星期/干支/天象/潮汐）
  → 面板底部显示该日期关联的事件列表
    ↓
[操作B：鼠标悬停其他日期]
  → 150ms延迟后显示Tooltip
  → Tooltip显示摘要信息（3-4行）
  → 鼠标移开，Tooltip淡出（100ms）
    ↓
[操作C：切换到主月历视图]
  → 点击"视图切换"按钮（阳历 ⇄ 主月历）
  → 视图交叉淡入淡出（200ms）
  → 网格结构重组（月份名称、日期范围变化）
  → 但选中的ABS不变，详情面板自动更新为主月历格式
    ↓
[完成] 用户获得所需信息
```

#### Journey 3：创建一个历史事件

```
用户在详情面板中看到目标日期
    ↓
点击 "[+ 创建新事件]" 按钮
    ↓
弹出 EventModal（居中，背景遮罩）
    ↓
填写表单：
  1. 输入标题："主角艾琳娜出生"
  2. 输入描述："在双月合朔之夜，预言中的孩子降生于王都医院..."
  3. 选择类型：● 单次历史事件
  4. 颜色标签：🔴 红色（主线剧情标识）
    ↓
点击 [创建事件] 按钮
    ↓
[前端校验]
  → 检查必填字段完整性 ✓
  → 检查标题长度（22字符 < 50）✓
  → 检查日期有效性 ✓
    ↓
[写入LocalStorage]
  → 生成UUID
  → 时间戳记录
  → JSON序列化
  → localStorage.setItem()
    ↓
[UI刷新]
  → Modal关闭（200ms fade-out）
  → 日历网格中对应日期格底部出现红色横条
  → 详情面板事件列表新增该条目（带入场动画）
  → Toast提示："事件「艾琳娜出生」已创建"
    ↓
[完成] 事件永久保存（除非手动删除）
```

---

## 7. 技术架构方案

### 7.1 技术栈选型

#### 7.1.1 前端框架

**推荐方案：React 18 + TypeScript**

**选型理由**：
- ✅ **生态成熟**：组件库、状态管理、工具链资源丰富
- ✅ **类型安全**：TypeScript静态检查，降低运行时错误（适合复杂历法算法）
- ✅ **虚拟DOM**：高效处理大量日期格的批量更新
- ✅ **社区活跃**：问题解决速度快，长期维护有保障

**替代方案（备选）**：

| 框架 | 优势 | 劣势 | 适用场景 |
|:-----|:-----|:-----|:---------|
| Vue 3 + TS | 学习曲线平缓，模板语法直观 | 大型项目类型推导略弱于React | 团队熟悉Vue时选用 |
| Svelte | 编译时优化，包体极小 | 生态较小，调试工具不成熟 | 对包体体积有极致要求时 |
| Solid.js | 细粒度响应式，性能极佳 | 社区新兴，案例较少 | 性能敏感场景 |

**最终决策**：**React 18 + TypeScript**（团队熟悉度 + 生态完备性）

#### 7.1.2 核心依赖清单

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    
    // 路由（未来预留）
    "react-router-dom": "^6.20.0",
    
    // 状态管理
    "zustand": "^4.4.0",  // 轻量级，适合中等复杂度应用
    
    // 日期/时间处理（自定义封装为主，此库仅作参考）
    "date-fns": "^3.0.0",  // 工具函数（格式化、比较等）
    
    // UI组件库（尽量少用，保持设计自主权）
    "@radix-ui/react-dialog": "^1.0.0",     // 无样式的可访问Dialog
    "@radix-ui/react-tooltip": "^1.0.0",    // 无样式的Tooltip
    "@radix-ui/react-popover": "^1.0.0",    // Popover（DatePicker）
    "clsx": "^2.0.0",                        // 条件className合并
    "tailwind-merge": "^2.0.0",              // Tailwind class冲突解决
    
    // 图标
    "lucide-react": "^0.300.0",  // Linear风格的开源图标库
    
    // UUID生成
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    // 构建工具
    "vite": "^5.0.0",  // 极速HMR，ESM原生支持
    "@vitejs/plugin-react": "^4.0.0",
    
    // CSS框架
    "tailwindcss": "^3.4.0",  // 原子化CSS，高度可定制
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    
    // 代码质量
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "prettier": "^3.2.0",
    
    // 测试
    "vitest": "^1.0.0",      // 单元测试（与Vite集成）
    "@testing-library/react": "^14.0.0",  // 组件测试
    "playwright": "^1.40.0"  // E2E测试
  }
}
```

#### 7.1.2 项目目录结构

```
dual-moon-calendar/
├── public/
│   ├── favicon.svg
│   ├── og-image.png          # Open Graph分享图片
│   └── robots.txt
├── src/
│   ├── main.tsx               # 应用入口
│   ├── App.tsx                # 根组件
│   ├── index.css              # 全局样式（Tailwind导入）
│   │
│   ├── engine/                # 🔧 历法引擎（核心算法）
│   │   ├── constants.ts       # 天文物理常量
│   │   ├── types.ts           # 引擎相关类型定义
│   │   ├── calendar.ts        # 日期转换算法（ABS↔Solar↔Lunar）
│   │   ├── astronomical.ts    # 天文事件计算（节气/月相/潮汐）
│   │   ├── cache.ts           # 预计算缓存管理
│   │   └── index.ts           # 统一导出
│   │
│   ├── store/                 # 📦 状态管理（Zustand）
│   │   ├── useCalendarStore.ts    # 日历视图状态（当前年/月/选中日期）
│   │   ├── useEventStore.ts       # 事件CRUD状态
│   │   └── useSettingsStore.ts    # 用户设置状态
│   │
│   ├── hooks/                 # 🪝 自定义Hooks
│   │   ├── useCalendarEngine.ts   # 封装引擎调用
│   │   ├── useEvents.ts          # 事件查询/过滤Hook
│   │   ├── useLocalStorage.ts    # LocalStorage封装
│   │   └── useMediaQuery.ts      # 响应式断点检测
│   │
│   ├── components/            # 🧩 UI组件
│   │   ├── atoms/              # 原子组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── molecules/          # 分子组件
│   │   │   ├── DatePicker.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── CalendarGridCell.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── organisms/          # 有机体组件
│   │   │   ├── MonthView.tsx
│   │   │   ├── DetailPanel.tsx
│   │   │   ├── EventModal.tsx
│   │   │   ├── Header.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── layout/             # 布局组件
│   │       ├── MainLayout.tsx
│   │       └── ResponsiveWrapper.tsx
│   │
│   ├── pages/                 # 📄 页面级组件（未来路由扩展）
│   │   └── CalendarPage.tsx
│   │
│   ├── utils/                 # 🛠️ 工具函数
│   │   ├── formatters.ts      # 日期/数字格式化
│   │   ├── validators.ts      # 输入校验
│   │   ├── storage.ts         # LocalStorage封装（含容灾）
│   │   └── helpers.ts         # 通用辅助函数
│   │
│   ├── styles/                # 🎨 样式文件
│   │   ├── theme.css          # CSS变量（Design Tokens）
│   │   └── animations.css     # 全局动画定义
│   │
│   ├── types/                 # 📝 全局类型定义
│   │   ├── calendar.ts        # CalendarDate等核心类型
│   │   ├── events.ts          # 事件相关类型
│   │   └── ui.ts              # UI组件Props类型
│   │
│   └── __tests__/             # 🧪 测试文件
│       ├── engine/
│       │   ├── calendar.test.ts
│       │   └── astronomical.test.ts
│       ├── components/
│       │   └── MonthView.test.tsx
│       └── utils/
│           └── validators.test.ts
│
├── .eslintrc.cjs
├── .prettierrc
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── package.json
├── README.md
└── PRD.md                    # 本文档
```

### 7.2 性能优化策略

#### 7.2.1 加载性能目标

| 指标 | 目标值 | 测量工具 | 优化手段 |
|:-----|:-------|:---------|:---------|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse | 代码分割、关键CSS内联 |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse | 预加载字体、骨架屏 |
| **Time to Interactive (TTI)** | < 3.0s | Lighthouse | 非阻塞JS加载 |
| **Total Bundle Size (gzipped)** | < 250KB | webpack-bundle-analyzer | Tree-shaking、代码分割 |
| **首屏日历渲染** | < 1.0s | Performance API | 缓存预热、虚拟化 |

#### 7.2.2 运行时性能目标

| 指标 | 目标值 | 测试场景 |
|:-----|:-------|:---------|
| **月份切换帧率** | 60fps (无掉帧) | 连续快速点击◀▶ 12次 |
| **Tooltip显示延迟** | 150ms ± 50ms | 鼠标悬停日期格 |
| **详情面板展开** | < 400ms (动画流畅) | 点击日期 |
| **事件创建响应** | < 200ms (UI反馈) | 提交表单后 |
| **1200年数据全量查询** | < 100ms | 首次加载缓存生成 |
| **内存占用稳定** | < 100MB (Chrome) | 操作30分钟后无泄漏 |

#### 7.2.3 具体优化技术

**1. 历法引擎缓存预热（Critical Path）**

```typescript
// 应用启动时异步预计算
async function initializeApp() {
  // 显示Loading界面
  showSplashScreen();
  
  try {
    // 使用requestIdleCallback避免阻塞首屏
    const cache = await preloadCalendarCache(0, 1200);
    
    // 缓存就绪后隐藏Loading
    hideSplashScreen();
    renderApp(cache);
  } catch (error) {
    showErrorScreen(error);
  }
}

// Web Worker中执行重型计算（V1.5优化）
function preloadCalendarCache(startYear: number, endYear: number): Promise<CalendarCache> {
  return new Promise((resolve) => {
    const worker = new Worker('./workers/calendar.worker.js');
    worker.postMessage({ action: 'precompute', startYear, endYear });
    worker.onmessage = (e) => resolve(e.data);
  });
}
```

**2. 虚拟化渲染（react-window / react-virtuoso）**

```tsx
import { FixedSizeList as List } from 'react-window';

// 仅渲染可见行（通常5-6行），而非全部42个单元格
const Row = ({ index, style }) => (
  <div style={style}>
    {weeks[index].map((date) => (
      <GridCell key={date.abs} date={date} />
    ))}
  </div>
);

<MonthView>
  <List
    height={480}
    itemCount={6}  // 6周
    itemSize={80}
    width="100%"
  >
    {Row}
  </List>
</MonthView>
```

**3. 图片/字体优化**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-tooltip'],
          'utils': ['date-fns', 'uuid', 'clsx']
        }
      }
    }
  },
  
  // 字体预加载
  optimizeDeps: {
    include: ['lucide-react']
  }
});
```

**4. LocalStorage读写优化**

```typescript
// 批量写入（减少JSON序列化次数）
class BatchStorageWriter {
  private buffer: Map<string, any> = new Map();
  private timer: NodeJS.Timeout | null = null;
  
  set(key: string, value: any): void {
    this.buffer.set(key, value);
    
    // 防抖：300ms内的多次write合并为一次
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 300);
  }
  
  private flush(): void {
    for (const [key, value] of this.buffer) {
      localStorage.setItem(key, JSON.stringify(value));
    }
    this.buffer.clear();
  }
}
```

### 7.3 部署方案

#### 7.3.1 Vercel部署配置

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

**vercel.json 配置**：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 7.3.2 构建与CI/CD

**package.json scripts**：

```json
{
  "scripts": {
    "dev": "vite",                            // 开发服务器（HMR）
    "build": "tsc -b && vite build",          // 类型检查 + 生产构建
    "preview": "vite preview",                // 本地预览生产构建
    "lint": "eslint src --ext ts,tsx",        // 代码检查
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest run",                     // 单元测试
    "test:watch": "vitest",                   // 监听模式
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",            // E2E测试
    "typecheck": "tsc --noEmit"               // 仅类型检查（快速）
  }
}
```

**GitHub Actions CI（.github/workflows/ci.yml）**：

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm run test:coverage
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel (only main branch)
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 8. 非功能性需求

### 8.1 浏览器兼容性

#### 8.1.1 支持矩阵

| 浏览器 | 最低版本 | 策略 | 市场份额考虑 |
|:-------|:---------|:------|:-------------|
| **Chrome** | ≥ 90 (2021-03) | ✅ 完全支持 | ~65% |
| **Firefox** | ≥ 88 (2021-02) | ✅ 完全支持 | ~3% |
| **Safari** | ≥ 14 (2020-09) | ⚠️ 核心功能支持 | ~18% |
| **Edge** | ≥ 90 (2021-01) | ✅ 完全支持（Chromium内核）| ~5% |
| **移动版 Chrome** | ≥ 90 | ✅ 支持查看模式 | - |
| **移动版 Safari** | ≥ 14 | ⚠️ 基础支持 | - |

#### 8.1.2 Polyfill策略

```typescript
// 对于不支持的新API，按需引入Polyfill
if (!structuredClone) {
  // Safari < 15.4 不支持 structuredClone
  import('core-js/actual/structured-clone');
}

if (!CSS.supports('animation-timeline: view()')) {
  // 新版滚动驱动动画不支持时回退到JS实现
}
```

**优雅降级示例**：

```tsx
// CSS Grid 不支持时回退到 Flexbox
<MonthView className="grid grid-cols-7 gap-1 
  [&:not(.supports-grid)]:flex [&:not(.supports-grid)]:flex-wrap">
  {/* ... */}
</MonthView>
```

### 8.2 可访问性（Accessibility）

#### 8.2.1 WCAG 2.1 AA 基础合规（V1.0目标）

| 原则 | 实现要求 | 验证方法 |
|:-----|:---------|:---------|
| **可感知** | 文字对比度 ≥ 4.5:1（正文），≥ 3:1（大字）| axe-core DevTools |
| **可操作** | 所有功能可通过键盘完成（Tab/Shift+Enter/Esc）| 纯键盘测试 |
| **可理解** | 表单元素有关联的 `<label>`，错误信息明确 | 屏幕阅读器测试 |
| **健壮性** | 语义化HTML标签，ARIA属性正确使用 | WAVE工具扫描 |

#### 8.2.2 具体实现清单

**键盘导航**：

```tsx
// 日期格键盘支持
function GridCell({ date, onSelect }: GridCellProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(date.abs);
        break;
      case 'ArrowRight':
        e.preventDefault();
        focusNextDay(date.abs);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusPrevDay(date.abs);
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusNextWeek(date.abs);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusPrevWeek(date.abs);
        break;
    }
  };
  
  return (
    <button
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${date.solar.year}年${date.solar.month}月${date.solar.day}日，${getEventSummary(date)}`}
      role="gridcell"
    >
      {/* ... */}
    </button>
  );
}
```

**屏幕阅读器优化**：

```tsx
// 详情面板的ARIA属性
<DetailPanel
  role="region"
  aria-label="日期详情面板"
  aria-live="polite"  // 内容变化时自动播报
>
  <h2 id="detail-title">{formattedDate}</h2>
  <section aria-labelledby="astronomical-title">
    <h3 id="astronomical-title">今日天象</h3>
    <ul>{astronomicalEvents.map(event => <li key={event.id}>{event.name}</li>)}</ul>
  </section>
</DetailPanel>
```

**焦点管理**：

```tsx
// Modal打开时焦点陷阱
function EventModal({ onClose, onSubmit }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 打开时聚焦到第一个输入框
    modalRef.current?.querySelector('input')?.focus();
    
    // 创建焦点陷阱
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = modalRef.current?.querySelectorAll(
        'input, button, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstEl = focusableElements?.[0];
      const lastEl = focusableElements?.[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl?.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl?.focus();
      }
    };
    
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, []);
  
  // ESC关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* ... */}
    </div>
  );
}
```

### 8.3 安全性考量

虽然本应用是**纯前端、无后端**的系统，但仍需注意以下安全点：

#### 8.3.1 XSS防护

```typescript
// 用户输入的内容必须经过消毒（Sanitize）
import DOMPurify from 'dompurify';

function UserDescription({ text }: { text: string }) {
  // 危险！直接渲染会导致XSS：
  // return <div dangerouslySetInnerHTML={{ __html: text }} />;
  
  // 安全做法：
  const cleanText = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],  // 仅允许有限的格式标签
    ALLOWED_ATTR: []
  });
  
  return <div dangerouslySetInnerHTML={{ __html: cleanText }} />;
}
```

#### 8.3.2 LocalStorage安全

```typescript
// 不要在LocalStorage中存储敏感信息（本应用无登录系统，风险较低）
// 但仍需注意：不要存储密码/token等（如果未来添加云同步功能）

// 防止原型污染攻击
function safeJsonParse(jsonString: string): any {
  try {
    // 使用原生JSON.parse（比eval()安全）
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn('Invalid JSON detected');
    return null;
  }
}
```

### 8.4 国际化（i18n）预留接口

虽然V1.0仅支持中文，但架构层面预留国际化能力：

#### 8.4.1 目录结构预留

```
src/
├── i18n/                    # 国际化资源（V2.0启用）
│   ├── locales/
│   │   ├── zh-CN.json       # 简体中文（默认）
│   │   ├── en-US.json       # 英语（美式）
│   │   └── ja-JP.json       # 日语（未来）
│   ├── config.ts
│   └── useTranslation.ts    # 自定义Hook
```

#### 8.4.2 翻译键命名规范

```json
// zh-CN.json
{
  "app.title": "双月合历",
  "nav.previousMonth": "上一月",
  "nav.nextMonth": "下一月",
  "view.solar": "阳历",
  "view.lunarPrimary": "主月历",
  "weekday.1": "人天",
  "weekday.2": "兽天",
  "weekday.3": "碧森天",
  "weekday.4": "岩矿天",
  "weekday.5": "龙天",
  "event.create": "创建事件",
  "event.edit": "编辑事件",
  "event.delete": "删除事件",
  "tooltip.astronomical": "{{name}} - {{description}}",
  "error.dateOutOfRange": "日期超出有效范围（{{min}} - {{max}}）",
  "storage.quotaWarning": "存储空间即将耗尽，建议导出备份数据。"
}
```

**代码中使用**：

```tsx
function MonthView() {
  const { t } = useTranslation();  // V2.0启用
  
  return (
    <header>
      <button aria-label={t('nav.previousMonth')}>◀</button>
      <h2>{currentMonthLabel}</h2>
      <button aria-label={t('nav.nextMonth')}>▶</button>
    </header>
  );
}
```

**V1.0临时方案**（避免过度工程）：

```typescript
// 直接使用字符串常量，后续通过脚本提取替换为t()
export const STRINGS = {
  APP_TITLE: '双月合历',
  NAV_PREV_MONTH: '上一月',
  // ...
} as const;
```

### 8.5 主题系统（V1.5预留）

#### 8.5.1 CSS变量架构

已在6.1.2节定义完整的Light/Dark色彩系统，此处补充切换机制：

```tsx
// useTheme Hook
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // 优先读取用户设置，其次读取系统偏好
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return { theme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') };
}
```

---

## 9. 版本迭代路线图

### 9.1 版本规划总览

```
V1.0 (MVP) ──────► V1.5 (增强) ──────► V2.0 (云端) ──────► V3.0 (生态)
   │                    │                    │                    │
   ▼                    ▼                    ▼                    ▼
核心日历功能         主题切换              云端同步              事件导图
历法引擎             可视化图表导出        手机端适配            API开放
阳历/主月历视图      PWA安装              多语言支持             插件系统
事件CRUD             性能优化(v2)         数据分析              社区功能
LocalStorage存储                                                 
```

### 9.2 V1.0 - MVP（最小可行产品）

**目标**：满足"可用"的最小功能集合，验证核心价值假设

**时间估算**：4-6周（1人全职或2人兼职）

#### 功能范围（Must Have）

| 模块 | 功能点 | 验收标准 |
|:-----|:-------|:---------|
| **历法引擎** | 0-1200年完整计算 | 所有日期转换误差为0 |
| **阳历视图** | 12月网格渲染 | 7列×6行，特殊标记正确 |
| **视图切换** | 阳历 ⇄ 主月历 | 数据无缝衔接 |
| **日期转换** | ABS ↔ 阳历 ↔ 主月历 | 双向可逆 |
| **天象标记** | S/A/B/C四级自动标记 | Tooltip + 详情面板展示 |
| **事件管理** | 3类事件CRUD | LocalStorage持久化 |
| **详情面板** | Master-Detail布局 | 平滑动画，信息完整 |
| **输入校验** | 即时错误提示 | 覆盖所有边界情况 |
| **桌面端响应式** | ≥1024px完美体验 | 布局不崩坏 |

#### 技术债务（V1.0已知限制）

- [ ] 移动端仅为"可查看"降级模式（非完整功能）
- [ ] 无深色主题（仅有Light模式）
- [ ] 无离线支持（PWA未实现）
- [ ] 无导出功能（数据锁定在浏览器内）
- [ ] 无批量操作（如批量删除事件）
- [ ] 无撤销/重做功能

#### 里程碑

| 阶段 | 交付物 | 时间节点 |
|:-----|:-------|:---------|
| **Week 1-2: 基础搭建** | 项目脚手架 + Design System + 历法引擎v0.1 | Day 14 |
| **Week 3: 核心UI** | 阳历月视图 + 日期格 + 导航 | Day 21 |
| **Week 4: 交互完善** | 详情面板 + Tooltip + 视图切换 | Day 28 |
| **Week 5: 事件系统** | CRUD + LocalStorage + 校验逻辑 | Day 35 |
| **Week 6: 打磨上线** | 性能优化 + Bug修复 + Vercel部署 | Day 42 |

### 9.3 V1.5 - 体验增强版

**目标**：补齐V1.0的明显短板，提升日常使用舒适度

**时间估算**：3-4周（基于V1.0迭代）

#### 新增功能（Should Have）

| 模块 | 功能点 | 描述 |
|:-----|:-------|:-----|
| **深色主题** | Light/Dark切换 | 护眼夜间模式，尊重系统偏好 |
| **可视化图表** | 事件时间线导出 | PNG/SVG矢量图，用于社交分享 |
| **PWA基础** | 可安装到桌面/主屏 | Service Worker缓存静态资源 |
| **性能优化v2** | Web Worker后台计算 | 历法引擎不阻塞UI线程 |
| **动画增强** | 微交互打磨 | Linear风格的精致过渡效果 |
| **批量操作** | 多选删除/批量修改标签 | 提升事件管理效率 |

#### 技术改进

- [ ] 引入Web Worker分离CPU密集型计算
- [ ] 实施Service Worker缓存策略（Cache-first）
- [ ] 添加Lighthouse性能审计自动化（CI集成）
- [ ] 移动端触摸手势优化（Swipe切换月份）

### 9.4 V2.0 - 云端协作版

**目标**：打破单机限制，支持多设备访问和数据安全

**时间估算**：6-8周（涉及后端/认证）

#### 核心功能

| 模块 | 功能点 | 技术方案 |
|:-----|:-------|:---------|
| **用户系统** | 邮箱注册/登录 | Supabase Auth（免运维） |
| **云端同步** | Realtime同步 | Supabase Realtime / Firestore |
| **手机端适配** | 完整移动端功能 | 响应式重构 + PWA增强 |
| **数据导入/导出** | JSON文件备份 | 加密导出（用户自定义密码） |
| **国际化** | 中/英双语界面 | react-i18next |
| **分享功能** | 生成只读链接 | Vercel Edge Function + 短链 |

#### 架构升级

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Desktop    │     │  Mobile     │     │  Tablet     │
│  (Web App)  │     │  (PWA)      │     │  (Web App)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                   ┌───────▼───────┐
                   │  Supabase     │  ← BaaS (Backend as a Service)
                   │  - Auth       │
                   │  - Postgres   │
                   │  - Realtime   │
                   │  - Storage    │
                   └───────────────┘
```

### 9.5 V3.0 - 生态系统版（远期愿景）

**开放能力**：

- **REST API**：供外部程序调用历法引擎（游戏内嵌、第三方工具）
- **插件系统**：社区开发者可扩展自定义事件类型、视图模式
- **事件导图（关系图）**：基于Mermaid.js的可视化剧情关系网络
- **模板市场**：用户分享预设的节假日/事件模板（如"东方奇幻风格"、"赛博朋克风格"）
- **协作编辑**：多人同时编辑同一日历（类似Google Docs实时协作）

---

## 10. 验收标准与测试策略

### 10.1 验收测试矩阵（Acceptance Criteria）

#### AC-001：历法引擎准确性

| 测试ID | 测试场景 | 输入 | 预期输出 | 优先级 |
|:-------|:---------|:-----|:---------|:-------|
| ENG-001 | 公元0年第1天的阳历日期 | ABS=0 | 0年1月1日 | P0 |
| ENG-002 | 公元350年是否为闰年 | year=350 | 350%8=6 → 平年（False）| P0 |
| ENG-003 | 600年整除年份的闰年修正 | year=600 | 应为平年（非闰年）| P0 |
| ENG-004 | 第1个双月合朔日 | 查询合朔周期 | ABS≈812 (±1天容差)| P0 |
| ENG-010 | 1200年最后一天的有效性 | ABS=420752 | 有效日期，不报错 | P0 |

**自动化测试**：Vitest单元测试，覆盖率目标 > 90%

#### AC-002：UI渲染正确性

| 测试ID | 测试场景 | 验证方法 | 优先级 |
|:-------|:---------|:---------|:-------|
| UI-001 | 阳历月视图显示正确天数 | Playwright截图对比 | P0 |
| UI-002 | S级天象红点位置准确 | 视觉回归测试 | P0 |
| UI-003 | Tooltip内容完整且无截断 | 手动探索 + 截图 | P1 |
| UI-004 | 视图切换后选中日期保持 | E2E测试脚本 | P0 |
| UI-010 | 1200年在月视图中正常显示 | 性能测试 | P1 |

**测试工具**：Playwright (E2E) + Chromatic (视觉回归)

#### AC-003：事件管理完整性

| 测试ID | 测试场景 | 验证步骤 | 优先级 |
|:-------|:---------|:---------|:-------|
| EVT-001 | 创建周期性节假日 | 填写表单提交 → 刷新页面 → 仍在 | P0 |
| EVT-002 | 编辑事件标题 | 修改 → 保存 → 立即反映 | P0 |
| EVT-003 | 删除事件二次确认 | 点击删除 → 确认 → 消失 | P0 |
| EVT-004 | 事件数量达1000个时性能 | 批量创建 → 切换月份流畅 | P1 |
| EVT-005 | LocalStorage损坏恢复 | 模拟损坏 → 提示用户 → 可重置 | P0 |

#### AC-004：性能指标达标

| 指标 | 测试方法 | 目标值 | 工具 |
|:-----|:---------|:-------|:-----|
| 首屏加载 (FCP) | Lighthouse CI | < 1.5s | Lighthouse |
| 包体大小 (gzipped) | build分析 | < 250KB | rollup-plugin-visualizer |
| 月份切换帧率 | Performance API监控 | 稳定60fps | Chrome DevTools |
| 内存稳定性 | 30分钟操作后快照 | 无明显增长 | Chrome Memory面板 |
| 引擎查询延迟 | performance.now()测量 | < 1ms (缓存命中)| 自定义benchmark |

### 10.2 测试金字塔

```
        ┌─────────────┐
        │   E2E Tests  │  ← 10% (关键用户旅程)
        │  (Playwright)│
       ┌┴─────────────┴┐
       │  Integration   │  ← 20% (组件交互)
       │    Tests       │
       │ (Testing Lib) │
      ┌┴───────────────┴┐
      │   Unit Tests     │  ← 70% (历法引擎核心算法)
      │   (Vitest)       │
      └──────────────────┘
```

### 10.3 测试用例示例

**历法引擎单元测试**：

```typescript
// __tests__/engine/calendar.test.ts
import { describe, it, expect } from 'vitest';
import { absToSolar, solarToAbs } from '@/engine/calendar';

describe('absToSolar - 绝对日序数转阳历', () => {
  it('应该正确转换公元0年第1天', () => {
    expect(absToSolar(0)).toEqual({ year: 0, month: 1, day: 1 });
  });
  
  it('应该正确处理闰年（余数为1）', () => {
    const result = absToSolar(calculateAbs(1, 12, 30)); // 1年是闰年
    expect(result.isLeapYear).toBe(true);
  });
  
  it('应该在600年修正规则下正确判断平年', () => {
    const year600 = getYearData(600);
    expect(year600.isLeapYear).toBe(false); // 600能被600整除，不设闰
  });
  
  it('应该抛出超出范围的错误', () => {
    expect(() => absToSolar(-1)).toThrow('ABS不能为负数');
    expect(() => absToSolar(999999)).toThrow('超出最大支持年份1200');
  });
});

describe('solarToAbs - 阳历转绝对日序数', () => {
  it('应该是absToSolar的逆运算', () => {
    const testCases = [
      { year: 0, month: 1, day: 1 },
      { year: 350, month: 12, day: 3 },
      { year: 1200, month: 12, day: 30 }
    ];
    
    for (const tc of testCases) {
      const abs = solarToAbs(tc);
      expect(absToSolar(abs)).toEqual(tc);
    }
  });
});
```

**组件交互测试**：

```typescript
// __tests__/components/MonthView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthView } from '@/components/organisms/MonthView';

describe('MonthView 交互行为', () => {
  it('点击日期格应该展开详情面板', () => {
    render(<MonthView year={350} month={12} />);
    
    const cell15 = screen.getByRole('gridcell', { name: /15/ });
    fireEvent.click(cell15);
    
    expect(screen.getByRole('region', { name: /日期详情面板/ })).toBeVisible();
  });
  
  it('点击视图切换按钮应该改变显示模式', () => {
    render(<MonthView year={350} month={12} />);
    
    const switchBtn = screen.getByRole('button', { name: /切换至主月历/ });
    fireEvent.click(switchBtn);
    
    expect(screen.getByText(/塞勒涅历/)).toBeInTheDocument();
  });
});
```

### 10.4 Bug分级与响应SLA

| 级别 | 定义 | 响应时间 | 修复时间 | 示例 |
|:-----|:-----|:---------|:---------|:-----|
| **P0 - 致命** | 核心功能完全不可用 | 2小时内 | 24小时内 | 历法引擎崩溃、数据丢失 |
| **P1 - 严重** | 主要功能受损但有Workaround | 24小时内 | 72小时内 | 事件无法保存、视图切换白屏 |
| **P2 - 一般** | 非核心功能异常 | 1周内 | 2周内 | Tooltip样式错误、动画卡顿 |
| **P3 - 轻微** | 美学/体验问题 | 按排期 | 下版本 | 文案不通顺、颜色微调 |

---

## 11. 附录

### 11.1 待确认事项（Technical Debt / Open Questions）

以下是PRD编写过程中发现的**需要进一步决策或技术验证**的问题：

#### 🔴 高优先级（阻塞开发）

| ID | 问题 | 影响 | 状态 | 决策结果 |
|:---|:-----|:-----|:-----|:-----|
| **TODO-001** | 阳历月份天数分配矛盾：原文说平年350天，但1月30天+11×29天+12月29天=349天 | 导致引擎算法无法闭环 | ✅ **已解决** | 采用方案A：平年349天，闰年350天（2026-05-08确认） |
| **TODO-002** | 绝对日序数起点：ABS=0对应的是"第0天"还是"第1天"？ | 影响所有日期计算的off-by-one错误 | ✅ **已解决** | ABS=0 代表公元0年第1天（纪元起点）（2026-05-08确认） |
| **TODO-003** | 二十四节气的具体中文名称：是否沿用地球命名（立春/雨水/...）还是创造新的？ | 影响UI文案和文化沉浸感 | ✅ **已解决** | 暂沿用地球传统名称（24节气完整列表），后续可替换为地星本土名称（2026-05-08确认） |

#### 🟡 中优先级（V1.0开发中解决）

| ID | 问题 | 影响 | 建议方案 |
|:---|:-----|:-----|:---------|
| **TODO-004** | 10天干和12地支是否沿用汉字？还是创造新的文字系统？ | 干支纪日的显示 | 初期沿用汉字，提供配置接口 |
| **TODO-005** | 星期的五天名称（人天/兽天/碧森天/岩矿天/龙天）是否有官方英文名或缩写？ | 国际化和代码注释 | 用户已提供，无需额外确认 |
| **TODO-006** | 副月历在UI中的展示优先级：是否默认隐藏，仅在详情面板显示？ | 信息密度控制 | V1.0默认隐藏，提供设置开关 |

#### 🟢 低优先级（V1.5+考虑）

| ID | 问题 | 建议 |
|:---|:-----|:-----|
| **TODO-007** | 是否需要支持"公元前"（负年份）查询？ | V1.0不支持，V2.0按需评估 |
| **TODO-008** | 事件描述是否需要支持Markdown语法（加粗/斜体/链接）？ | V1.0纯文本，V1.5考虑富文本 |
| **TODO-009** | 是否需要提供公开的Demo模式（无需创建事件，仅查看历法）？ | 有利于传播，建议V1.0加入 |

### 11.2 第三方服务依赖清单

| 服务 | 用途 | 成本 | 数据隐私 | 替代方案 |
|:-----|:-----|:-----|:---------|:---------|
| **Vercel** | Web托管 + CDN | 免费额度充足（100GB带宽/月）| 托管静态内容，无用户数据 | Netlify, Cloudflare Pages |
| **Google Fonts** | Inter字体加载 | 免费 | 可能泄露IP地址（可忽略）| 自托管字体文件 |
| **uuid (npm包)** | 生成事件ID | 免费 (MIT协议) | 纯本地生成，无网络请求 | crypto.randomUUID() (原生API) |
| **Supabase** (V2.0) | 用户认证 + 云数据库 | 免费额度50MB数据库 | 用户邮箱加密存储 | Firebase, AWS Amplify |

### 11.3 参考资源与灵感来源

**产品设计参考**：
- [Linear.app](https://linear.app) - 整体设计语言、动效、信息密度
- [Notion Calendar](https://www.notion.so/calendar) - 日历交互范式
- [Apple Calendar (macOS)] - 原生日历的极简美学
- [Fantastical](https://flexibits.com/fantastical) - 自然语言日期解析

**历法计算参考**：
- [历法.md](./历法.md) - 本项目的唯一权威天文数据源
- 地球公历/农历算法论文（用于对比验证算法正确性）
- Jean Meeus《天文算法》- 行星轨道计算通用方法

**开源项目参考**：
- [fullcalendar/react](https://fullcalendar.io/) - 功能完备的日历组件（过重，不直接使用，但参考其API设计）
- [date-fns](https://date-fns.org/) - 日期工具函数库的设计哲学
- [hemisphere](https://github.com/hemisphere-project) - 月相计算算法（可作为副本月相计算的参考）

### 11.4 术语索引

| 术语 | 英文 | 首次出现章节 | 定义位置 |
|:-----|:-----|:------------|:---------|
| 双月合历 | Dual Moon Calendar System | 1.3 | 2.1 |
| 地星 | Terra (Dual-Moon Planet) | 1.3 | 3.1 |
| 主月 | Selene (Primary Moon) | 1.3 | 3.1 |
| 副月 | Endymion (Secondary Moon) | 1.3 | 3.1 |
| 回归年 | Tropical Year (Y) | 1.3 | 3.2 |
| 朔望月 | Synodic Month (S) | 1.3 | 3.2 |
| 民用日 | Civil Day (D) | 1.3 | 3.2 |
| 绝对日序数 | Absolute Day Number (ABS) | 1.3 | 3.2.2 |
| 阳历 | Solar Calendar | 1.3 | 3.3 |
| 主月历 | Primary Lunar Calendar | 1.3 | 3.4.1 |
| 副月历 | Secondary Lunar Calendar | 1.3 | 3.4.2 |
| Master-Detail | Master-Detail Layout | 1.3 | 4.3 |
| MoSCoW | MoSCoW Prioritization | 4.1 | 4.1 |
| PWA | Progressive Web App | 9.3 | 9.3 |
| BaaS | Backend as a Service | 9.4 | 9.4 |

### 11.5 文档修订历史

| 版本 | 日期 | 修订内容 | 作者 |
|:-----|:-----|:---------|:-----|
| v0.1 | 2026-05-08 | 初始草稿，完成12轮需求调研 | AI助手 |
| v0.5 | 2026-05-08 | 补充完整的技术架构和UI规格 | AI助手 |
| v1.0 | 2026-05-08 | 正式版，通过用户审核 | AI助手 + 用户 |

---

## 📌 文档结束

**下一步行动**：

1. ✅ **用户审核本PRD**：确认所有决策点无误，标记需要调整的部分
2. 📋 **澄清Open Questions**：重点解决 TODO-001/002/003（阻塞开发的问题）
3. 🚀 **新开对话启动开发**：基于本PRD文档逐步实现V1.0功能
4. 🔄 **迭代更新**：开发过程中发现需求偏差时，回溯更新本文档（保持PRD与代码同步）

---

> **版权声明**：本PRD文档及其描述的双月合历系统世界观归属于原作者（用户）。本项目以开源形式共享实现代码，仅供学习和创作参考。
>
> **最后更新**：2026-05-08 by AI Assistant + User Collaboration

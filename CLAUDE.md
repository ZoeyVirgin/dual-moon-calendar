# CLAUDE.md — AI 助手项目上下文

本文件为 AI 编程助手提供项目全貌，确保在新对话中快速恢复上下文。
详细设计文档见 `docs/` 目录。

---

## 项目概述

**双月合历 (Dual Moon Calendar)** — 架空世界观日历系统，为小说创作提供精确的三轨历法计算与可视化。

核心世界观：一颗拥有两颗月球（2:1 轨道共振）的宜居行星，形成阳历 + 主月历 + 副月历的三轨体系。

**在线部署**：https://calendar-delta-brown.vercel.app/

---

## 技术栈

| 层面 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React + TypeScript | 18.2 / 5.3 |
| 构建工具 | Vite | 5.x |
| 状态管理 | Zustand | 4.x |
| CSS 方案 | TailwindCSS | 3.4 |
| 工具库 | clsx + tailwind-merge + lucide-react + uuid | - |
| 数据库 | Neon Serverless Postgres | @vercel/postgres |
| API | Vercel Serverless Functions (Standard Format) | @vercel/node |
| 单元测试 | Vitest + Testing Library | 233 tests |
| 部署 | Vercel (Vite preset) | 自动部署 |
| CI | GitHub Actions | typecheck + lint + test |
| Node | 20.x | engines 锁定 |

---

## 项目结构

```
calendar/
├── api/                         # Vercel Serverless Functions
│   ├── auth.ts                  #   作者口令验证 (POST)
│   ├── events.ts                #   事件 CRUD (GET/POST)
│   ├── events/[id].ts           #   单事件操作 (PUT/DELETE)
│   └── ping.ts                  #   健康检查
├── docs/                        # 项目文档
│   ├── 历法.md                  #   权威天文数据源（不可随意修改）
│   ├── PRD.md                   #   产品需求文档
│   ├── SPEC.md                  #   技术规格书
│   ├── Feedback.md              #   开发反馈记录
│   └── 项目分析报告.md          #   第三方代码审计
├── public/
│   └── favicon.svg
├── src/
│   ├── engine/                  # 历法引擎（纯函数，无 UI 依赖）
│   │   ├── constants.ts         #   天文常量、月相区间、二十四节气名
│   │   ├── types.ts             #   引擎中间类型 (MoonAgeResult, SolarTermDetection)
│   │   ├── solar.ts             #   阳历转换 (absToSolar / solarToAbs / getYearStartAbs)
│   │   ├── lunar-primary.ts     #   主月历 (无中气置闰法 / resolveYearMonth)
│   │   ├── lunar-secondary.ts   #   副月历 (无中气置闰法 / resolveYearMonth)
│   │   ├── astronomical.ts      #   天象检测 + 潮汐 + 双月合朔/冲日
│   │   ├── ganZhi.ts            #   60 干支纪日
│   │   ├── calendar.ts          #   统一聚合 API (getCalendarDate)
│   │   └── index.ts             #   统一导出
│   ├── components/
│   │   ├── calendar/            #   CalendarGrid / GridCell / Navigation / DetailPanel / ViewSwitcher / WeekdayHeader
│   │   ├── events/              #   EventCard / EventModal / EventExport / EventList / HolidayPanel / Timeline
│   │   ├── layout/              #   MainLayout / AuthorGate / ErrorBoundary / LoadingScreen / ThemeToggle
│   │   └── ui/                  #   Button / Input / Toast / Tooltip
│   ├── store/
│   │   ├── useCalendarStore.ts  #   日历视图状态 (year/month/day/viewMode/theme)
│   │   └── useEventStore.ts     #   事件 CRUD + 云端同步
│   ├── hooks/
│   │   └── useAuthor.ts         #   作者认证 Hook
│   ├── styles/
│   │   └── theme.css            #   CSS 变量体系 + 深色主题
│   ├── types/
│   │   ├── calendar.ts          #   CalendarDate / SolarDate / LunarPrimaryDate 等
│   │   └── events.ts            #   CalendarEvent / RecurringHoliday / HistoricalEvent
│   ├── utils/
│   │   └── cn.ts                #   clsx + twMerge 工具函数
│   ├── __tests__/engine/        #   引擎测试 (6 文件 233 测试)
│   ├── App.tsx                  #   根组件
│   └── main.tsx                 #   入口
├── .github/workflows/ci.yml    # GitHub Actions CI
├── CLAUDE.md                    # 本文件
├── README.md                    # GitHub 首页
├── ROADMAP.md                   # 开发路线图
├── LICENSE                      # MIT
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── .prettierrc
```

---

## 核心架构概念

### 绝对日序数 (ABS)

所有计算的统一基准。ABS = 0 对应公元 0 年第 1 天。引擎内部全部基于 ABS 运算，UI 层通过 `getCalendarDate(abs)` 获取完整日期信息。

### 三轨历法

- **阳历**：350/351 天，8 年 5 闰 + 600 年修正
- **主月历**：朔望月 19.5883 天，无中气置闰法
- **副月历**：朔望月 41.4948 天，无中气置闰法

### 天象分级

| 等级 | 含义 | 标记 |
|------|------|------|
| S | 双月合朔（主月+副月同时朔） | 红点 |
| A | 双月冲日（主月+副月同时望） | 橙点 |
| B | 节气 / 主月朔望 / 副月朔望 | 文字标签 |
| C | 干支 / 潮汐 | Tooltip |

### 预计算缓存

`precomputeCacheSync()` 启动时预计算全量日期，`getCalendarDate(abs)` O(1) 查询。
`getYearStartAbs(year)` 使用 `_yearStartCache` 数组实现 O(1) 年首日获取。

### 事件系统

三种事件类型：`recurring-holiday`（按 solar 月日匹配）、`historical-event`（单次）、`astronomical-trigger`（基于天象）。作者通过口令验证后可 CRUD，数据存储在 Neon Postgres，游客只读。

---

## 开发命令

```bash
npm run dev          # 启动开发服务器 (Vite HMR)
npm run build        # 类型检查 + 生产构建 (tsc -b && vite build)
npm run typecheck    # 仅类型检查 (tsc --noEmit)
npm run lint         # ESLint 检查
npm run lint:fix     # ESLint 自动修复
npm run format       # Prettier 格式化
npm run test         # 运行全部测试 (vitest run)
npm run test:watch   # 测试监听模式
```

每次 push 前必须通过：`npm run typecheck && npm run lint && npm run test`

---

## 编码规范

### TypeScript

- `strict: true`，`noUnusedLocals: true`，`noUnusedParameters: true`
- 路径别名：`@/*` → `src/*`
- 命名：组件 PascalCase，函数/变量 camelCase，常量 UPPER_SNAKE_CASE
- 枚举使用 `enum`（非 `as const`），与现有 `MoonPhase` / `TideLevel` 一致

### CSS / Tailwind

- 使用 CSS 变量（`var(--bg-primary)` 等），不硬编码颜色值
- 类名合并使用 `cn()` 工具函数（`@/utils/cn`）
- 深色主题通过 `[data-theme='dark']` 选择器切换，不使用 Tailwind dark: 前缀
- 设计令牌定义在 `src/styles/theme.css`

### 组件风格

- 函数组件 + Hooks，不使用 class 组件
- Props 接口用 `interface` 定义，导出在文件末尾
- 使用 lucide-react 图标，不引入其他图标库
- 按钮使用 `@/components/ui/Button`，不自行创建按钮样式
- Toast 提示使用 `@/components/ui/Toast`，禁止 `alert()`

### 状态管理

- Zustand store 拆分：`useCalendarStore`（视图状态）+ `useEventStore`（事件数据）
- 使用 Zustand 的 selector 模式避免不必要的重渲染：`useCalendarStore(s => s.currentYear)`

### 引擎层

- `src/engine/` 下全部为纯函数，无 React / DOM 依赖
- 修改引擎算法后必须同步更新 `docs/历法.md`（权威数据源）
- 月份天数通过 `Math.round(globalIdx * SYNODIC_MONTH)` 累积舍入法计算
- 闰月通过 `hasZhongQi()` 检测月份内是否有中气判定

### API 层 (Vercel Serverless Functions)

- 使用标准 Vercel 格式：`export default function handler(req, res)`
- **不使用** Next.js App Router 格式（`export function GET()`）
- 文件为扁平 `.ts`（如 `api/auth.ts`），不使用嵌套目录 `route.ts`
- 无需 `vercel.json`，Vite preset 自动处理静态资源

---

## AI 行为约束

### 必须遵守

1. **历法.md 不可随意修改** — 这是世界观权威数据源，修改前必须与用户确认
2. **不添加无意义注释** — 代码自解释，仅在复杂算法处允许少量注释
3. **不引入未在 package.json 中的依赖** — 先检查再使用
4. **修改引擎后必须运行测试** — `npm run test` 确保 233 个测试全部通过
5. **提交前必须通过三重检查** — typecheck + lint + test
6. **禁止 `alert()` 原生弹窗** — 使用 Toast 组件
7. **禁止硬编码颜色值** — 使用 CSS 变量
8. **API 文件禁止使用 Next.js 格式** — 使用标准 Vercel handler 格式

### 代码风格

- **不添加注释**（除非用户明确要求）
- 遵循现有代码风格，先阅读相邻文件再动手
- 使用 `cn()` 合并 Tailwind 类名
- 组件导出使用命名导出（`export function Xxx`），不使用默认导出（`App.tsx` 除外）

### Git Commit 规范

```
类型(范围): 中文描述

类型：feat / fix / docs / chore / refactor / test
范围：可选，如 engine / layout / toast / event-store
描述：简洁中文，说明做了什么
```

示例：
- `feat(lunar-secondary): 副月历无中气置闰法`
- `fix(layout): 核心居中+垂直对齐占位`
- `docs: 添加MIT LICENSE文件`

### 工作流程

1. 修改代码 → 2. `npm run typecheck` → 3. `npm run lint` → 4. `npm run test` → 5. 提交

---

## 关键设计决策记录

| 决策 | 原因 |
|------|------|
| Vercel Serverless 而非纯前端 | 作者事件需要云端持久化 |
| 标准 Vercel handler 格式 | Next.js 格式在 Vercel Vite preset 下返回 404 |
| Neon Postgres 者而非 Supabase | 与 Vercel 生态集成更紧密 |
| CSS 变量而非 Tailwind dark: | 需要精细控制每个令牌的深色值 |
| 预计算缓存而非按需计算 | 5000 年范围数据量可控，O(1) 查询体验更好 |
| 累积舍入法而非固定大小月 | 更精确逼近真实朔望月周期 |
| 月龄直接比对而非 37 天周期 | 前者是真实天文计算，后者是近似伪算法 |

---

## 相关文档索引

| 文档 | 路径 | 用途 |
|------|------|------|
| 历法.md | `docs/历法.md` | 天文参数权威源，引擎实现依据 |
| PRD.md | `docs/PRD.md` | 产品需求，功能验收标准 |
| SPEC.md | `docs/SPEC.md` | 技术规格，算法细节 |
| ROADMAP.md | `ROADMAP.md` | 当前进度与后续计划 |
| Feedback.md | `docs/Feedback.md` | 历次开发反馈记录 |
| 项目分析报告.md | `docs/项目分析报告.md` | 第三方代码审计 |

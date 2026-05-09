# 双月合历 — 后续开发路线图 (ROADMAP)

> **文档版本**: v1.0.0  
> **基于**: 当前 V1.0 已部署产品 + PRD.md + SPEC.md  
> **目标读者**: AI编程助手 / 开发者 / 项目维护者  
> **使用方式**: 将此文件与历法.md、PRD.md、SPEC.md 一同放入项目根目录

---

## 当前状态

V1.0 已部署至 Vercel：`https://calendar-delta-brown.vercel.app/`

已完成功能：
- 历法引擎（阳历 + 主月历 + 天文事件 + 干支 + 潮汐），216 tests
- UI 组件体系（CalendarGrid / GridCell / WeekdayHeader / DetailPanel / Navigation / ViewSwitcher）
- 事件 CRUD 系统（EventModal / EventCard / EventList），LocalStorage 持久化
- 响应式布局（PC + 移动端）
- ErrorBoundary + LoadingScreen + SEO

---

## V1.1: 副月历引擎与视图

### 背景
SPEC.md 中副月历（恩底弥翁历）的引擎模块标记为 "V1.1 TODO"。
当前 `lunarSecondary` 在 `getCalendarDate()` 中返回占位对象（全部 0）。
ViewSwitcher 仅支持 'solar' ⇄ 'lunar-primary'，未包含副月历。

### 任务清单

#### 1.1 引擎模块 `src/engine/lunar-secondary.ts`
- 基于副月朔望月 41.4948 天
- 大月 42 天、小月 41 天
- 约 8.45 个副月/回归年
- 实现 `solarToLunarSecondary()` 和 `lunarSecondaryToAbs()`
- 月相映射使用 MOON_PHASE_CONFIG.SECONDARY（已在 constants.ts 中定义）

#### 1.2 引擎集成
- `src/engine/index.ts` 中取消 TODO 注释，激活副月历转换
- `getCalendarDate()` 返回真实的 `lunarSecondary` 对象而非占位

#### 1.3 UI 扩展
- `ViewSwitcher` 增加第三种模式：'lunar-secondary'
- `store/useCalendarStore.ts` 中 `ViewMode` 类型扩展为 `'solar' | 'lunar-primary' | 'lunar-secondary'`
- `GridCell` 在 `viewMode='lunar-secondary'` 时显示副月历信息行
- 副月历的网格结构不同（每月 41-42 天），可能需调整网格逻辑

#### 1.4 测试
- 副月历转换的双向验证测试
- 边界测试（0年1月1日 → 副月历日期，1200年最后一天）

---

## V1.2: 事件权限分层（作者 vs 游客）

### 背景
当前所有用户共享同一套浏览器 localStorage，数据完全本地。
需要引入后端数据存储 + 简单认证，实现：
- **作者**（通过口令/密钥验证）：可以创建/编辑/删除事件
- **游客**（任何访问 URL 的人）：可以查看日历和作者已发布的事件，但不能修改

### 架构方案

```
游客访问 → 只读日历 + 查看作者事件
                 ↓
           Vercel Postgres（服务器端数据库）
                 ↑
作者访问 → 口令验证 → 读写日历 + 增删改事件
```

### 任务清单

#### 2.1 Vercel Postgres 数据库
- 在 Vercel Dashboard 中创建 Postgres 数据库
- 创建 `events` 表（schema 与现有 CalendarEvent 类型对齐）：
  ```sql
  CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    date_anchor_abs INTEGER NOT NULL,
    date_anchor_solar JSONB,
    date_anchor_lunar_primary JSONB,
    display_color VARCHAR(7),
    display_priority INTEGER DEFAULT 3,
    recurrence JSONB
  );
  ```

#### 2.2 Vercel Serverless API
在 `api/` 目录下创建：

- `api/events/route.ts` — GET（列表查询，支持 `?abs=` 参数）/ POST（创建，需鉴权）
- `api/events/[id]/route.ts` — PUT（更新）/ DELETE（删除）
- `api/auth/route.ts` — POST 口令验证，返回 session token

#### 2.3 前端改造
- 新增 `src/components/layout/AuthorGate.tsx` — 登录界面（口令输入框 + "验证"按钮）
- `EventList` 中"创建新事件"按钮仅在作者模式下显示
- `EventCard` 中编辑/删除图标仅在作者模式下显示
- 游客模式下所有事件卡片为只读（无编辑/删除图标）
- 事件数据从 LocalStorage 迁移到 API 调用
- 网络失败时的离线降级策略

#### 2.4 作者口令管理
- V1.2 采用**环境变量**方案：在 Vercel 项目设置中配置 `AUTHOR_PASSWORD` 环境变量
- 前端验证：输入口令 → POST `/api/auth` → 服务端比对环境变量
- session 存储于浏览器 sessionStorage（关闭标签页即失效）
- V2.0 可升级为正式登录系统

---

## V1.3: 主题切换（浅色/深色）

### 背景
PRD.md 第 6 章设想了 Linear 风格的科幻/奇幻混合美学。
当前仅实现白色主题。深色主题对夜间创作场景有实际价值。

### 实现方案
- 在 `theme.css` 中添加 `[data-theme="dark"]` 选择器，覆盖 CSS 变量
- 使用 Tailwind CSS `dark:` 前缀（项目当前配置支持）
- Header 添加主题切换按钮（Sun/Moon 图标）
- 用户偏好存储于 localStorage，默认跟随系统 `prefers-color-scheme`
- 浅色主题保持现有设计不变

### 优先级说明
**低于 V1.2**。用户在对话中明确表示"白色护眼"，且作家通常白天创作。
深色模式是锦上添花的增强，非功能缺口。

---

## V2.0: 编辑器增强与多用户系统

### 计划中的功能

1. **事件编辑器富文本支持**：描述字段支持 Markdown 或富文本（V1.0 仅纯文本，已满足创作需求）
2. **时间线视图**：以水平时间轴展示选定范围内的事件序列
3. **事件导出**：导出为 JSON/CSV，方便离线编辑或备份
4. **正式用户系统**：替换 V1.2 的简单口令为 OAuth 登录（GitHub/Google）
5. **多人协作**：允许多位作者共同编辑日历（适合多人合写小说）

---

## 技术债与优化（待排期）

| 项目 | 说明 | 优先级 |
|------|------|--------|
| `useCalendarEngine.ts` hook | 缓存层封装。当前直调引擎性能足够，暂不需要 | 低 |
| E2E Playwright 测试 | 需部署后实际 URL，可与 CI 流程整合 | 中 |
| LocalStorage 损坏容灾 | V1.2 迁移至 Postgres 后自然解决 | 低 |
| `react-window` 虚拟化 | 35 个 Cell 远低于虚拟化阈值，无实际收益 | 极低 |
| `lunarPrimary.monthName` 闰月实现 | SPEC 中"无中气置闰法"待完整实现，当前 isLeapMonth 始终 false | 中 |
| GitHub Actions CI | push 时自动 `npm run test && npm run typecheck && npm run lint` | 中 |

---

## GitHub + Vercel 自动部署流水线

### 当前状态
手动部署：每次 `vercel --prod` 需本地执行。

### 目标状态
```
git push → GitHub 仓库 → Vercel 自动检测 → 自动构建 → 自动部署
```

### 操作步骤（由项目所有者手动完成）

1. **创建 GitHub 仓库**：
   - 访问 https://github.com/new
   - 仓库名：`calendar`（或自定义）
   - 设为 Public 或 Private（均可）
   - 不要勾选 "Initialize this repository"（项目已有文件）

2. **连接本地项目到 GitHub**（在终端执行）：
   ```bash
   cd c:\0000\Github\calendar
   git init
   git add .
   git commit -m "Initial commit: dual-moon calendar V1.0"
   git branch -M main
   git remote add origin https://github.com/你的用户名/calendar.git
   git push -u origin main
   ```

3. **连接 Vercel 到 GitHub**：
   - 访问 https://vercel.com/dashboard
   - 点击 "Add New..." → "Project"
   - 选择刚创建的 GitHub 仓库
   - 框架自动检测为 Vite
   - 直接点击 "Deploy"
   - 此后每次 `git push` 都会自动触发 Vercel 重新部署

4. **验证**：
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push
   ```
   然后观察 Vercel Dashboard 的 Deployments 标签页。

---

## 与新对话 AI 的交接清单

此对话（当前对话）覆盖的内容：
- 需求分析 → PRD.md 编制
- 技术规格 → SPEC.md 编制
- 完整实现 → Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4
- 部署 → Vercel 上线

**新对话的起点**：从 V1.1 副月历引擎开始，或从 V1.2 事件权限分层开始（根据你的优先选择）。

所有参考文档已就位于项目根目录：
- `历法.md` — 权威天文数据源
- `PRD.md` — 完整产品需求文档
- `SPEC.md` — 技术开发规格书
- `ROADMAP.md` — 本文档（后续开发计划）
- `反馈.md` — 历史开发反馈归档

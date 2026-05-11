# 双月合历 · Dual Moon Calendar

> 基于 2:1 共振双月系统的架空世界观历法引擎与可视化日历

[![CI](https://github.com/ZoeyVirgin/dual-moon-calendar/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoeyVirgin/dual-moon-calendar/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-233%20passed-brightgreen)](https://github.com/ZoeyVirgin/dual-moon-calendar)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**在线体验**：[calendar-delta-brown.vercel.app](https://calendar-delta-brown.vercel.app/)

---

## 简介

这是一个为小说创作设计的架空历法日历系统。世界观设定为一颗拥有两颗月球（2:1 轨道共振）的宜居行星，形成了独特的三轨历法体系：

| 历法 | 基准天文周期 | 用途 |
|------|-------------|------|
| **阳历（太阳历）** | 回归年 350.6266 天 | 农业四季、二十四节气 |
| **主月历（塞勒涅历）** | 主月朔望月 19.5883 天 | 日常纪日、月相观测 |
| **副月历（恩底弥翁历）** | 副月朔望月 41.4948 天 | 潮汐预测、航海导航 |

三种历法通过绝对日序数（ABS）统一坐标基准，形成"阳历定四季、主月定纪日、副月定潮汐"的协同体系。

---

## 功能

- 🌙 **三模式视图切换** — 阳历 / 主月历 / 副月历
- 🌊 **每日潮汐等级** — 大潮 / 中潮 / 小潮（基于双月会合周期）
- 🌑 **月相标记** — 8 阶段月相图标（朔/盈月/上弦/盈凸/望/亏凸/下弦/残月）
- 🎋 **二十四节气** — 均匀分布在回归年中
- 🐉 **60 干支纪日** — 独立于年月循环的传统纪日法
- 📝 **事件管理** — 添加/编辑/删除历史事件、周期性节日
- 👤 **作者权限** — 口令验证登录，游客只读
- 🌓 **深色模式** — 全站自适应主题切换
- 📤 **数据导出** — JSON / CSV 一键下载
- 📅 **事件时间线** — 按时间排序的故事事件轴

---

## 技术栈

| 层面 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 状态管理 | Zustand |
| 样式方案 | TailwindCSS |
| 数据库 | Neon Serverless Postgres |
| API | Vercel Serverless Functions |
| 测试 | Vitest (233 tests) |
| CI | GitHub Actions |
| 部署 | Vercel (自动部署) |

---

## 项目结构

```
src/
├── engine/              # 历法引擎（纯函数核心）
│   ├── constants.ts     #   天文常量与历法规则
│   ├── solar.ts         #   阳历转换
│   ├── lunar-primary.ts #   主月历（含无中气置闰法）
│   ├── lunar-secondary.ts#  副月历（含无中气置闰法）
│   ├── astronomical.ts  #   天象检测 + 潮汐计算
│   ├── ganZhi.ts        #   60干支纪日
│   └── calendar.ts      #   统一聚合API
├── components/          # UI组件
│   ├── calendar/        #   日历网格、导航、详情面板
│   ├── events/          #   事件卡片、模态框、时间线
│   ├── layout/          #   主布局、错误边界、加载屏
│   └── ui/              #   通用组件（Button/Input/Toast）
├── store/               # 状态管理（Zustand）
├── api/                 # Vercel Serverless Functions
├── types/               # TypeScript类型定义
└── __tests__/           # 测试套件（6文件/233测试）
```

---

## 核心算法

### 阳历系统
- **8年5闰** — 回归年 350.6266 天，8年设 5 个闰年，平均年长 350.625 天
- **600 年修正** — 年份能被 600 整除则变为平年，万年累积误差 < 1 天
- 平年 350 天（1月30天 + 2-11月各29天 + 12月30天），闰年 351 天（12月改为31天）

### 主月历（塞勒涅历）
- 朔望月 19.5883 天，大月 20 天 / 小月 19 天，累积舍入法自动分配
- **无中气置闰法** — 月份内无中气（偶数位节气）则为闰月

### 副月历（恩底弥翁历）
- 朔望月 41.4948 天，大月 42 天 / 小月 41 天
- 同为无中气置闰法，约 8.45 个副月/回归年

### 双月合朔/冲日
- 基于两月月龄同时比对，±3 天容差
- S 级（双月合朔）约 812.5 天一次

---

## 相关文档

项目文档统一存放于 `docs/` 目录：

| 文档 | 内容 |
|------|------|
| [历法.md](./docs/历法.md) | 架空世界天文参数与历法规则（权威数据源） |
| [PRD.md](./docs/PRD.md) | 产品需求文档 |
| [SPEC.md](./docs/SPEC.md) | 技术开发规格书 |
| [ROADMAP.md](./ROADMAP.md) | 后续开发路线图 |
| [Feedback.md](./docs/Feedback.md) | 开发过程反馈记录 |
| [项目分析报告.md](./docs/项目分析报告.md) | 第三方代码审计报告 |

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 构建生产版本
npm run build
```

---

## 许可证

MIT License — 详见 LICENSE 文件。

---

> 双月辉映，时光流转。以星为历，以心纪年。

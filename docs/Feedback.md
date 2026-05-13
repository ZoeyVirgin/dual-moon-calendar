# DetailPanel+Timeline 高度约束 — 消除页面滚动条

## ✅ 完成状态

### 修改的文件

| 文件 | 改动 |
|:-----|:-----|
| `src/components/calendar/DetailPanel.tsx` | B区+C区包裹进 `max-h-[240px] overflow-y-auto` 滚动容器，A区保持可见 |
| `src/components/events/Timeline.tsx` | `max-h-[360px]` → `max-h-[240px]` |

### 运行结果

| 命令 | 结果 |
|:-----|:-----|
| `npm run typecheck` | 0 errors |
| `npm run lint` | 0 errors (1 pre-existing warning) |
| `npm run test` | 233 passed |

### 验证

翻到天象密集日期（如双月合朔日），展开 DetailPanel + Timeline，页面不出现滚动条。B+C 区内部和 Timeline 内部允许细滚动条，A区始终完全可见。

---

# 副月历闰月系统 — 完成反馈

## ✅ 完成状态

### 修改的文件

`src/engine/lunar-secondary.ts` — 完全重写，添加无中气置闰逻辑：

| 功能 | 改动 |
|:-----|:-----|
| `hasZhongQi()` | 新增，与主月历共用中气集合和 detectSolarTerm |
| `resolveYearMonth()` | 重写，返回 `{ year, month, isLeap }`，无中气→闰月 |
| `solarToLunarSecondary()` | 解构 `isLeap`，`isLeapMonth` 不再恒为 false |
| `lunarSecondaryToAbs()` | 重写，匹配 `isLeapMonth` 标志正确区分同名闰月/正常月 |

### 运行结果

| 命令 | 结果 |
|:-----|:-----|
| `npm run test` | 233 passed |
| `npm run build` | ✓ 2.35s |

### 验证

切换至副月历视图后，可看到 `isLeapMonth: true` 的月份（副月历中每2年约1个闰月）。

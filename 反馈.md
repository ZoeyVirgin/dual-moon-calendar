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

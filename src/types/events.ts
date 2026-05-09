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

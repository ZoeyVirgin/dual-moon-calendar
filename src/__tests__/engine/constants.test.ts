import { describe, it, expect } from 'vitest';
import {
  ASTRONOMICAL_CONSTANTS,
  SOLAR_RULES,
  WEEKDAY_NAMES,
  STEMS,
  BRANCHES,
  SOLAR_TERMS,
  MOON_PHASE_CONFIG,
  SYNODIC_EVENT_CONFIG,
  GAN_ZHI_CYCLE,
} from '@/engine/constants';

// ============================================
// 天文常量正确性验证
// ============================================
describe('天文常量正确性验证', () => {
  it('回归年应该为350.6266天', () => {
    expect(ASTRONOMICAL_CONSTANTS.TROPICAL_YEAR).toBe(350.6266);
  });

  it('主月朔望月应该为19.5883天', () => {
    expect(ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_PRIMARY).toBe(19.5883);
  });

  it('副月朔望月应该为41.4948天', () => {
    expect(ASTRONOMICAL_CONSTANTS.SYNODIC_MONTH_SECONDARY).toBe(41.4948);
  });

  it('双月会合周期应该为37.1040天', () => {
    expect(ASTRONOMICAL_CONSTANTS.SYNODIC_CONJUNCTION_CYCLE).toBe(37.1040);
  });

  it('岁差周期应该为18000回归年', () => {
    expect(ASTRONOMICAL_CONSTANTS.PRECESSION_CYCLE).toBe(18000);
  });

  it('时间范围应在0-5000年之间', () => {
    expect(ASTRONOMICAL_CONSTANTS.MIN_YEAR).toBe(0);
    expect(ASTRONOMICAL_CONSTANTS.MAX_YEAR).toBe(5000);
  });

  it('ABS起点应为0', () => {
    expect(ASTRONOMICAL_CONSTANTS.ABS_ORIGIN).toBe(0);
  });
});

// ============================================
// 阳历规则验证
// ============================================
describe('阳历规则验证', () => {
  it('平年天数应为350天（已修正）', () => {
    expect(SOLAR_RULES.DAYS_IN_COMMON_YEAR).toBe(350);
  });

  it('闰年天数应为351天', () => {
    expect(SOLAR_RULES.DAYS_IN_LEAP_YEAR).toBe(351);
  });

  it('月份天数数组应包含13个元素（含占位符）', () => {
    expect(SOLAR_RULES.MONTH_DAYS).toHaveLength(13); // index 0-12
  });

  it('1月应有30天', () => {
    expect(SOLAR_RULES.MONTH_DAYS[1]).toBe(30);
  });

  it('2-11月均应为29天', () => {
    for (let m = 2; m <= 11; m++) {
      expect(SOLAR_RULES.MONTH_DAYS[m]).toBe(29);
    }
  });

  it('12月默认应为30天（平年）', () => {
    expect(SOLAR_RULES.MONTH_DAYS[12]).toBe(30);
  });

  it('闰年余数应包含5个值', () => {
    expect(SOLAR_RULES.LEAP_YEAR_REMAINDERS).toHaveLength(5);
  });

  it('闰年余数应为 [1, 2, 4, 5, 7]', () => {
    expect(SOLAR_RULES.LEAP_YEAR_REMAINDERS).toEqual([1, 2, 4, 5, 7]);
  });

  it('600年长期修正周期应正确', () => {
    expect(SOLAR_RULES.CENTURIAL_CORRECTION_CYCLE).toBe(600);
  });

  it('平年月份天数总和应为350', () => {
    // 1月30 + 2-11月各29(共290) + 12月29 = 350
    const days = SOLAR_RULES.MONTH_DAYS.slice(1) as number[];
    const sum = days.reduce((a, b) => a + b, 0);
    expect(sum).toBe(350);
  });
});

// ============================================
// 星期系统验证
// ============================================
describe('星期系统验证', () => {
  it('应包含5个 weekday 名称', () => {
    expect(Object.keys(WEEKDAY_NAMES)).toHaveLength(5);
  });

  it('weekday 1 应为人天', () => {
    expect(WEEKDAY_NAMES[1]).toBe('人天');
  });

  it('weekday 2 应为兽天', () => {
    expect(WEEKDAY_NAMES[2]).toBe('兽天');
  });

  it('weekday 3 应为碧森天', () => {
    expect(WEEKDAY_NAMES[3]).toBe('碧森天');
  });

  it('weekday 4 应为岩矿天', () => {
    expect(WEEKDAY_NAMES[4]).toBe('岩矿天');
  });

  it('weekday 5 应为龙天', () => {
    expect(WEEKDAY_NAMES[5]).toBe('龙天');
  });
});

// ============================================
// 干支系统验证
// ============================================
describe('干支系统验证', () => {
  it('天干应有10个', () => {
    expect(STEMS).toHaveLength(10);
  });

  it('地支应有12个', () => {
    expect(BRANCHES).toHaveLength(12);
  });

  it('天干第一个应为甲', () => {
    expect(STEMS[0]).toBe('甲');
  });

  it('天干最后一个应为癸', () => {
    expect(STEMS[9]).toBe('癸');
  });

  it('地支第一个应为子', () => {
    expect(BRANCHES[0]).toBe('子');
  });

  it('地支最后一个应为亥', () => {
    expect(BRANCHES[11]).toBe('亥');
  });

  it('干支循环应为60（10×12的最小公倍数）', () => {
    expect(GAN_ZHI_CYCLE).toBe(60);
  });
});

// ============================================
// 二十四节气验证
// ============================================
describe('二十四节气验证', () => {
  it('应包含24个节气', () => {
    expect(SOLAR_TERMS).toHaveLength(24);
  });

  it('第1个节气应为立春', () => {
    expect(SOLAR_TERMS[0]).toBe('立春');
  });

  it('第4个节气应为春分', () => {
    expect(SOLAR_TERMS[3]).toBe('春分');
  });

  it('第12个节气应为大暑', () => {
    expect(SOLAR_TERMS[11]).toBe('大暑');
  });

  it('第16个节气应为秋分', () => {
    expect(SOLAR_TERMS[15]).toBe('秋分');
  });

  it('第22个节气应为冬至', () => {
    expect(SOLAR_TERMS[21]).toBe('冬至');
  });

  it('最后一个节气应为大寒', () => {
    expect(SOLAR_TERMS[23]).toBe('大寒');
  });
});

// ============================================
// 月相配置验证
// ============================================
describe('月相配置验证', () => {
  it('主月朔望月周期应为19.5883天', () => {
    expect(MOON_PHASE_CONFIG.PRIMARY.cycleLength).toBe(19.5883);
  });

  it('副月朔望月周期应为41.4948天', () => {
    expect(MOON_PHASE_CONFIG.SECONDARY.cycleLength).toBe(41.4948);
  });

  it('主月应有8个月相阶段', () => {
    expect(MOON_PHASE_CONFIG.PRIMARY.phases).toHaveLength(8);
  });

  it('副月应有8个月相阶段', () => {
    expect(MOON_PHASE_CONFIG.SECONDARY.phases).toHaveLength(8);
  });

  it('主月第1个相位应为朔（new-moon）', () => {
    const firstPhase = MOON_PHASE_CONFIG.PRIMARY.phases[0];
    expect(firstPhase.name).toBe('new-moon');
    expect(firstPhase.label).toBe('朔');
    expect(firstPhase.startAge).toBe(0);
  });
});

// ============================================
// 双月合朔/冲日配置验证
// ============================================
describe('双月合朔/冲日配置验证', () => {
  it('合朔周期应为812.5天', () => {
    expect(SYNODIC_EVENT_CONFIG.conjunctionCycle).toBe(812.5);
  });

  it('冲日偏移应为406.25天（半个合朔周期）', () => {
    expect(SYNODIC_EVENT_CONFIG.oppositionOffset).toBe(406.25);
  });

  it('合朔周期应等于冲日偏移的2倍', () => {
    expect(SYNODIC_EVENT_CONFIG.conjunctionCycle).toBe(
      SYNODIC_EVENT_CONFIG.oppositionOffset * 2,
    );
  });
});

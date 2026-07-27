export type RunKind = 'standard' | 'long' | 'consolidation';

export type RunDay = {
  title: string;
  distance: string;
  intensity: string;
  kind: RunKind;
  guidance: string;
};

export type WeekPlan = {
  total: string;
  phase: 'Foundation' | 'Deload' | 'Build' | 'Consolidate';
  tuesday: RunDay;
  thursday: RunDay;
  sunday: RunDay;
};

export type DayDetails = {
  week: number;
  day: number;
  selected: Date;
  outOfRange: boolean;
};

export type CalendarView = 'month' | 'week';

export type DayMeta = {
  short: string;
  compact: string;
  type: 'none' | 'recovery' | 'run' | 'strength' | 'long' | 'quality';
};

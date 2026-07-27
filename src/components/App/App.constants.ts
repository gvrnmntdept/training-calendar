import type { DayMeta, RunDay, WeekPlan } from './App.types';

export const kickerClass = 'mb-3 flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.14em] text-stone-600 uppercase';
export const displayHeadingClass = 'font-display text-[clamp(3.5rem,6.3vw,6.5rem)] leading-[0.84] font-bold tracking-[-0.055em] uppercase italic';
export const iconButtonClass = 'grid size-10 shrink-0 place-items-center border border-stone-300 bg-white transition hover:border-stone-950 hover:bg-stone-950 hover:text-white';
export const panelClass = 'border border-stone-950 bg-white';

export const sessionDotClasses: Record<DayMeta['type'], string> = {
  none: 'bg-stone-300',
  recovery: 'bg-stone-300',
  run: 'bg-blue-600',
  strength: 'bg-lime-300',
  long: 'bg-blue-600',
  quality: 'bg-orange-500',
};

const standardRun = (distance: number, day: 'Tuesday' | 'Thursday'): RunDay => ({
  title: day === 'Tuesday' ? 'Standard run' : 'Flexible run',
  distance: `${distance} km`,
  intensity: 'Preferred sustainable pace',
  kind: 'standard',
  guidance: day === 'Tuesday'
    ? 'Let the pace emerge naturally. Do not sprint the opening kilometre or race your previous time.'
    : 'Begin slightly slower after Wednesday strength. If your legs feel heavy, reduce pace rather than distance.',
});

const longRun = (distance: number): RunDay => ({
  title: 'Long run',
  distance: `${distance} km`,
  intensity: 'Sustainable · never a race',
  kind: 'long',
  guidance: 'Run the first kilometre slower than instinct suggests, then settle in. Brief walking is acceptable.',
});

export const runningPlan: WeekPlan[] = [
  { total: '14 km', phase: 'Foundation', tuesday: standardRun(4, 'Tuesday'), thursday: standardRun(4, 'Thursday'), sunday: longRun(6) },
  { total: '16 km', phase: 'Foundation', tuesday: standardRun(4, 'Tuesday'), thursday: standardRun(5, 'Thursday'), sunday: longRun(7) },
  { total: '18 km', phase: 'Foundation', tuesday: standardRun(5, 'Tuesday'), thursday: standardRun(5, 'Thursday'), sunday: longRun(8) },
  { total: '14 km', phase: 'Deload', tuesday: standardRun(4, 'Tuesday'), thursday: standardRun(4, 'Thursday'), sunday: longRun(6) },
  { total: '19 km', phase: 'Build', tuesday: standardRun(5, 'Tuesday'), thursday: standardRun(6, 'Thursday'), sunday: longRun(8) },
  { total: '21 km', phase: 'Build', tuesday: standardRun(6, 'Tuesday'), thursday: standardRun(6, 'Thursday'), sunday: longRun(9) },
  { total: '23 km', phase: 'Build', tuesday: standardRun(6, 'Tuesday'), thursday: standardRun(7, 'Thursday'), sunday: longRun(10) },
  {
    total: '13 km',
    phase: 'Consolidate',
    tuesday: standardRun(4, 'Tuesday'),
    thursday: standardRun(4, 'Thursday'),
    sunday: {
      title: '5K consolidation',
      distance: '5 km',
      intensity: 'Comfortable, moderate or optional time trial',
      kind: 'consolidation',
      guidance: 'Choose the effort before Saturday strength. A time trial is optional; a normal comfortable run completes the program just as well.',
    },
  },
];

export const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

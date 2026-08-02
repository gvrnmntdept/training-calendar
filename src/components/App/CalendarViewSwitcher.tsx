import { cn } from './App.helpers';
import type { CalendarView } from './App.types';

type CalendarViewSwitcherProps = {
  view: CalendarView;
  onChange: (view: CalendarView) => void;
};

export default function CalendarViewSwitcher({ view, onChange }: CalendarViewSwitcherProps) {
  return (
    <div className="grid min-h-10 grid-cols-2 border border-line bg-stone-100" aria-label="Calendar view" role="group">
      <button
        type="button"
        className={cn('px-4 text-[0.625rem] font-bold tracking-[0.08em] uppercase transition hover:text-stone-950', view === 'month' ? '!bg-stone-950 !text-white hover:!text-white' : 'text-stone-600')}
        aria-pressed={view === 'month'}
        onClick={() => onChange('month')}
      >
        Month
      </button>
      <button
        type="button"
        className={cn('px-4 text-[0.625rem] font-bold tracking-[0.08em] uppercase transition hover:text-stone-950', view === 'week' ? '!bg-stone-950 !text-white hover:!text-white' : 'text-stone-600')}
        aria-pressed={view === 'week'}
        onClick={() => onChange('week')}
      >
        Week
      </button>
    </div>
  );
}

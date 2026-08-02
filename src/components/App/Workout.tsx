import type { ReactNode } from 'react';
import { Dumbbell, Footprints, HeartPulse, Zap } from 'lucide-react';

import { kickerClass } from './App.constants';
import { cn } from './App.helpers';
import type { RunDay } from './App.types';

type WorkoutProps = {
  title: string;
  intensity: string;
  icon: ReactNode;
  accent: 'lime' | 'blue' | 'orange';
  children: ReactNode;
};

function Workout({ title, intensity, icon, accent, children }: WorkoutProps) {
  const accentClasses = {
    lime: { icon: 'bg-lime-300 text-stone-950', pill: 'border-frame bg-lime-50 text-stone-950' },
    blue: { icon: 'bg-blue-600 text-white', pill: 'border-frame bg-blue-50 text-blue-700' },
    orange: { icon: 'bg-orange-500 text-white', pill: 'border-frame bg-orange-50 text-orange-700' },
  }[accent];

  return (
    <section className="flex min-h-[31.5rem] flex-col">
      <div className="grid gap-5 px-5 pt-7 pb-5 sm:px-8">
        <div className={cn('grid size-12 place-items-center', accentClasses.icon)}>{icon}</div>
        <div>
          <p className={cn(kickerClass, 'mb-2')}>Selected session</p>
          <h3 className="font-display text-[clamp(1.75rem,2.4vw,2.35rem)] leading-none font-semibold tracking-tight uppercase">{title}</h3>
        </div>
        <span className={cn('w-fit border px-2.5 py-1.5 text-[0.5625rem] font-bold tracking-wider uppercase', accentClasses.pill)}>{intensity}</span>
      </div>
      <div className="grid gap-3 px-5 pb-7 sm:px-8">{children}</div>
    </section>
  );
}

export function RestWorkout() {
  return (
    <Workout title="Complete rest" icon={<HeartPulse />} intensity="RECOVER" accent="blue">
      <p className="font-display mb-2 text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-semibold tracking-tight uppercase">No training today.</p>
      <div className="border-l-4 border-frame bg-stone-50 p-4">
        <p className={cn(kickerClass, 'mb-1')}>Keep the schedule open</p>
        <p className="m-0 text-sm leading-6 text-stone-600">Do not move a missed run or strength session here. A relaxed walk is fine.</p>
      </div>
      <Callout title="Missed session">Resume with the next planned day. Never combine two sessions to catch up.</Callout>
    </Workout>
  );
}

export function RunWorkout({ run }: { run: RunDay }) {
  const accent = run.kind === 'consolidation' ? 'orange' : 'blue';
  return (
    <Workout title={run.title} icon={<Footprints />} intensity={run.intensity.toUpperCase()} accent={accent}>
      <p className="font-display mb-2 text-[clamp(3rem,7vw,5.5rem)] leading-none font-semibold tracking-tight uppercase">{run.distance}</p>
      <Callout title="Today’s cue">{run.guidance}</Callout>
      <Callout title="Effort check">Finish feeling that you could have continued another 10–15 minutes. Heart rate is informational only.</Callout>
    </Workout>
  );
}

export function StrengthWorkout({ label, items, week, session }: {
  label: string;
  items: string[][];
  week: number;
  session: 'A' | 'B';
}) {
  const duration = session === 'A' ? '30–40 MIN' : '25–35 MIN';
  return (
    <Workout title={label} icon={<Dumbbell />} intensity={duration} accent="lime">
      <ExerciseList items={items} />
      <Callout title="Progression">Add repetitions gradually. Increase difficulty only after every set reaches the top of its range.</Callout>
      {session === 'A' && <Callout title="Chin-up standard">Use straight elbows, no swing, chin over the bar and a controlled descent. Record both strict sets.</Callout>}
      {session === 'B' && week !== 8 && <Callout title="Band progression">Build from 4 × 5 to 4 × 8, then switch to a thinner band and return to 4 × 5.</Callout>}
      {week === 4 && <Callout title="Deload week">Everything should feel deliberately easy. Do not add sets.</Callout>}
      {week === 8 && session === 'B' && <Callout title="Sunday decision">For a hard 5K or time trial, skip lunges and single-leg bridges. Keep them only if Sunday will be comfortable.</Callout>}
    </Workout>
  );
}

function ExerciseList({ items }: { items: string[][] }) {
  return (
    <ul className="mb-2 grid list-none divide-y divide-hairline border-y border-line p-0">
      {items.map(([name, dose], index) => (
        <li className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-5" key={name}>
          <span className="flex items-center gap-3 text-sm font-semibold"><i className="font-display text-xs font-semibold not-italic text-stone-600">{String(index + 1).padStart(2, '0')}</i>{name}</span>
          <strong className="pl-7 text-xs text-stone-500 sm:pl-0 sm:text-right">{dose}</strong>
        </li>
      ))}
    </ul>
  );
}

function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 border border-line bg-stone-50 p-3.5 text-xs leading-5 text-stone-600">
      <Zap className="mt-0.5 shrink-0 text-blue-600" size={16} />
      <span>{title && <strong className="text-stone-950">{title} — </strong>}{children}</span>
    </div>
  );
}

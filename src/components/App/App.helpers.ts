import { runningPlan } from './App.constants';
import type { DayDetails, DayMeta } from './App.types';

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function strengthA(week: number) {
  if (week === 4) {
    return [
      ['Strict chin-ups', '1 maximum-quality set'],
      ['Negative chin-ups', '2 × 3 · lower for 3 sec'],
      ['Push-ups', '2 × 6–12'],
      ['Bodyweight squats', '2 × 10–15'],
      ['Glute bridges', '2 × 10–15'],
      ['Dead bug', '1 × 8 per side'],
    ];
  }

  if (week === 8) {
    return [
      ['Strict chin-ups', '1 maximum-quality set'],
      ['Negative chin-ups', '2 × 3–4 · lower for 3 sec'],
      ['Push-ups', '2 × 6–12'],
      ['Bodyweight squats', '2 × 10–15'],
      ['Glute bridges', '2 × 10–15'],
      ['Dead bug', '1 × 8 per side'],
    ];
  }

  return [
    ['Strict chin-ups', '2 maximum-quality sets · rest 2–3 min'],
    ['Negative chin-ups', '3 × 3–4 · lower for 3 sec'],
    ['Push-ups', '3 × 6–12 · leave 2 reps'],
    ['Bodyweight squats', '3 × 10–15'],
    ['Glute bridges', '3 × 10–15'],
    ['Dead bug', '2 × 8 per side'],
  ];
}

export function strengthB(week: number) {
  if (week === 4) {
    return [
      ['Band-assisted chin-ups', '2 × 5–8'],
      ['Push-ups', '2 × 6–12'],
      ['Reverse lunges', '1 × 8 per leg'],
      ['Single-leg glute bridges', '1 × 8–12 per leg'],
      ['Front plank', '1 × 30–60 sec'],
    ];
  }

  if (week === 8) {
    return [
      ['Band-assisted chin-ups', '2 light sets of 5–8'],
      ['Push-ups', '2 light sets of 6–12'],
      ['Reverse lunges', 'Optional 1 × 8 per leg if Sunday is easy'],
      ['Single-leg glute bridges', 'Optional 1 × 8 per leg if Sunday is easy'],
      ['Front plank', '1 light set of 30–45 sec'],
    ];
  }

  return [
    ['Band-assisted chin-ups', '4 × 5–8 · rest 2–3 min'],
    ['Push-ups', '3 × 6–12 · leave 2–3 reps'],
    ['Reverse lunges', '2 × 8 per leg'],
    ['Single-leg glute bridges', '2 × 8–12 per leg'],
    ['Front plank', '2 × 30–60 sec'],
  ];
}

export function mondayOf(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() + (day === 0 ? -6 : 1 - day));
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function dateDiffDays(a: Date, b: Date) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcA - utcB) / 86_400_000);
}

export function getDetails(date: Date, start: Date): DayDetails {
  const week = Math.floor(dateDiffDays(date, mondayOf(start)) / 7) + 1;
  return { week, day: date.getDay(), selected: date, outOfRange: week < 1 || week > 8 };
}

function compactDistance(distance: string) {
  return distance.replace(' km', 'K');
}

export function getDayMeta(details: DayDetails): DayMeta {
  if (details.outOfRange) return { short: '', compact: '', type: 'none' };
  const week = runningPlan[details.week - 1];
  if (details.day === 1 || details.day === 5) return { short: 'Complete rest', compact: 'Rest', type: 'recovery' };
  if (details.day === 2) return { short: `${week.tuesday.distance} run`, compact: `${compactDistance(week.tuesday.distance)} run`, type: 'run' };
  if (details.day === 3) return { short: 'Strength A', compact: 'STR A', type: 'strength' };
  if (details.day === 4) return { short: `${week.thursday.distance} run`, compact: `${compactDistance(week.thursday.distance)} run`, type: 'run' };
  if (details.day === 6) return { short: 'Strength B', compact: 'STR B', type: 'strength' };
  return {
    short: week.sunday.title,
    compact: details.week === 8 ? '5K effort' : `${compactDistance(week.sunday.distance)} long`,
    type: details.week === 8 ? 'quality' : 'long',
  };
}

export function isCompletedSession(date: Date, today: Date, meta: DayMeta) {
  return dateDiffDays(date, today) < 0 && meta.type !== 'none' && meta.type !== 'recovery';
}

export function getDayStory(meta: DayMeta) {
  if (meta.type === 'recovery') {
    return {
      title: 'Absorb the work.',
      body: 'Rest is part of the program, not an empty placeholder. Keep the day clear so the next session starts with useful energy.',
    };
  }

  if (meta.type === 'strength') {
    return {
      title: 'Build durable strength.',
      body: 'Move with control, stop before form deteriorates and leave enough in reserve for the next scheduled run.',
    };
  }

  if (meta.type === 'long') {
    return {
      title: 'Extend without racing.',
      body: 'The goal is more comfortable time on your feet. A patient opening kilometre matters more than the finishing pace.',
    };
  }

  if (meta.type === 'quality') {
    return {
      title: 'Finish feeling capable.',
      body: 'Choose the effort before you start. A controlled run completes the block just as successfully as a hard 5K attempt.',
    };
  }

  return {
    title: 'Reinforce the rhythm.',
    body: 'Let sustainable effort do the work. Consistency across the block matters more than any single pace or split.',
  };
}

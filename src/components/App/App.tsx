'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Footprints,
  Gauge,
  HeartPulse,
  Settings2,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

import {
  dayLabels,
  displayHeadingClass,
  iconButtonClass,
  kickerClass,
  panelClass,
  runningPlan,
  sessionDotClasses,
} from './App.constants';
import {
  addDays,
  cn,
  dateDiffDays,
  formatDateInput,
  getDayMeta,
  getDetails,
  isCompletedSession,
  mondayOf,
  parseLocalDate,
  strengthA,
  strengthB,
} from './App.helpers';
import type { CalendarView } from './App.types';
import CalendarViewSwitcher from './CalendarViewSwitcher';
import Rule from './Rule';
import { RestWorkout, RunWorkout, StrengthWorkout } from './Workout';

export default function App() {
  const initialToday = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState(() => formatDateInput(mondayOf(initialToday)));
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput(initialToday));
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(initialToday.getFullYear(), initialToday.getMonth(), 1));
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const details = useMemo(
    () => getDetails(parseLocalDate(selectedDate), parseLocalDate(startDate)),
    [selectedDate, startDate],
  );

  const monthDays = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const gridStart = addDays(first, -offset);
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [calendarMonth]);

  const weekDays = useMemo(() => {
    const weekStart = mondayOf(parseLocalDate(selectedDate));
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [selectedDate]);

  const monthGridTabStop = monthDays.some((date) => formatDateInput(date) === selectedDate)
    ? selectedDate
    : formatDateInput(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1));

  const dateLabel = details.selected.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const activeWeek = details.outOfRange ? null : runningPlan[details.week - 1];
  const phase = activeWeek?.phase ?? 'Reset';
  const selectedMeta = getDayMeta(details);
  const selectedIsCompleted = isCompletedSession(details.selected, initialToday, selectedMeta);

  const outlookStats = useMemo(() => {
    const blockStart = mondayOf(parseLocalDate(startDate));
    const todayOffset = dateDiffDays(initialToday, blockStart);
    const sessionOffsets = [1, 2, 3, 5, 6];
    const runOffsets = [1, 3, 6];
    const completedSessions = runningPlan.reduce((count, _week, weekIndex) => (
      count + sessionOffsets.filter((offset) => todayOffset >= weekIndex * 7 + offset).length
    ), 0);
    const completedDistanceByWeek = runningPlan.map((week, weekIndex) => {
      const distances = [week.tuesday.distance, week.thursday.distance, week.sunday.distance]
        .map((distance) => Number.parseInt(distance, 10));
      return distances.reduce((total, distance, runIndex) => (
        todayOffset >= weekIndex * 7 + runOffsets[runIndex] ? total + distance : total
      ), 0);
    });
    const todayDetails = getDetails(initialToday, blockStart);
    const todayWeek = todayDetails.outOfRange ? null : runningPlan[todayDetails.week - 1];

    return {
      completedDistanceByWeek,
      completedSessions,
      details: todayDetails,
      phase: todayOffset < 0 ? 'Not started' : todayOffset >= 56 ? 'Complete' : todayWeek?.phase ?? 'Reset',
      progress: Math.round((completedSessions / 40) * 100),
      todayOffset,
      week: todayWeek,
    };
  }, [initialToday, startDate]);

  const nextSession = useMemo(() => {
    const selected = parseLocalDate(selectedDate);
    const start = parseLocalDate(startDate);
    for (let offset = 1; offset <= 14; offset += 1) {
      const date = addDays(selected, offset);
      const meta = getDayMeta(getDetails(date, start));
      if (meta.type !== 'none' && meta.type !== 'recovery') return { date, meta };
    }
    return null;
  }, [selectedDate, startDate]);

  function selectDate(date: Date) {
    setSelectedDate(formatDateInput(date));
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function goToday() {
    selectDate(new Date());
  }

  function goTodayAndScroll() {
    goToday();
    window.requestAnimationFrame(() => {
      document.getElementById('calendar')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  }

  function shiftSelectedDay(amount: number) {
    selectDate(addDays(parseLocalDate(selectedDate), amount));
  }

  function shiftMonth(amount: number) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  function shiftCalendar(amount: number) {
    if (calendarView === 'month') {
      shiftMonth(amount);
      return;
    }
    selectDate(addDays(parseLocalDate(selectedDate), amount * 7));
  }

  function moveCalendarFocus(date: Date) {
    selectDate(date);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-calendar-date="${formatDateInput(date)}"]`)?.focus();
    });
  }

  function handleCalendarKeyDown(event: React.KeyboardEvent<HTMLElement>, date: Date) {
    const weekdayIndex = (date.getDay() + 6) % 7;
    const dayOffsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -weekdayIndex,
      End: 6 - weekdayIndex,
    };
    const offset = dayOffsets[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    moveCalendarFocus(addDays(date, offset));
  }

  function renderWorkout() {
    if (details.outOfRange) {
      return (
        <section className="grid min-h-80 place-content-center px-8 py-14 text-center text-stone-500">
          <CalendarDays size={30} />
          <p className={cn(kickerClass, 'mt-5 justify-center')}>No programmed session</p>
          <h3 className="font-display text-3xl font-semibold text-stone-950 uppercase">Outside your 8-week block.</h3>
          <p className="mx-auto mt-3 max-w-md leading-6">Move to a highlighted date or adjust the block start to reframe your plan.</p>
        </section>
      );
    }

    const week = runningPlan[details.week - 1];
    if (details.day === 1 || details.day === 5) return <RestWorkout />;
    if (details.day === 2) return <RunWorkout run={week.tuesday} />;
    if (details.day === 3) return <StrengthWorkout label="Strength A · intensity" items={strengthA(details.week)} week={details.week} session="A" />;
    if (details.day === 4) return <RunWorkout run={week.thursday} />;
    if (details.day === 6) return <StrengthWorkout label="Strength B · volume" items={strengthB(details.week)} week={details.week} session="B" />;
    return <RunWorkout run={week.sunday} />;
  }

  const focus = outlookStats.todayOffset < 0
    ? 'Choose your start.'
    : outlookStats.todayOffset >= 56
      ? 'Block complete.'
      : outlookStats.phase === 'Foundation'
      ? 'Build the pattern.'
      : outlookStats.phase === 'Deload'
        ? 'Absorb the work.'
        : outlookStats.phase === 'Build'
          ? 'Extend the base.'
          : 'Finish feeling capable.';

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950 [background-image:linear-gradient(rgba(17,17,15,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,15,0.025)_1px,transparent_1px)] [background-size:28px_28px]">
      <a className="fixed top-3 left-3 z-50 -translate-y-24 bg-stone-950 px-4 py-3 text-sm font-bold text-white transition focus:translate-y-0" href="#main-content">Skip to main content</a>
      <div className="mx-auto w-[min(calc(100%-2rem),92.5rem)] pb-9 sm:w-[min(calc(100%-2.5rem),92.5rem)]">
        <nav className="relative z-10 grid min-h-20 grid-cols-[1fr_auto] items-center border-b border-stone-950 md:grid-cols-[1fr_auto_1fr]" aria-label="Primary navigation">
          <a className="inline-flex w-max items-center gap-3 text-[0.8125rem] font-bold tracking-[0.13em]" href="#calendar" aria-label="Form training home">
            <span className="font-display grid size-8 place-items-center bg-lime-300 text-base font-bold [clip-path:polygon(0_0,100%_0,77%_100%,0_100%)]">F</span>
            <span>FORM / BASE</span>
          </a>
          <div className="hidden items-stretch gap-8 self-stretch text-xs font-bold tracking-[0.08em] text-stone-600 uppercase md:flex">
            <a className="flex items-center border-b-[3px] border-blue-600 text-stone-950" href="#calendar">Calendar</a>
            <a className="flex items-center border-b-[3px] border-transparent transition hover:text-stone-950" href="#outlook">Outlook</a>
          </div>
          <button type="button" className="inline-flex items-center gap-2 justify-self-end bg-stone-950 px-4 py-3 text-xs font-bold tracking-[0.08em] text-white uppercase transition hover:bg-blue-600" onClick={goTodayAndScroll}>
            <span>Today</span>
            <ArrowUpRight size={17} />
          </button>
        </nav>

      <header className="relative grid min-h-[35rem] overflow-hidden bg-stone-950 text-white lg:min-h-[30rem] lg:grid-cols-[minmax(0,1.08fr)_minmax(21.25rem,0.92fr)]">
        <div className="relative z-10 px-6 pt-10 pb-36 sm:px-10 lg:p-[clamp(2.375rem,5vw,4.125rem)] lg:pb-30">
          <p className={cn(kickerClass, '!text-lime-300')}><Sparkles size={14} /> Running-first foundation · 8 weeks</p>
          <h1 className={displayHeadingClass}>Build the base.<br /><em className="text-lime-300">Keep it simple.</em></h1>
          <p className="mt-6 max-w-lg text-[clamp(1rem,1.5vw,1.2rem)] leading-relaxed text-stone-400">
            Three distance runs, two foundation strength sessions and zero stacked training days.
          </p>
        </div>
        <div className="relative min-h-52 overflow-hidden bg-blue-600 [clip-path:polygon(0_20%,100%_0,100%_100%,0_100%)] lg:min-h-80 lg:[clip-path:polygon(17%_0,100%_0,100%_100%,0_100%)]" aria-hidden="true">
          <span className="font-display absolute top-1/2 left-[53%] -translate-1/2 text-[clamp(12rem,24vw,25rem)] leading-none font-bold tracking-[-0.09em] text-transparent italic [-webkit-text-stroke:2px_rgba(255,255,255,0.42)]">08</span>
          <div className="absolute top-[-14%] left-[31%] h-[135%] w-14 rotate-24 bg-lime-300" />
          <div className="absolute top-[-4%] left-[62%] h-[135%] w-3 rotate-24 bg-white/80" />
          <div className="absolute right-[11%] bottom-[12%] grid size-20 place-items-center rounded-full bg-lime-300 text-stone-950 ring-16 ring-lime-300/10 sm:size-24"><Footprints size={32} /></div>
        </div>
        <div className="absolute right-0 bottom-0 left-0 z-20 grid grid-cols-4 bg-white text-stone-950 lg:right-auto lg:w-[78%] lg:min-w-[48.75rem]">
          <div className="border-r border-stone-200 px-2 py-3 sm:px-4 sm:py-4 lg:px-7 lg:py-5">
            <span className="mb-1 block text-[0.5rem] font-bold tracking-[0.12em] text-stone-500 uppercase sm:text-[0.625rem]">Current phase</span>
            <strong className="font-display text-xs font-semibold uppercase sm:text-base lg:text-2xl">{phase}</strong>
          </div>
          <div className="border-r border-stone-200 px-2 py-3 sm:px-4 sm:py-4 lg:px-7 lg:py-5">
            <span className="mb-1 block text-[0.5rem] font-bold tracking-[0.12em] text-stone-500 uppercase sm:text-[0.625rem]">Plan position</span>
            <strong className="font-display text-xs font-semibold uppercase sm:text-base lg:text-2xl">{details.outOfRange ? '—' : `${details.week} / 8`}</strong>
          </div>
          <div className="border-r border-stone-200 px-2 py-3 sm:px-4 sm:py-4 lg:px-7 lg:py-5">
            <span className="mb-1 block text-[0.5rem] font-bold tracking-[0.12em] text-stone-500 uppercase sm:text-[0.625rem]">Weekly distance</span>
            <strong className="font-display text-xs font-semibold uppercase sm:text-base lg:text-2xl">{activeWeek?.total ?? '—'}</strong>
          </div>
          <div className="px-2 py-3 sm:px-4 sm:py-4 lg:px-7 lg:py-5">
            <span className="mb-1 block text-[0.5rem] font-bold tracking-[0.12em] text-stone-500 uppercase sm:text-[0.625rem]">Next session</span>
            <strong className="font-display block truncate text-xs font-semibold uppercase sm:text-base lg:text-2xl">{nextSession?.meta.compact ?? '—'}</strong>
            {nextSession && <small className="mt-1 block text-[0.5rem] font-bold tracking-wide text-stone-500 uppercase sm:text-[0.625rem]">{nextSession.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</small>}
          </div>
        </div>
      </header>

      <main id="main-content">
      <section className="py-5 scroll-mt-4" id="calendar" aria-labelledby="calendar-heading">
        <div className={panelClass}>
          <div className="flex min-h-26 flex-col gap-5 border-b border-stone-950 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={cn(kickerClass, 'mb-1')}>Training calendar</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight uppercase sm:text-3xl" id="calendar-heading">{calendarView === 'month'
                ? calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                : `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}</h2>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <CalendarViewSwitcher view={calendarView} onChange={setCalendarView} />
              <div className="flex items-center">
                <button type="button" className={iconButtonClass} aria-label={`Previous ${calendarView}`} onClick={() => shiftCalendar(-1)}><ChevronLeft /></button>
                <button type="button" className="h-10 flex-1 border-y border-stone-300 bg-white px-4 text-[0.625rem] font-bold tracking-[0.08em] uppercase transition hover:bg-stone-100 sm:flex-none" onClick={goToday}>Today</button>
                <button type="button" className={iconButtonClass} aria-label={`Next ${calendarView}`} onClick={() => shiftCalendar(1)}><ChevronRight /></button>
                <details className="group relative ml-2" onToggle={(event) => setSettingsOpen(event.currentTarget.open)}>
                  <summary className={cn(iconButtonClass, 'cursor-pointer list-none group-open:border-stone-950 group-open:bg-stone-950 group-open:text-white [&::-webkit-details-marker]:hidden')} aria-controls="plan-settings-panel" aria-expanded={settingsOpen} aria-label="Plan settings" role="button"><Settings2 aria-hidden="true" size={18} /></summary>
                  <div className="absolute top-[calc(100%+0.5rem)] right-0 z-30 w-68 border border-stone-950 bg-white p-4 text-stone-950 shadow-[8px_8px_0_rgba(17,17,15,0.12)]" id="plan-settings-panel" role="group" aria-labelledby="plan-settings-heading">
                    <p className={cn(kickerClass, '!text-stone-950')} id="plan-settings-heading">Plan settings</p>
                    <label className="flex min-h-10 w-full items-center justify-between gap-2 border border-stone-300 px-3">
                      <span className="text-[0.625rem] font-bold tracking-wide text-stone-500 uppercase">Block starts</span>
                      <input
                        className="min-w-0 bg-transparent text-xs font-semibold outline-none"
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(formatDateInput(mondayOf(parseLocalDate(event.target.value))))}
                      />
                    </label>
                    <small className="mt-2 block text-[0.6875rem] leading-5 text-stone-500">Dates automatically align to Monday.</small>
                  </div>
                </details>
              </div>
            </div>
          </div>

          <div className="grid min-h-[38rem] lg:grid-cols-[minmax(0,1.55fr)_minmax(22.5rem,0.85fr)]">
            <div className="min-w-0 border-b border-stone-950 lg:border-r lg:border-b-0">
              {calendarView === 'month' ? (
                <div role="grid" aria-label={`${calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} training calendar`}>
                  <div className="grid grid-cols-7 border-b border-stone-300 bg-stone-50" role="row">
                    {dayLabels.map((label) => <span className="px-1 py-3 text-center text-[0.5625rem] font-bold tracking-[0.08em] text-stone-600 sm:text-[0.625rem]" key={label} role="columnheader">{label}</span>)}
                  </div>
                  <div className="grid min-h-[34.75rem] grid-cols-7 grid-rows-6 bg-stone-300 gap-px">
                    {Array.from({ length: 6 }, (_, weekIndex) => (
                      <div className="contents" key={formatDateInput(monthDays[weekIndex * 7])} role="row">
                      {monthDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((date) => {
                      const value = formatDateInput(date);
                      const dayDetails = getDetails(date, parseLocalDate(startDate));
                      const meta = getDayMeta(dayDetails);
                      const isToday = value === formatDateInput(initialToday);
                      const isSelected = value === selectedDate;
                      const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
                      const isCompleted = isCompletedSession(date, initialToday, meta);
                      return (
                        <button
                          type="button"
                          key={value}
                          data-calendar-date={value}
                          role="gridcell"
                          className={cn(
                            'relative flex min-h-16 min-w-0 flex-col bg-white p-1.5 text-left transition hover:bg-stone-100 sm:min-h-20 sm:p-2.5',
                            !isCurrentMonth && '!bg-stone-50 !text-stone-600',
                            isCompleted && !isSelected && '!bg-lime-50',
                            isSelected && 'z-10 !bg-stone-950 !text-white ring-2 ring-inset ring-stone-950',
                          )}
                          onClick={() => selectDate(date)}
                          onKeyDown={(event) => handleCalendarKeyDown(event, date)}
                          tabIndex={value === monthGridTabStop ? 0 : -1}
                          aria-current={isToday ? 'date' : undefined}
                          aria-label={`${date.toLocaleDateString()}: ${meta.short || 'outside training plan'}${isCompleted ? ', completed' : ''}${isToday ? ', today' : ''}`}
                          aria-selected={isSelected}
                        >
                          <span className="font-display self-end text-sm font-semibold sm:text-base">{date.getDate()}</span>
                          {isCompleted && <span className="absolute top-2 left-2 grid size-4 place-items-center rounded-full bg-lime-300 text-stone-950 sm:size-5" aria-hidden="true"><Check size={11} /></span>}
                          {meta.short && (
                            <span className="mt-auto flex min-w-0 items-center gap-1 text-[0.5rem] leading-tight font-bold sm:text-[0.625rem]">
                              <i aria-hidden="true" className={cn('size-1.5 shrink-0', isSelected ? 'bg-lime-300' : sessionDotClasses[meta.type])} />
                              <span className="hidden truncate sm:inline">{meta.short}</span>
                              <span className="line-clamp-2 sm:hidden">{meta.compact}</span>
                            </span>
                          )}
                          {isToday && <span aria-hidden="true" className={cn('absolute top-1.5 left-1/2 -translate-x-1/2 text-[0.4375rem] font-bold tracking-wide sm:top-2', isSelected ? 'text-lime-300' : 'text-blue-700')}>TODAY</span>}
                        </button>
                      );
                    })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 sm:p-6">
                  <div className="mb-4 flex min-h-14 flex-col gap-1 bg-blue-600 px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                    <span className="shrink-0 text-[0.625rem] font-bold tracking-[0.12em] text-lime-300 uppercase">Week {details.outOfRange ? '—' : details.week} / 8</span>
                    <p className="m-0 text-[0.6875rem] font-bold tracking-wide text-white uppercase sm:text-right">{activeWeek ? `${activeWeek.phase} · ${activeWeek.total} running` : 'Outside the current training block'}</p>
                  </div>
                  <div className="grid gap-2">
                    {weekDays.map((date, index) => {
                      const value = formatDateInput(date);
                      const meta = getDayMeta(getDetails(date, parseLocalDate(startDate)));
                      const isSelected = value === selectedDate;
                      const isToday = value === formatDateInput(initialToday);
                      const isCompleted = isCompletedSession(date, initialToday, meta);
                      return (
                        <button
                          type="button"
                          key={value}
                          className={cn(
                            'grid min-h-16 grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border border-stone-300 bg-white px-3 py-2 text-left transition hover:border-stone-950 hover:bg-stone-100 sm:grid-cols-[4.875rem_minmax(0,1fr)_auto] sm:gap-4',
                            isCompleted && !isSelected && '!bg-lime-50',
                            isSelected && 'border-stone-950 !bg-stone-950 !text-white hover:!bg-stone-950',
                          )}
                          onClick={() => selectDate(date)}
                          data-calendar-date={value}
                          onKeyDown={(event) => handleCalendarKeyDown(event, date)}
                          tabIndex={isSelected ? 0 : -1}
                          aria-pressed={isSelected}
                          aria-current={isToday ? 'date' : undefined}
                          aria-label={`${date.toLocaleDateString()}: ${meta.short || 'no session'}${isCompleted ? ', completed' : ''}${isToday ? ', today' : ''}`}
                        >
                          <span className="flex items-center gap-3"><small className={cn('hidden w-8 text-[0.5625rem] font-bold tracking-wider uppercase sm:block', isSelected ? 'text-stone-400' : 'text-stone-500')}>{dayLabels[index]}</small><strong className="font-display text-xl font-semibold">{date.getDate()}</strong></span>
                          <span className="grid min-w-0 grid-cols-[0.4375rem_minmax(0,1fr)] items-center gap-x-2" aria-hidden="true">
                            <i className={cn('row-span-2 size-1.5', isSelected ? 'bg-lime-300' : sessionDotClasses[meta.type])} />
                            <strong className="truncate text-xs">{meta.short || 'No session'}</strong>
                            <small className={cn('text-[0.5625rem] font-bold tracking-wider uppercase', isSelected ? 'text-stone-400' : 'text-stone-500')}>{isToday ? 'Today' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</small>
                          </span>
                          {isCompleted
                            ? <span className="grid size-6 place-items-center rounded-full bg-lime-300 text-stone-950" aria-hidden="true"><Check size={13} /></span>
                            : <ArrowUpRight aria-hidden="true" className={isSelected ? 'text-lime-300' : 'text-stone-500'} size={17} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <aside className="min-w-0 bg-white">
              <div className="flex min-h-26 items-center justify-between gap-3 border-b border-stone-950 bg-stone-50 px-3 py-4 sm:px-5">
                <button type="button" className={iconButtonClass} aria-label="Previous day" onClick={() => shiftSelectedDay(-1)}><ChevronLeft /></button>
                <div className="min-w-0 text-center" aria-atomic="true" aria-live="polite">
                  <div className="mb-1 flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
                    <p className={cn(kickerClass, 'm-0 truncate')}>{details.outOfRange ? 'Outside plan' : `Week ${details.week} / 8 · ${selectedMeta.compact}`}</p>
                    {selectedIsCompleted && <span className="inline-flex shrink-0 items-center gap-1 bg-lime-300 px-2 py-1 text-[0.5rem] font-bold tracking-wide text-stone-950 uppercase"><Check size={11} /> Completed</span>}
                  </div>
                  <h2 className="font-display truncate text-lg font-semibold uppercase sm:text-xl">{dateLabel}</h2>
                </div>
                <button type="button" className={iconButtonClass} aria-label="Next day" onClick={() => shiftSelectedDay(1)}><ChevronRight /></button>
              </div>
              {renderWorkout()}
            </aside>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-950 px-4 py-3 text-[0.5625rem] font-bold tracking-wider text-stone-500 uppercase sm:px-6">
            <span className="inline-flex items-center gap-2"><i aria-hidden="true" className="size-1.5 bg-lime-300" /> Strength</span>
            <span className="inline-flex items-center gap-2"><i aria-hidden="true" className="size-1.5 bg-blue-600" /> Run / long run</span>
            <span className="inline-flex items-center gap-2"><i aria-hidden="true" className="size-1.5 bg-orange-500" /> Optional 5K effort</span>
          </div>
        </div>
      </section>

      <section className="grid overflow-hidden bg-blue-600 text-white lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]" id="outlook" aria-labelledby="outlook-heading">
        <div className="p-[clamp(2rem,5vw,4.5rem)]">
          <p className={cn(kickerClass, '!text-white')}>Personal outlook / {outlookStats.phase}</p>
          <h2 className={cn(displayHeadingClass, 'mb-6 text-[clamp(3.2rem,6vw,6rem)]')} id="outlook-heading">Your week,<br /><em className="text-lime-300">at a glance.</em></h2>
          <p className="max-w-md leading-7 text-white">Projected from today, assuming every scheduled run and strength session is completed.</p>
          <div className="mt-8 h-2 overflow-hidden bg-white/20" role="progressbar" aria-label="Scheduled sessions assumed complete" aria-valuemin={0} aria-valuemax={40} aria-valuenow={outlookStats.completedSessions} aria-valuetext={`${outlookStats.completedSessions} of 40 sessions`}>
            <span className="block h-full bg-lime-300 transition-[width] duration-300" style={{ width: `${outlookStats.progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[0.625rem] font-bold tracking-wider text-white uppercase">
            <span>Sessions through today</span>
            <strong className="text-white">{outlookStats.completedSessions} / 40</strong>
          </div>
          <div className="mt-7 border-t border-white/25 pt-4" role="img" aria-label={`Assumed completed running distance by week: ${runningPlan.map((week, index) => `week ${index + 1}, ${outlookStats.completedDistanceByWeek[index]} of ${Number.parseInt(week.total, 10)} kilometres`).join('; ')}`}>
            <div className="flex justify-between text-[0.625rem] font-bold tracking-wider text-white uppercase">
              <span>Distance completed</span>
              <strong>ACTUAL / TARGET</strong>
            </div>
            <div className="mt-3 grid h-26 grid-cols-8 items-end gap-2">
              {runningPlan.map((week, index) => {
                const total = Number.parseInt(week.total, 10);
                const completed = outlookStats.completedDistanceByWeek[index];
                const isCurrent = outlookStats.details.week === index + 1;
                return (
                  <div
                    className="grid h-full grid-rows-[1fr_auto] items-end gap-1"
                    key={`${week.phase}-${index}`}
                  >
                    <div
                      className={cn('relative block min-h-2 w-full overflow-hidden bg-white/25', isCurrent && 'ring-2 ring-white')}
                      style={{ height: `${Math.round((total / 23) * 100)}%` }}
                      title={`Week ${index + 1}: ${completed} of ${total} km assumed complete`}
                    >
                      <span className="absolute inset-x-0 bottom-0 block bg-lime-300 transition-[height] duration-200" style={{ height: `${Math.round((completed / total) * 100)}%` }} />
                    </div>
                    <small className="text-center text-[0.5rem] font-bold text-white">{index + 1}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-white/20 sm:grid-cols-2">
          <article className="relative row-span-2 min-w-0 overflow-hidden bg-white p-[clamp(1.75rem,4vw,3.25rem)] text-stone-950">
            <div className="mb-14 grid size-12 place-items-center bg-lime-300"><Target /></div>
            <p className={kickerClass}>Primary focus</p>
            <h3 className="font-display max-w-md text-[clamp(2.5rem,4vw,4.5rem)] leading-[0.9] font-semibold tracking-tight uppercase italic">{focus}</h3>
            <p className="mt-5 max-w-md leading-7 text-stone-500">{outlookStats.todayOffset < 0
              ? 'Set the first Monday of your block to begin.'
              : outlookStats.todayOffset >= 56
                ? 'The full eight-week schedule is now assumed complete.'
                : `Week ${outlookStats.details.week} totals ${outlookStats.week?.total}: three runs, two separate strength sessions and two complete rest days.`}</p>
            <span className="font-display absolute right-[-2rem] bottom-[-4rem] text-[10rem] leading-none font-bold text-stone-100 italic" aria-hidden="true">08</span>
          </article>
          <article className="flex min-h-64 min-w-0 flex-col bg-white p-[clamp(1.75rem,4vw,3.25rem)] text-stone-950">
            <div className="mb-auto grid size-11 place-items-center bg-blue-600 text-white"><Activity /></div>
            <span className="mb-2 mt-8 block text-[0.625rem] font-bold tracking-[0.12em] text-stone-500 uppercase">Weekly rhythm</span>
            <strong className="font-display text-5xl font-semibold uppercase">3 + 2</strong>
            <small className="mt-1 text-[0.625rem] font-bold tracking-wide text-stone-500 uppercase">Runs + strength sessions</small>
          </article>
          <article className="flex min-h-64 min-w-0 flex-col bg-stone-950 p-[clamp(1.75rem,4vw,3.25rem)] text-white">
            <div className="mb-auto grid size-11 place-items-center bg-lime-300 text-stone-950"><Zap /></div>
            <span className="mb-2 mt-8 block text-[0.625rem] font-bold tracking-[0.12em] text-stone-400 uppercase">Operating rule</span>
            <strong className="font-display text-5xl font-semibold uppercase">1 / DAY</strong>
            <small className="mt-1 text-[0.625rem] font-bold tracking-wide text-stone-400 uppercase">Never stack missed sessions</small>
          </article>
        </div>
      </section>

      <section className="grid gap-10 py-18 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)] lg:gap-20" aria-labelledby="rules-heading">
        <div>
          <p className={kickerClass}>Minimal operating rules</p>
          <h2 className={cn(displayHeadingClass, 'text-[clamp(3rem,5vw,5.5rem)]')} id="rules-heading">Simple work.<br />Repeatable weeks.</h2>
        </div>
        <div className="grid gap-px bg-stone-300 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <Rule number="01" icon={<Gauge />} title="Choose the distance">
            Set the programmed distance on Garmin and settle into your preferred sustainable pace.
          </Rule>
          <Rule number="02" icon={<Dumbbell />} title="Progress gradually">
            Add repetitions before difficulty and keep accessory work away from technical failure.
          </Rule>
          <Rule number="03" icon={<HeartPulse />} title="Protect the rhythm">
            Skip rather than compress. Stop when pain changes movement quality and resume with the next session.
          </Rule>
        </div>
      </section>
      </main>

      <footer className="flex items-center justify-between border-t border-stone-950 py-6 text-[0.6875rem] font-bold tracking-[0.12em] uppercase">
        <span>FORM / BASE</span>
        <p className="m-0 hidden text-stone-600 sm:block">Built for the next session.</p>
        <Footprints size={24} />
      </footer>
      </div>
    </div>
  );
}

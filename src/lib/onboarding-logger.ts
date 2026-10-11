/**
 * Onboarding flow logger.
 * All logs are prefixed with [GG:Onboarding] so they are easy to filter
 * in DevTools. Only active in non-production builds.
 */

const PREFIX = '[GG:Onboarding]';
const COLOR_PAGE = 'color:#22d3ee;font-weight:bold';
const COLOR_STEP = 'color:#a78bfa;font-weight:bold';
const COLOR_LOADING = 'color:#fb923c;font-weight:bold';
const COLOR_EVENT = 'color:#34d399;font-weight:bold';
const COLOR_ERROR = 'color:#f87171;font-weight:bold';
const COLOR_TIMER = 'color:#facc15;font-weight:bold';

const isDev = process.env.NODE_ENV !== 'production';

type LogLevel = 'page' | 'step' | 'loading' | 'event' | 'error' | 'timer';

function getStyle(level: LogLevel): string {
  switch (level) {
    case 'page':    return COLOR_PAGE;
    case 'step':    return COLOR_STEP;
    case 'loading': return COLOR_LOADING;
    case 'event':   return COLOR_EVENT;
    case 'error':   return COLOR_ERROR;
    case 'timer':   return COLOR_TIMER;
    default:        return '';
  }
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  if (!isDev) return;
  const ts = new Date().toISOString().split('T')[1].replace('Z', '');
  if (data) {
    console.log(`%c${PREFIX}[${ts}] ${message}`, getStyle(level), data);
  } else {
    console.log(`%c${PREFIX}[${ts}] ${message}`, getStyle(level));
  }
}

// --- Timers ---

const _timers: Record<string, number> = {};

export function startTimer(key: string) {
  if (!isDev) return;
  _timers[key] = performance.now();
}

export function endTimer(key: string): number {
  if (!isDev) return 0;
  const elapsed = _timers[key] != null ? Math.round(performance.now() - _timers[key]) : -1;
  delete _timers[key];
  log('timer', `timer ${key} took ${elapsed}ms`);
  return elapsed;
}

// --- Page Events ---

export function logPageLoaded(pageName: string, data?: Record<string, unknown>) {
  log('page', `PAGE LOADED: ${pageName}`, data);
}

// --- Onboarding Step Events ---

export const STEP_NAMES: Record<number, string> = {
  1: 'Identity (Name & Gender)',
  2: 'Body Metrics (Age, Height, Weight)',
  3: 'Activity Level',
  4: 'Goal & Pace',
  5: 'Nutrition Plan Review',
};

export function logStepEntered(step: number, direction: 'forward' | 'backward' = 'forward') {
  log('step', `STEP ${step} ENTERED: "${STEP_NAMES[step] ?? `Step ${step}`}" [direction: ${direction}]`);
  startTimer(`step_${step}_duration`);
}

export function logStepLeft(step: number) {
  const elapsed = endTimer(`step_${step}_duration`);
  log('step', `STEP ${step} LEFT: "${STEP_NAMES[step] ?? `Step ${step}`}" after ${elapsed}ms`);
}

// --- Loading Screen Events ---

export function logLoadingStart(screenName: string, data?: Record<string, unknown>) {
  log('loading', `LOADING START: ${screenName}`, data);
  startTimer(`loading_${screenName}`);
}

export function logLoadingEnd(screenName: string) {
  const elapsed = endTimer(`loading_${screenName}`);
  log('loading', `LOADING END: ${screenName} shown for ${elapsed}ms`);
}

// --- Flow Events ---

export function logEvent(eventName: string, data?: Record<string, unknown>) {
  log('event', `EVENT: ${eventName}`, data);
}

export function logError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  log('error', `ERROR in ${context}: ${message}`);
}

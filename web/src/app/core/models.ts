export type SwitchState = '0' | '1' | 'up' | 'down' | 'stop' | 'click' | string;

export type WicketPhase = 'opening' | 'waiting' | 'closing';

export interface TimerScheduled {
  when: string;
  state: SwitchState;
}

export interface WicketScheduled {
  kind: 'wicket';
  phase: WicketPhase;
  ends_at: string;
  open_s: number;
  wait_s: number;
  close_ui_s: number;
}

export type SwitchScheduled = TimerScheduled | WicketScheduled;

export function isWicketScheduled(s: SwitchScheduled | null | undefined): s is WicketScheduled {
  return !!s && (s as WicketScheduled).kind === 'wicket';
}

export interface SwitchItem {
  key: string;
  name: string;
  state: SwitchState | null;
  type: string;
  stateless?: boolean;
  durations?: string[] | false;
  scheduled?: SwitchScheduled | null;
  loading?: boolean;
}

export interface SwitchGroup {
  name: string;
  switches: SwitchItem[];
}

export interface ScheduleItem {
  id: string;
  switch: string;
  name?: string;
  state: SwitchState;
  schedule: string;
  duration?: number;
}

export interface HistoryItem {
  id?: string;
  date: string;
  switch: string;
  name?: string;
  state: SwitchState;
  user_email?: string | null;
  user?: string | null;
}

export interface HalList<T> {
  count: number;
  total: number;
  _embedded: T[] | Record<string, T>;
}

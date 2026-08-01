export type SwitchState = '0' | '1' | 'up' | 'down' | 'stop' | 'click' | string;

export interface SwitchItem {
  key: string;
  name: string;
  state: SwitchState | null;
  type: string;
  stateless?: boolean;
  durations?: string[] | false;
  scheduled?: { when: string; state: SwitchState } | null;
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

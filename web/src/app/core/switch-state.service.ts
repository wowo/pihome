import { Injectable, OnDestroy, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { PiApiService } from './pi-api.service';
import { SupabaseService } from './supabase.service';
import { SwitchItem } from './models';
import { groupSwitches } from './offline';

const POLL_MS = 20_000;
const CACHE_KEY = 'pihome.stateless';

@Injectable({ providedIn: 'root' })
export class SwitchStateService implements OnDestroy {
  readonly groups = signal(groupSwitches([]));
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly mode = signal<'realtime' | 'polling' | 'lan'>('polling');

  private byKey = new Map<string, SwitchItem>();
  private channel: RealtimeChannel | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private started = false;

  constructor(
    private api: PiApiService,
    private supabase: SupabaseService,
  ) {}

  start(): void {
    if (this.started) return;
    this.started = true;
    this.hydrateStatelessCache();
    void this.refreshFromPi();
    if (this.supabase.lanMode || !this.supabase.client) {
      this.mode.set('lan');
      this.startPolling();
      return;
    }
    this.subscribeRealtime();
  }

  ngOnDestroy(): void {
    this.stopPolling();
    void this.channel?.unsubscribe();
  }

  async toggle(item: SwitchItem, state: string, durationMinutes?: number): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.api.patchSwitch(item.key, state, durationMinutes);
      this.mergeOne(updated);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }

  private async refreshFromPi(): Promise<void> {
    this.loading.set(true);
    try {
      const list = await this.api.listSwitches();
      this.replaceAll(list);
      this.error.set(null);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }

  private subscribeRealtime(): void {
    const client = this.supabase.client!;
    this.channel = client
      .channel('switch_state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'switch_state' },
        () => {
          // Realtime mirror may be partial; refresh full list from Pi for parity with durations/types.
          void this.refreshFromPi();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.mode.set('realtime');
          this.stopPolling();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          this.mode.set('polling');
          this.startPolling();
        }
      });
    // Always keep a slow poll as safety net even in realtime (covers missed events).
    this.startPolling(POLL_MS * 3);
  }

  private startPolling(ms = POLL_MS): void {
    this.stopPolling();
    this.pollTimer = setInterval(() => void this.refreshFromPi(), ms);
  }

  private stopPolling(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = null;
  }

  private replaceAll(list: SwitchItem[]): void {
    const next = new Map<string, SwitchItem>();
    for (const item of list) next.set(item.key, item);
    // Keep cached stateless switches if API briefly omits them.
    for (const [key, cached] of this.readStatelessCache()) {
      if (!next.has(key)) next.set(key, cached);
    }
    this.byKey = next;
    this.writeStatelessCache([...next.values()].filter((s) => s.stateless));
    this.groups.set(groupSwitches([...next.values()]));
  }

  private mergeOne(item: SwitchItem): void {
    this.byKey.set(item.key, item);
    this.groups.set(groupSwitches([...this.byKey.values()]));
  }

  private hydrateStatelessCache(): void {
    const cached = this.readStatelessCache();
    if (cached.size) {
      this.byKey = cached;
      this.groups.set(groupSwitches([...cached.values()]));
    }
  }

  private readStatelessCache(): Map<string, SwitchItem> {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return new Map();
      const arr = JSON.parse(raw) as SwitchItem[];
      return new Map(arr.map((s) => [s.key, s]));
    } catch {
      return new Map();
    }
  }

  private writeStatelessCache(items: SwitchItem[]): void {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  }
}

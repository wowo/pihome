import { Injectable, OnDestroy, signal, inject } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { PiApiService } from './pi-api.service';
import { SupabaseService } from './supabase.service';
import { SwitchItem } from './models';
import { groupSwitches } from './offline';

const POLL_MS = 20_000;
const CACHE_KEY = 'pihome.switches';

@Injectable({ providedIn: 'root' })
export class SwitchStateService implements OnDestroy {
  private api = inject(PiApiService);
  private supabase = inject(SupabaseService);

  readonly groups = signal(groupSwitches([]));
  readonly error = signal<string | null>(null);
  /** First fetch only (not background polls). Shown next to PiHome while hydrating. */
  readonly loading = signal(false);
  readonly busyKeys = signal<ReadonlySet<string>>(new Set());
  readonly mode = signal<'realtime' | 'polling' | 'lan'>('polling');

  private byKey = new Map<string, SwitchItem>();
  private channel: RealtimeChannel | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private started = false;
  private initialDone = false;
  private refreshInFlight: Promise<void> | null = null;
  private fingerprint = '';

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.hydrateCache();
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

  isBusy(key: string): boolean {
    return this.busyKeys().has(key);
  }

  async toggle(item: SwitchItem, state: string, durationMinutes?: number): Promise<void> {
    this.error.set(null);
    this.busyKeys.update((s) => new Set(s).add(item.key));
    try {
      const updated = await this.api.patchSwitch(item.key, state, durationMinutes);
      this.mergeOne(updated);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      this.busyKeys.update((s) => {
        const next = new Set(s);
        next.delete(item.key);
        return next;
      });
    }
  }

  private async refreshFromPi(): Promise<void> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }
    // Header spinner on first load even when cache already paints the grid.
    if (!this.initialDone) {
      this.loading.set(true);
    }
    this.refreshInFlight = (async () => {
      try {
        const list = await this.api.listSwitches();
        this.replaceAll(list);
        this.error.set(null);
      } catch (e) {
        this.error.set(e instanceof Error ? e.message : String(e));
      } finally {
        this.initialDone = true;
        this.loading.set(false);
        this.refreshInFlight = null;
      }
    })();
    return this.refreshInFlight;
  }

  private subscribeRealtime(): void {
    const client = this.supabase.client!;
    this.channel = client
      .channel('switch_state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'switch_state' },
        (payload) => {
          const row = (payload.new || payload.old) as Record<string, unknown> | undefined;
          if (row && typeof row['key'] === 'string') {
            this.mergeRealtimeRow(row);
            return;
          }
          void this.refreshFromPi();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.mode.set('realtime');
          // Keep a slow safety poll; stop the eager one started below once subscribed.
          this.startPolling(POLL_MS * 3);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          this.mode.set('polling');
          this.startPolling();
        }
      });
    this.startPolling(POLL_MS);
  }

  private startPolling(ms = POLL_MS): void {
    this.stopPolling();
    this.pollTimer = setInterval(() => void this.refreshFromPi(), ms);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    this.pollTimer = null;
  }

  private mergeRealtimeRow(row: Record<string, unknown>): void {
    const key = String(row['key']);
    const prev = this.byKey.get(key);
    if (!prev) {
      void this.refreshFromPi();
      return;
    }
    const next: SwitchItem = {
      ...prev,
      state: row['state'] == null ? prev.state : String(row['state']),
      scheduled: (row['scheduled'] as SwitchItem['scheduled']) ?? prev.scheduled,
      name: typeof row['name'] === 'string' ? row['name'] : prev.name,
      type: typeof row['type'] === 'string' ? row['type'] : prev.type,
      stateless: typeof row['stateless'] === 'boolean' ? row['stateless'] : prev.stateless,
      durations: (row['durations'] as SwitchItem['durations']) ?? prev.durations,
    };
    this.mergeOne(next);
  }

  private replaceAll(list: SwitchItem[]): void {
    const next = new Map<string, SwitchItem>();
    for (const item of list) {
      next.set(item.key, item);
    }
    const fp = this.fingerprintOf(next);
    if (fp === this.fingerprint && this.byKey.size) {
      this.writeCache([...next.values()]);
      return; // nothing visible changed — skip blink
    }
    this.fingerprint = fp;
    this.byKey = next;
    this.writeCache([...next.values()]);
    this.groups.set(groupSwitches([...next.values()]));
  }

  private mergeOne(item: SwitchItem): void {
    this.byKey.set(item.key, item);
    this.fingerprint = this.fingerprintOf(this.byKey);
    this.groups.set(groupSwitches([...this.byKey.values()]));
    this.writeCache([...this.byKey.values()]);
  }

  private fingerprintOf(map: Map<string, SwitchItem>): string {
    return [...map.values()]
      .map((s) => `${s.key}:${s.state}:${JSON.stringify(s.scheduled ?? null)}`)
      .sort()
      .join('|');
  }

  private hydrateCache(): void {
    const cached = this.readCache();
    if (cached.size) {
      this.byKey = cached;
      this.fingerprint = this.fingerprintOf(cached);
      this.groups.set(groupSwitches([...cached.values()]));
    }
  }

  private readCache(): Map<string, SwitchItem> {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) {
        return new Map();
      }
      const arr = JSON.parse(raw) as SwitchItem[];
      return new Map(arr.map((s) => [s.key, s]));
    } catch {
      return new Map();
    }
  }

  private writeCache(items: SwitchItem[]): void {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  }
}

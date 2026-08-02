import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { PiApiService } from './pi-api.service';
import { SupabaseService } from './supabase.service';
import { HistoryItem } from './models';

const CACHE_KEY = 'pihome.history.cache';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);
  private api = inject(PiApiService);

  readonly items = signal<HistoryItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly fromCache = signal(false);
  private page = 0;

  async reset(): Promise<void> {
    this.page = 0;
    this.items.set([]);
    await this.loadMore();
  }

  async loadMore(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const nextPage = this.page + 1;
    try {
      let batch: HistoryItem[] = [];
      if (this.supabase.client && this.auth.session()) {
        const { data, error } = await this.supabase.client
          .from('switch_events')
          .select('id,date,switch,state,user_email')
          .order('date', { ascending: false })
          .range((nextPage - 1) * 25, nextPage * 25 - 1);
        if (error) {
          throw error;
        }
        batch = (data || []).map((row) => ({
          ...row,
          state: String(row.state),
          user: row.user_email,
        }));
        this.fromCache.set(false);
      } else {
        batch = await this.api.listHistory(nextPage);
        this.fromCache.set(this.supabase.lanMode);
      }
      this.page = nextPage;
      const merged = nextPage === 1 ? batch : [...this.items(), ...batch];
      this.items.set(merged);
      localStorage.setItem(CACHE_KEY, JSON.stringify(merged.slice(0, 50)));
    } catch (e) {
      const cached = this.readCache();
      if (cached.length) {
        this.items.set(cached);
        this.fromCache.set(true);
      }
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }

  private readCache(): HistoryItem[] {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    } catch {
      return [];
    }
  }
}

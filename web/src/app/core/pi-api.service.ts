import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { HalList, HistoryItem, ScheduleItem, SwitchItem } from './models';
import { isLanOrigin } from './offline';

/** Pi returns state as a number for GPIO switches and a string for ethernet ones. */
function withStringState<T extends { state: SwitchItem['state'] }>(item: T): T {
  return { ...item, state: item.state == null ? null : String(item.state) };
}

@Injectable({ providedIn: 'root' })
export class PiApiService {
  private auth = inject(AuthService);

  private headers(json = false): HeadersInit {
    const h: Record<string, string> = {};
    if (json) {
      h['Content-Type'] = 'application/json';
    }
    const token = this.auth.accessToken;
    if (token && !isLanOrigin()) {
      h['Authorization'] = `Bearer ${token}`;
    }
    if (isLanOrigin() && this.auth.email) {
      h['X-PiHome-User'] = this.auth.email;
    }
    return h;
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(environment.apiBase + path, { headers: this.headers() });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText || 'API error'}`);
    }
    return res.json();
  }

  async listSwitches(): Promise<SwitchItem[]> {
    const data = await this.get<HalList<SwitchItem>>('/switch');
    const embedded = data._embedded;
    const items = Array.isArray(embedded) ? embedded : Object.values(embedded || {});
    return items.map(withStringState);
  }

  async patchSwitch(key: string, state: string, duration?: number): Promise<SwitchItem> {
    const body: Record<string, unknown> = { state };
    if (duration != null && duration > 0) {
      body['duration'] = duration;
    }
    const res = await fetch(`${environment.apiBase}/switch/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      headers: this.headers(true),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText || 'API error'}`);
    }
    return withStringState(await res.json());
  }

  async listSchedules(): Promise<ScheduleItem[]> {
    const data = await this.get<HalList<ScheduleItem>>('/cron');
    const embedded = data._embedded;
    const items = Array.isArray(embedded) ? embedded : Object.values(embedded || {});
    return items.map(withStringState);
  }

  async createSchedule(payload: Omit<ScheduleItem, 'id' | 'name'>): Promise<ScheduleItem> {
    const res = await fetch(environment.apiBase + '/cron', {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText || 'API error'}`);
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { ...payload, id: 'new' };
    }
  }

  async updateSchedule(id: string, payload: Omit<ScheduleItem, 'id' | 'name'>): Promise<void> {
    const res = await fetch(`${environment.apiBase}/cron/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: this.headers(true),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText || 'API error'}`);
    }
  }

  async deleteSchedule(id: string): Promise<void> {
    const res = await fetch(`${environment.apiBase}/cron/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText || 'API error'}`);
    }
  }

  /** Legacy Pi history endpoint kept as last-resort fallback. */
  async listHistory(page: number, count = 25): Promise<HistoryItem[]> {
    const data = await this.get<HalList<HistoryItem>>(`/history?page=${page}&count=${count}`);
    const embedded = data._embedded;
    const items = Array.isArray(embedded) ? embedded : Object.values(embedded || {});
    return items.map(withStringState);
  }
}

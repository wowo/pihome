import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PiApiService } from '../../core/pi-api.service';
import { ScheduleItem, SwitchItem } from '../../core/models';

@Component({
  selector: 'app-schedule',
  imports: [TranslatePipe, FormsModule],
  template: `
    <div class="px-3 pb-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-bold">{{ 'schedule.title' | translate }}</h2>
        <button type="button" class="btn-green btn-emboss rounded-xl px-3 py-2 text-sm font-semibold" (click)="openCreate()">
          {{ 'schedule.create' | translate }}
        </button>
      </div>

      @if (error()) {
        <div class="mb-3 rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2">{{ error() }}</div>
      }

      @if (!items().length && !loading()) {
        <p class="text-muted text-sm">{{ 'schedule.empty' | translate }}</p>
      }

      <div class="space-y-2">
        @for (item of items(); track item.id) {
          <div class="bg-card border border-border rounded-xl px-3 py-2.5 shadow-sm">
            <div class="flex justify-between gap-2">
              <div>
                <div class="font-semibold text-sm">{{ item.name || item.switch }}</div>
                <div class="text-xs text-muted font-mono mt-0.5">{{ item.schedule }}</div>
                <div class="text-xs mt-1">
                  {{ ('states.' + item.state) | translate }}
                  @if (item.duration) {
                    · {{ item.duration }} {{ 'schedule.minutes' | translate }}
                  }
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <button type="button" class="text-xs text-sage font-semibold" (click)="openEdit(item)">Edit</button>
                <button type="button" class="text-xs text-red-600 font-semibold" (click)="remove(item)">✕</button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    @if (form()) {
      <div class="fixed inset-0 z-40 bg-black/30" (click)="closeForm()"></div>
      <div class="fixed inset-x-0 bottom-0 z-50 bg-[#fffdfa] rounded-t-[20px] px-4 pt-3 pb-6 max-h-[85dvh] overflow-auto">
        <div class="w-9 h-1 rounded-full bg-[#d8d2c8] mx-auto mb-3"></div>
        <div class="space-y-3 text-sm">
          <label class="block">
            <span class="text-muted text-xs">{{ 'schedule.switch' | translate }}</span>
            <select class="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-white" [(ngModel)]="draft.switch" [disabled]="!!draft.id">
              @for (sw of switchOptions(); track sw.key) {
                <option [value]="sw.key">{{ sw.name }}</option>
              }
            </select>
          </label>
          <label class="block">
            <span class="text-muted text-xs">{{ 'schedule.state' | translate }}</span>
            <select class="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-white" [(ngModel)]="draft.state" [disabled]="!!draft.id">
              <option value="0">{{ 'states.0' | translate }}</option>
              <option value="1">{{ 'states.1' | translate }}</option>
              <option value="click">{{ 'states.click' | translate }}</option>
              <option value="up">{{ 'states.up' | translate }}</option>
              <option value="down">{{ 'states.down' | translate }}</option>
            </select>
          </label>
          <label class="block">
            <span class="text-muted text-xs">{{ 'schedule.cron' | translate }}</span>
            <select class="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-white" [(ngModel)]="preset" (ngModelChange)="applyPreset($event)">
              <option value="hourly">{{ 'schedule.hourly' | translate }}</option>
              <option value="daily">{{ 'schedule.daily' | translate }}</option>
              <option value="weekly">{{ 'schedule.weekly' | translate }}</option>
              <option value="raw">{{ 'schedule.raw' | translate }}</option>
            </select>
          </label>
          @if (preset === 'daily' || preset === 'weekly') {
            <label class="block">
              <span class="text-muted text-xs">HH:MM</span>
              <input type="time" class="mt-1 w-full rounded-xl border border-border px-3 py-2" [(ngModel)]="timeOfDay" (ngModelChange)="applyPreset(preset)" />
            </label>
          }
          @if (preset === 'weekly') {
            <label class="block">
              <span class="text-muted text-xs">Dow (0=Sun)</span>
              <input type="number" min="0" max="6" class="mt-1 w-full rounded-xl border border-border px-3 py-2" [(ngModel)]="weekday" (ngModelChange)="applyPreset(preset)" />
            </label>
          }
          @if (preset === 'raw') {
            <label class="block">
              <span class="text-muted text-xs">cron</span>
              <input class="mt-1 w-full rounded-xl border border-border px-3 py-2 font-mono" [(ngModel)]="draft.schedule" />
            </label>
          }
          <div class="flex gap-2">
            <input type="number" min="0" class="w-24 rounded-xl border border-border px-3 py-2" [(ngModel)]="durationValue" />
            <select class="rounded-xl border border-border px-3 py-2" [(ngModel)]="durationUnit">
              <option value="1">{{ 'schedule.minutes' | translate }}</option>
              <option value="60">{{ 'schedule.hours' | translate }}</option>
            </select>
          </div>
          <div class="flex gap-2 pt-1">
            <button type="button" class="flex-1 rounded-xl py-3 bg-chip text-ink font-semibold" (click)="closeForm()">
              {{ 'schedule.cancel' | translate }}
            </button>
            <button type="button" class="flex-1 btn-green btn-emboss rounded-xl py-3 font-bold" (click)="save()">
              {{ 'schedule.save' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SchedulePage implements OnInit {
  private api = inject(PiApiService);
  private translate = inject(TranslateService);

  items = signal<ScheduleItem[]>([]);
  switchOptions = signal<SwitchItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  form = signal(false);
  preset = 'daily';
  timeOfDay = '07:00';
  weekday = 1;
  durationValue = 0;
  durationUnit: '1' | '60' = '1';
  draft: ScheduleItem = { id: '', switch: '', state: '1', schedule: '0 7 * * *' };

  closeForm(): void {
    this.form.set(false);
  }

  ngOnInit(): void {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      const [schedules, switches] = await Promise.all([this.api.listSchedules(), this.api.listSwitches()]);
      this.items.set(schedules);
      this.switchOptions.set(switches);
      this.error.set(null);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    const first = this.switchOptions()[0]?.key || '';
    this.draft = { id: '', switch: first, state: '1', schedule: '0 7 * * *' };
    this.preset = 'daily';
    this.timeOfDay = '07:00';
    this.durationValue = 0;
    this.applyPreset('daily');
    this.form.set(true);
  }

  openEdit(item: ScheduleItem): void {
    this.draft = { ...item };
    this.preset = 'raw';
    this.durationValue = item.duration || 0;
    this.durationUnit = '1';
    this.form.set(true);
  }

  applyPreset(preset: string): void {
    const [hh, mm] = (this.timeOfDay || '07:00').split(':');
    if (preset === 'hourly') this.draft.schedule = '0 * * * *';
    else if (preset === 'daily') this.draft.schedule = `${Number(mm) || 0} ${Number(hh) || 7} * * *`;
    else if (preset === 'weekly') this.draft.schedule = `${Number(mm) || 0} ${Number(hh) || 7} * * ${this.weekday}`;
  }

  async save(): Promise<void> {
    const duration = Number(this.durationValue) * Number(this.durationUnit);
    const payload = {
      switch: this.draft.switch,
      state: this.draft.state,
      schedule: this.draft.schedule,
      ...(duration > 0 ? { duration } : {}),
    };
    try {
      if (this.draft.id) await this.api.updateSchedule(this.draft.id, payload);
      else await this.api.createSchedule(payload);
      this.closeForm();
      await this.reload();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    }
  }

  async remove(item: ScheduleItem): Promise<void> {
    if (!confirm(this.translate.instant('schedule.deleteConfirm'))) return;
    try {
      await this.api.deleteSchedule(item.id);
      await this.reload();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    }
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SwitchItem } from '../../core/models';
import { durationToMinutes } from '../../core/offline';
import { SwitchStateService } from '../../core/switch-state.service';

@Component({
  selector: 'app-main',
  imports: [TranslatePipe],
  template: `
    @if (switches.error(); as err) {
      <div class="mx-3 mb-3 rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2">
        {{ 'main.error' | translate: { message: err } }}
      </div>
    }
    @if (switches.mode() !== 'realtime') {
      <div class="mx-3 mb-3 rounded-xl bg-chip text-muted text-xs px-3 py-2">
        {{ (switches.mode() === 'lan' ? 'main.offline' : 'main.polling') | translate }}
      </div>
    }

    @if (switches.loading() && !switches.groups().length) {
      <div class="px-3 py-10 text-center text-muted text-sm">
        <span class="spinner"></span>
        <span class="ml-2">{{ 'common.loading' | translate }}</span>
      </div>
    }

    <div class="px-3 pb-4 select-none">
      @for (group of switches.groups(); track group.name) {
        <div class="mb-4">
          <div class="grid grid-cols-3 gap-x-2.5 gap-y-3.5">
            @for (sw of group.switches; track sw.key) {
              <div>
                <div class="min-h-[1.25rem] mb-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0 leading-tight">
                  <span class="text-[13px] font-bold">{{ sw.name }}</span>
                  @if (sw.scheduled && !sw.stateless) {
                    <span class="text-[11px] font-semibold text-red-600">
                      {{ ('states.' + sw.scheduled.state) | translate }}
                      @if (formatWhen(sw.scheduled.when); as when) {
                        {{ when }}
                      }
                    </span>
                  }
                </div>
                @if (sw.type === 'two_way') {
                  <div class="flex gap-0.5" [class.btn-busy]="switches.isBusy(sw.key)">
                    <button type="button" class="btn-blue btn-emboss w-9 h-10 rounded-l-xl rounded-r-sm text-base" [disabled]="switches.isBusy(sw.key)" (click)="tap(sw, 'up')">↑</button>
                    <button type="button" class="btn-blue btn-emboss w-9 h-10 rounded-r-xl rounded-l-sm text-base" [disabled]="switches.isBusy(sw.key)" (click)="tap(sw, 'down')">↓</button>
                  </div>
                } @else if (sw.type === 'click') {
                  <button type="button" class="btn-blue btn-emboss w-12 h-10 rounded-xl text-base" [class.btn-busy]="switches.isBusy(sw.key)" [disabled]="switches.isBusy(sw.key)" (click)="tap(sw, 'click')">
                    @if (switches.isBusy(sw.key)) {
                      <span class="spinner spinner-sm spinner-on-dark"></span>
                    } @else {
                      ⇅
                    }
                  </button>
                } @else if (sw.type === 'click_sequence') {
                  <button type="button" class="btn-blue-alt btn-emboss w-12 h-10 rounded-xl text-base" [class.btn-busy]="switches.isBusy(sw.key)" [disabled]="switches.isBusy(sw.key)" (click)="tap(sw, 'click')" title="Furtka">
                    @if (switches.isBusy(sw.key)) {
                      <span class="spinner spinner-sm spinner-on-dark"></span>
                    } @else {
                      ▥
                    }
                  </button>
                } @else {
                  <button
                    type="button"
                    class="relative overflow-hidden btn-emboss w-12 h-10 rounded-xl text-base touch-manipulation select-none"
                    [class.btn-red]="sw.state === '0'"
                    [class.btn-green]="sw.state === '1'"
                    [class.btn-blue]="sw.state !== '0' && sw.state !== '1'"
                    [class.btn-busy]="switches.isBusy(sw.key)"
                    [disabled]="switches.isBusy(sw.key)"
                    (click)="onPowerClick($event, sw)"
                    (contextmenu)="$event.preventDefault()"
                    (pointerdown)="onPowerDown($event, sw)"
                    (pointerup)="onPowerCancel()"
                    (pointerleave)="onPowerCancel()"
                    (pointercancel)="onPowerCancel()"
                  >
                    @if (switches.isBusy(sw.key)) {
                      <span class="spinner spinner-sm spinner-on-dark"></span>
                    } @else {
                      ⏻
                      @if (hasDurationChoices(sw)) {
                        <span
                          data-duration-badge
                          role="button"
                          tabindex="0"
                          class="absolute right-0 bottom-0 z-10 flex h-6 w-6 items-center justify-center text-[14px] leading-none text-white/90 cursor-pointer"
                          (click)="openSheetFromBadge($event, sw)"
                          (keyup.enter)="openSheetFromBadge($event, sw)"
                          (pointerdown)="$event.stopPropagation()"
                        >▾</span>
                      }
                    }
                  </button>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    @if (sheet(); as s) {
      <button type="button" class="fixed inset-0 z-40 bg-black/30" aria-label="Close" (click)="sheet.set(null)"></button>
      <div class="fixed inset-x-0 bottom-0 z-50 bg-[#fffdfa] rounded-t-[20px] shadow-[0_-8px_30px_rgba(42,38,34,.25)] px-4 pt-2.5 pb-6 select-none">
        <div class="w-9 h-1 rounded-full bg-[#d8d2c8] mx-auto mb-3"></div>
        <div class="flex items-center justify-between mb-3 gap-2">
          <strong class="text-[15px]">
            {{ (s.mode === 'off' ? 'main.activeTitle' : 'main.durationTitle') | translate: { name: s.name } }}
          </strong>
          <button
            type="button"
            class="shrink-0 min-h-11 min-w-11 rounded-xl text-muted text-xl leading-none"
            (click)="sheet.set(null)"
            aria-label="Close"
          >✕</button>
        </div>
        @if (s.until) {
          <div class="mb-3 text-xs text-muted">
            {{ 'main.until' | translate: { time: s.until } }}
          </div>
        }
        @if (s.mode === 'off') {
          <button
            type="button"
            class="w-full btn-red btn-emboss rounded-xl py-3 text-sm font-bold"
            (click)="turnOff(s)"
          >
            {{ 'main.turnOff' | translate }}
          </button>
        } @else {
          <div class="grid grid-cols-2 gap-2">
            @for (d of s.durations; track d) {
              <button
                type="button"
                class="rounded-xl py-3 text-sm font-semibold bg-gradient-to-b from-[#f4f0e9] to-[#ece7de] shadow-sm"
                (click)="pickDuration(s, d)"
              >
                {{ labelDuration(d) }}
              </button>
            }
          </div>
          <button
            type="button"
            class="w-full mt-2.5 btn-green btn-emboss rounded-xl py-3 text-sm font-bold"
            (click)="pickDuration(s, null)"
          >
            {{ 'main.noLimit' | translate }}
          </button>
        }
      </div>
    }
  `,
})
export class MainPage implements OnInit {
  switches = inject(SwitchStateService);
  private translate = inject(TranslateService);
  sheet = signal<{
    key: string;
    name: string;
    durations: string[];
    mode: 'on' | 'off';
    until: string | null;
  } | null>(null);

  private longTimer: ReturnType<typeof setTimeout> | null = null;
  private longFired = false;

  ngOnInit(): void {
    // Shell already starts SwitchStateService; keep idempotent start for deep links.
    this.switches.start();
  }

  /** Multiple presets → chevron / long-press sheet (Led tył). */
  hasDurationChoices(sw: SwitchItem): boolean {
    return Array.isArray(sw.durations) && sw.durations.length > 1;
  }

  isOn(sw: SwitchItem): boolean {
    return sw.state === '1';
  }

  /** Next change time; include day if not today. */
  formatWhen(when: string | undefined | null): string | null {
    if (!when) {
      return null;
    }
    const end = new Date(when);
    if (Number.isNaN(end.getTime())) {
      return null;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const time = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
    const now = new Date();
    const sameDay =
      end.getFullYear() === now.getFullYear() &&
      end.getMonth() === now.getMonth() &&
      end.getDate() === now.getDate();
    return sameDay ? time : `${pad(end.getDate())}.${pad(end.getMonth() + 1)} ${time}`;
  }

  async tap(sw: SwitchItem, state: string, duration?: number): Promise<void> {
    if (this.switches.isBusy(sw.key)) {
      return;
    }
    await this.switches.toggle(sw, state, duration);
  }

  onPowerClick(ev: MouseEvent, sw: SwitchItem): void {
    if ((ev.target as HTMLElement).closest('[data-duration-badge]')) {
      return;
    }
    if (this.longFired) {
      this.longFired = false;
      return;
    }
    if (this.switches.isBusy(sw.key)) {
      return;
    }
    // Already on → just turn off (no "turn on again" duration sheet).
    if (this.isOn(sw)) {
      void this.tap(sw, '0');
      return;
    }
    const durations = Array.isArray(sw.durations) ? sw.durations : [];
    // Old app: a single preset (CWU = 15m) is applied on tap when turning on.
    let minutes: number | undefined;
    if (durations.length === 1 && durations[0] !== 'X') {
      minutes = durationToMinutes(durations[0]);
    }
    void this.tap(sw, '1', minutes);
  }

  onPowerDown(ev: PointerEvent, sw: SwitchItem): void {
    if ((ev.target as HTMLElement).closest('[data-duration-badge]')) {
      return;
    }
    this.longFired = false;
    if (!this.hasDurationChoices(sw)) {
      return;
    }
    this.longTimer = setTimeout(() => {
      this.longFired = true;
      this.openSheet(sw);
    }, 480);
  }

  onPowerCancel(): void {
    if (this.longTimer) {
      clearTimeout(this.longTimer);
    }
    this.longTimer = null;
  }

  openSheetFromBadge(ev: Event, sw: SwitchItem): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.onPowerCancel();
    this.longFired = false;
    this.openSheet(sw);
  }

  openSheet(sw: SwitchItem): void {
    const durations = Array.isArray(sw.durations) ? sw.durations : [];
    this.sheet.set({
      key: sw.key,
      name: sw.name,
      durations,
      mode: this.isOn(sw) ? 'off' : 'on',
      until: this.formatWhen(sw.scheduled?.when),
    });
  }

  async turnOff(s: { key: string; name: string }): Promise<void> {
    this.sheet.set(null);
    const item = { key: s.key, name: s.name } as SwitchItem;
    try {
      await this.switches.toggle(item, '0');
    } catch {
      /* error banner via service */
    }
  }

  async pickDuration(s: { key: string; name: string; durations: string[] }, d: string | null): Promise<void> {
    let minutes: number | undefined;
    if (d === 'X') {
      const hours = Number(window.prompt(this.translate.instant('main.customPrompt'), '9'));
      if (!hours) {
        this.sheet.set(null);
        return;
      }
      minutes = hours * 60;
    } else if (d) {
      minutes = durationToMinutes(d);
    }
    this.sheet.set(null);
    const item = { key: s.key, name: s.name } as SwitchItem;
    try {
      await this.switches.toggle(item, '1', minutes);
    } catch {
      /* error banner via service */
    }
  }

  labelDuration(d: string): string {
    if (d === 'X') {
      return this.translate.instant('main.custom');
    }
    return d.replace('h', ' h').replace('m', ' min');
  }
}

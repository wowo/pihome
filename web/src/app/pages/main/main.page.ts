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

    <div class="px-3 pb-4" [class.opacity-50]="switches.loading()">
      @for (group of switches.groups(); track group.name) {
        <div class="mb-4">
          <div class="text-[10px] uppercase tracking-wider text-muted font-semibold mb-2 px-1 hidden sm:block">
            {{ group.name }}
          </div>
          <div class="grid grid-cols-3 gap-x-2.5 gap-y-3.5">
            @for (sw of group.switches; track sw.key) {
              <div>
                <div class="text-[13px] font-bold mb-1.5 leading-tight">{{ sw.name }}</div>
                @if (sw.scheduled && !sw.stateless) {
                  <div class="text-[10px] mb-1">
                    <span
                      class="inline-block rounded px-1.5 py-0.5 text-white"
                      [class.bg-red-500]="sw.scheduled.state == '0'"
                      [class.bg-green-600]="sw.scheduled.state == '1'"
                    >
                      {{ sw.scheduled.state == '1' ? ('main.on' | translate) : ('main.off' | translate) }}
                    </span>
                  </div>
                }
                @if (sw.type === 'two_way') {
                  <div class="flex gap-0.5">
                    <button type="button" class="btn-blue btn-emboss w-9 h-10 rounded-l-xl rounded-r-sm text-base" (click)="tap(sw, 'up')">↑</button>
                    <button type="button" class="btn-blue btn-emboss w-9 h-10 rounded-r-xl rounded-l-sm text-base" (click)="tap(sw, 'down')">↓</button>
                  </div>
                } @else if (sw.type === 'click' || sw.type === 'click_sequence') {
                  <button type="button" class="btn-blue btn-emboss w-12 h-10 rounded-xl text-base" (click)="tap(sw, 'click')">⇅</button>
                } @else {
                  <button
                    type="button"
                    class="relative btn-emboss w-12 h-10 rounded-xl text-base"
                    [class.btn-red]="sw.state == '0'"
                    [class.btn-green]="sw.state == '1'"
                    [class.btn-blue]="sw.state !== '0' && sw.state !== '1'"
                    (click)="onPowerClick($event, sw)"
                    (contextmenu)="onPowerLong($event, sw)"
                    (touchstart)="onTouchStart($event, sw)"
                    (touchend)="onTouchEnd()"
                    (touchcancel)="onTouchEnd()"
                  >
                    ⏻
                    @if (hasDurations(sw)) {
                      <span class="absolute right-1 bottom-0.5 text-[8px] opacity-85">▾</span>
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
      <div class="fixed inset-0 z-40 bg-black/30" (click)="sheet.set(null)"></div>
      <div class="fixed inset-x-0 bottom-0 z-50 bg-[#fffdfa] rounded-t-[20px] shadow-[0_-8px_30px_rgba(42,38,34,.25)] px-4 pt-2.5 pb-6">
        <div class="w-9 h-1 rounded-full bg-[#d8d2c8] mx-auto mb-3"></div>
        <div class="flex items-center justify-between mb-3">
          <strong class="text-[15px]">{{ 'main.durationTitle' | translate: { name: s.name } }}</strong>
          <button type="button" class="text-muted text-sm" (click)="sheet.set(null)">✕</button>
        </div>
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
      </div>
    }
  `,
})
export class MainPage implements OnInit {
  switches = inject(SwitchStateService);
  private translate = inject(TranslateService);
  sheet = signal<{ key: string; name: string; durations: string[]; nextState: string } | null>(null);

  private longTimer: ReturnType<typeof setTimeout> | null = null;
  private longFired = false;

  ngOnInit(): void {
    this.switches.start();
  }

  hasDurations(sw: SwitchItem): boolean {
    return Array.isArray(sw.durations) && sw.durations.length > 0;
  }

  async tap(sw: SwitchItem, state: string, duration?: number): Promise<void> {
    await this.switches.toggle(sw, state, duration);
  }

  onPowerClick(ev: MouseEvent, sw: SwitchItem): void {
    if (this.longFired) {
      this.longFired = false;
      return;
    }
    const target = ev.target as HTMLElement;
    if (target.textContent?.includes('▾') && this.hasDurations(sw) && ev.offsetX > 28) {
      this.openSheet(sw);
      return;
    }
    const next = sw.state === '1' ? '0' : '1';
    void this.tap(sw, next);
  }

  onPowerLong(ev: Event, sw: SwitchItem): void {
    ev.preventDefault();
    if (this.hasDurations(sw)) this.openSheet(sw);
  }

  onTouchStart(_ev: TouchEvent, sw: SwitchItem): void {
    this.longFired = false;
    this.longTimer = setTimeout(() => {
      this.longFired = true;
      if (this.hasDurations(sw)) this.openSheet(sw);
    }, 450);
  }

  onTouchEnd(): void {
    if (this.longTimer) clearTimeout(this.longTimer);
    this.longTimer = null;
  }

  openSheet(sw: SwitchItem): void {
    const durations = Array.isArray(sw.durations) ? sw.durations : [];
    this.sheet.set({
      key: sw.key,
      name: sw.name,
      durations,
      nextState: sw.state === '1' ? '0' : '1',
    });
  }

  async pickDuration(s: { key: string; name: string; durations: string[]; nextState: string }, d: string | null): Promise<void> {
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
    const item = { key: s.key, name: s.name } as SwitchItem;
    await this.switches.toggle(item, s.nextState, minutes);
    this.sheet.set(null);
  }

  labelDuration(d: string): string {
    if (d === 'X') return this.translate.instant('main.custom');
    return d.replace('h', ' h').replace('m', ' min');
  }
}

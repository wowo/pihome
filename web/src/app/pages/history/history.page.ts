import { Component, OnInit, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HistoryService } from '../../core/history.service';

@Component({
  selector: 'app-history',
  imports: [TranslatePipe],
  template: `
    <div class="px-3 pb-4">
      <h2 class="text-lg font-bold mb-3">{{ 'history.title' | translate }}</h2>
      @if (history.fromCache()) {
        <div class="mb-3 rounded-xl bg-chip text-muted text-xs px-3 py-2">{{ 'history.offlineCached' | translate }}</div>
      }
      @if (history.error()) {
        <div class="mb-3 rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2">{{ history.error() }}</div>
      }

      @if (history.loading() && !history.items().length) {
        <div class="py-10 text-center text-muted text-sm">
          <span class="spinner"></span>
          <span class="ml-2">{{ 'common.loading' | translate }}</span>
        </div>
      } @else if (!history.items().length) {
        <p class="text-muted text-sm">{{ 'history.empty' | translate }}</p>
      }

      <div class="space-y-2">
        @for (item of history.items(); track item.id || (item.date + item.switch + item.state)) {
          <div class="bg-card border border-border rounded-xl px-3 py-2.5 shadow-sm">
            <div class="flex justify-between gap-2 items-start">
              <div>
                <div class="font-semibold text-sm">{{ item.name || item.switch }}</div>
                <div class="text-xs text-muted mt-0.5">{{ formatDate(item.date) }}</div>
                @if (item.user || item.user_email) {
                  <div class="text-[11px] text-muted mt-0.5">{{ item.user || item.user_email }}</div>
                }
              </div>
              <span
                class="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                [class.bg-red-500]="item.state === '0'"
                [class.bg-green-600]="item.state === '1'"
                [class.bg-sky-500]="item.state !== '0' && item.state !== '1'"
              >
                {{ ('states.' + item.state) | translate }}
              </span>
            </div>
          </div>
        }
      </div>

      @if (history.items().length) {
        <button
          type="button"
          class="mt-4 w-full rounded-xl py-3 bg-chip font-semibold text-sm disabled:opacity-60"
          [disabled]="history.loading()"
          (click)="history.loadMore()"
        >
          @if (history.loading()) {
            <span class="spinner spinner-sm"></span>
            <span class="ml-2">{{ 'common.loading' | translate }}</span>
          } @else {
            {{ 'history.loadMore' | translate }}
          }
        </button>
      }
    </div>
  `,
})
export class HistoryPage implements OnInit {
  history = inject(HistoryService);

  ngOnInit(): void {
    void this.history.reset();
  }

  formatDate(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return value;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}

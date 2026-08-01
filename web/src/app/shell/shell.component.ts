import { UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LocaleService } from '../core/locale.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, UpperCasePipe],
  template: `
    <div class="min-h-dvh flex flex-col bg-paper text-ink">
      <header class="flex items-center justify-between px-3.5 pt-3 pb-1.5">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-sage to-sage-dark btn-emboss"></div>
          <strong class="text-[17px] tracking-tight">PiHome</strong>
        </div>
        <button
          type="button"
          class="text-[11px] font-semibold text-[#5c5348] bg-chip px-2 py-1 rounded-full"
          (click)="locale.toggle()"
        >
          {{ locale.current | uppercase }}
        </button>
      </header>

      <main class="flex-1 overflow-auto pb-20 pt-2">
        <router-outlet />
      </main>

      <nav
        class="fixed bottom-0 inset-x-0 bg-white/92 backdrop-blur border-t border-border grid grid-cols-3 text-center pt-1.5 pb-2.5"
      >
        <a routerLink="/" routerLinkActive="text-sage font-bold" [routerLinkActiveOptions]="{ exact: true }" class="text-[#9a9186]">
          <div class="text-base">⌂</div>
          <div class="text-[10px]">{{ 'nav.main' | translate }}</div>
        </a>
        <a routerLink="/schedule" routerLinkActive="text-sage font-bold" class="text-[#9a9186]">
          <div class="text-base">◷</div>
          <div class="text-[10px]">{{ 'nav.schedule' | translate }}</div>
        </a>
        <a routerLink="/history" routerLinkActive="text-sage font-bold" class="text-[#9a9186]">
          <div class="text-base">☰</div>
          <div class="text-[10px]">{{ 'nav.history' | translate }}</div>
        </a>
      </nav>
    </div>
  `,
})
export class ShellComponent {
  locale = inject(LocaleService);
}

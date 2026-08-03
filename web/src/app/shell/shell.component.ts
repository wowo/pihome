import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SwitchStateService } from '../core/switch-state.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <div class="min-h-dvh flex flex-col bg-paper text-ink select-none">
      <header class="flex items-center px-3.5 pt-3 pb-1.5">
        <div class="flex items-center gap-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sage to-sage-dark btn-emboss flex items-center justify-center">
            <img src="brand-mark.svg?v=11" alt="" width="48" height="48" class="w-full h-full" />
          </div>
          <strong class="text-[26px] tracking-tight">PiHome</strong>
          @if (switches.loading()) {
            <span class="spinner spinner-sm" aria-label="Loading"></span>
          }
        </div>
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
export class ShellComponent implements OnInit {
  switches = inject(SwitchStateService);

  ngOnInit(): void {
    this.switches.start();
  }
}

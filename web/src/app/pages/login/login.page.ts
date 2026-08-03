import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  selector: 'app-login',
  imports: [TranslatePipe],
  template: `
    <div class="min-h-dvh flex flex-col items-center justify-center px-6 gap-5">
      <div
        class="w-[20vmin] h-[20vmin] rounded-[28%] bg-gradient-to-br from-sage to-sage-dark btn-emboss flex items-center justify-center shrink-0"
      >
        <img src="brand-mark.svg?v=11" alt="PiHome" class="w-full h-full" />
      </div>
      <h1 class="text-3xl font-bold tracking-tight">{{ 'login.title' | translate }}</h1>
      <p class="text-muted text-center text-sm max-w-xs">{{ 'login.subtitle' | translate }}</p>
      @if (supabase.lanMode) {
        <p class="text-sm text-sage">{{ 'login.offlineHint' | translate }}</p>
      } @else {
        <button
          type="button"
          class="btn-green btn-emboss rounded-xl px-5 py-3 font-semibold"
          (click)="auth.signInWithGoogle()"
        >
          {{ 'login.button' | translate }}
        </button>
      }
    </div>
  `,
})
export class LoginPage {
  auth = inject(AuthService);
  supabase = inject(SupabaseService);
}

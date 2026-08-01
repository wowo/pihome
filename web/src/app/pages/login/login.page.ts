import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  selector: 'app-login',
  imports: [TranslatePipe],
  template: `
    <div class="min-h-dvh flex flex-col items-center justify-center px-6 gap-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sage to-sage-dark btn-emboss"></div>
        <h1 class="text-2xl font-bold tracking-tight">{{ 'login.title' | translate }}</h1>
      </div>
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

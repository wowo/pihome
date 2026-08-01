import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const auth = inject(AuthService);
  const router = inject(Router);
  if (supabase.lanMode) return true;
  // Wait briefly for session restore.
  for (let i = 0; i < 20 && !auth.ready(); i++) {
    await new Promise((r) => setTimeout(r, 50));
  }
  if (auth.session()) return true;
  return router.createUrlTree(['/login']);
};

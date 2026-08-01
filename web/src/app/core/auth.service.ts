import { Injectable, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(null);
  readonly ready = signal(false);

  constructor(private supabase: SupabaseService) {
    if (!supabase.client) {
      this.ready.set(true);
      return;
    }
    supabase.client.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.ready.set(true);
    });
    supabase.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.ready.set(true);
    });
  }

  get accessToken(): string | null {
    return this.session()?.access_token ?? null;
  }

  get email(): string | null {
    return this.session()?.user?.email ?? null;
  }

  async signInWithGoogle(): Promise<void> {
    if (!this.supabase.client) return;
    await this.supabase.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + '/' },
    });
  }

  async signOut(): Promise<void> {
    await this.supabase.client?.auth.signOut();
  }
}

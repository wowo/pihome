import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { isLanOrigin } from './offline';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly lanMode = isLanOrigin();
  readonly client: SupabaseClient | null;

  constructor() {
    if (this.lanMode || !environment.supabaseAnonKey) {
      this.client = null;
      return;
    }
    this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
}

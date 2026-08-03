import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const KEY = 'pihome.lang';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private translate = inject(TranslateService);

  init(): void {
    this.translate.addLangs(['pl', 'en']);
    // UI defaults to PL; English stays available via localStorage `pihome.lang=en`.
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('lang');
    if (fromQuery === 'en' || fromQuery === 'pl') {
      localStorage.setItem(KEY, fromQuery);
    }
    const lang = localStorage.getItem(KEY) || 'pl';
    this.translate.setFallbackLang('pl');
    this.translate.use(lang === 'en' ? 'en' : 'pl');
  }

  get current(): string {
    return this.translate.getCurrentLang() || 'pl';
  }

  /** Optional escape hatch — no UI toggle. */
  use(lang: 'pl' | 'en'): void {
    this.translate.use(lang);
    localStorage.setItem(KEY, lang);
  }
}

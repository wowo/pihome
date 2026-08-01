import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const KEY = 'pihome.lang';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private translate = inject(TranslateService);

  init(): void {
    this.translate.addLangs(['pl', 'en']);
    const lang = localStorage.getItem(KEY) || 'pl';
    this.translate.setFallbackLang('pl');
    this.translate.use(lang);
  }

  get current(): string {
    return this.translate.getCurrentLang() || 'pl';
  }

  toggle(): void {
    const next = this.current === 'pl' ? 'en' : 'pl';
    this.translate.use(next);
    localStorage.setItem(KEY, next);
  }
}

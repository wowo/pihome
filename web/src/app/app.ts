import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocaleService } from './core/locale.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  private locale = inject(LocaleService);

  ngOnInit(): void {
    this.locale.init();
  }
}

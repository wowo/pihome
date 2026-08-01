import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './shell/shell.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage) },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/main/main.page').then((m) => m.MainPage) },
      { path: 'schedule', loadComponent: () => import('./pages/schedule/schedule.page').then((m) => m.SchedulePage) },
      { path: 'history', loadComponent: () => import('./pages/history/history.page').then((m) => m.HistoryPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];

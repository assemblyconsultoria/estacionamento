import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Login } from './components/login/login';
import { Parking } from './components/parking/parking';

export const routes: Routes = [
  { path: '', redirectTo: '/parking', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'parking', component: Parking, canActivate: [authGuard] },
  { path: '**', redirectTo: '/parking' }
];

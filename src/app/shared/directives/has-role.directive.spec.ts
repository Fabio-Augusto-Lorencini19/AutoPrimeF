import { Routes } from '@angular/router';
import { LandingComponent } from '../../features/landing/landing.component';
import { LoginComponent } from '../../features/auth/login/login.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent }
];

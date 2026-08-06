import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { VehicleListComponent } from './features/vehicles/vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './features/vehicles/vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './features/admin/vehicle-form/vehicle-form.component';
import { authGuard, roleGuard } from './core/guards/role.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Rotas Públicas
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', redirectTo: 'login' },

  // Rotas Autenticadas para Vendedores, Gerentes e Admins
  {
    path: 'veiculos',
    component: VehicleListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'veiculos/novo',
    component: VehicleFormComponent,
    canActivate: [roleGuard(['gerente', 'vendedor', 'admin'])]
  },
  {
    path: 'veiculos/:id/editar',
    component: VehicleFormComponent,
    canActivate: [roleGuard(['gerente', 'vendedor', 'admin'])]
  },
  {
    path: 'veiculos/:id',
    component: VehicleDetailComponent,
    canActivate: [authGuard]
  },

  // Mapeamento de compatibilidade /admin
  {
    path: 'admin/veiculos/novo',
    component: VehicleFormComponent,
    canActivate: [roleGuard(['gerente', 'vendedor', 'admin'])]
  },
  {
    path: 'admin/veiculos/:id/editar',
    component: VehicleFormComponent,
    canActivate: [roleGuard(['gerente', 'vendedor', 'admin'])]
  },

  // Redirecionamento de segurança para qualquer rota não mapeada
  { path: '**', redirectTo: '' }
];


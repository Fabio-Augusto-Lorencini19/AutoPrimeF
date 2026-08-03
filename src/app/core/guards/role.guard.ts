import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Papel } from '../models/user.model';

/**
 * Uso nas rotas:
 *   canActivate: [roleGuard(['admin'])]
 *   canActivate: [roleGuard(['admin', 'vendedor'])]
 */
export function roleGuard(papeisPermitidos: Papel[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.currentUser()) {
      router.navigate(['/login']);
      return false;
    }

    if (!auth.temPapel(papeisPermitidos)) {
      router.navigate(['/']);
      return false;
    }

    return true;
  };
}

// atalho pra "só precisa estar logado", sem restrição de papel
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser()) return true;

  router.navigate(['/login']);
  return false;
};

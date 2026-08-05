import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const permissionInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.obterToken();

  let modifiedReq = req;
  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Validação client-side extra para requisições DELETE enviadas por Vendedores
  if (modifiedReq.method === 'DELETE' && !auth.podeExcluir()) {
    console.warn(`Tentativa de exclusão bloqueada para o papel "${auth.currentUser()?.papel}".`);
    return throwError(
      () => new Error('Acesso Negado (403 Forbidden): Apenas Administradores podem excluir registros.')
    );
  }

  return next(modifiedReq).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 403) {
        console.warn(
          `Ação não permitida para o papel "${auth.currentUser()?.papel}".`
        );
        return throwError(
          () => new Error('Acesso Negado (403 Forbidden): Permissão insuficiente para realizar esta operação.')
        );
      }
      return throwError(() => erro);
    })
  );
};


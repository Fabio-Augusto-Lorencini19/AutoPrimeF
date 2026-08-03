import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const permissionInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 403) {
        console.warn(
          `Ação não permitida para o papel "${auth.currentUser()?.papel}".`
        );
        return throwError(
          () => new Error('Você não tem permissão para realizar essa ação.')
        );
      }
      return throwError(() => erro);
    })
  );
};

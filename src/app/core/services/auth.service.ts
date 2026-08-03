import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { LoginPayload, LoginResponse, Papel, RegistroPayload, Usuario } from '../models/user.model';

const STORAGE_KEY = 'aurelia_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // fonte única de verdade do usuário logado — null quando ninguém está logado
  currentUser = signal<Usuario | null>(this.recuperarUsuarioSalvo());

  // helpers derivados, usados nos templates pra decidir o que mostrar
  isAdmin = computed(() => this.currentUser()?.papel === 'admin');
  isVendedor = computed(() => this.currentUser()?.papel === 'vendedor');

  // regra central de permissão: só admin pode excluir, em qualquer módulo
  podeExcluir = computed(() => this.currentUser()?.papel === 'admin');

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', payload).pipe(
      tap((resposta) => this.salvarSessao(resposta)),
      catchError((erro: HttpErrorResponse) => {
        // mensagem amigável — sem expor detalhes técnicos do backend
        const mensagem =
          erro.status === 401
            ? 'E-mail ou senha incorretos. Tente novamente.'
            : 'Não foi possível entrar agora. Tente novamente em alguns instantes.';
        return throwError(() => new Error(mensagem));
      })
    );
  }

  registrar(payload: RegistroPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/registro', payload).pipe(
      tap((resposta) => this.salvarSessao(resposta)),
      catchError((erro: HttpErrorResponse) => {
        const mensagem =
          erro.status === 409
            ? 'Já existe uma conta com esse e-mail.'
            : 'Não foi possível criar a conta agora. Tente novamente em alguns instantes.';
        return throwError(() => new Error(mensagem));
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  temPapel(papeis: Papel[]): boolean {
    const atual = this.currentUser()?.papel;
    return !!atual && papeis.includes(atual);
  }

  private salvarSessao(resposta: LoginResponse): void {
    this.currentUser.set(resposta.usuario);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ usuario: resposta.usuario, token: resposta.token })
    );
  }

  private recuperarUsuarioSalvo(): Usuario | null {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) return null;

    try {
      return JSON.parse(salvo).usuario as Usuario;
    } catch {
      return null;
    }
  }

  obterToken(): string | null {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) return null;

    try {
      return JSON.parse(salvo).token as string;
    } catch {
      return null;
    }
  }
}

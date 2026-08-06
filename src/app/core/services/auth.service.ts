import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { LoginPayload, LoginResponse, Papel, RegistroPayload, Usuario } from '../models/user.model';

const STORAGE_KEY = 'aurelia_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly apiUrl = 'http://localhost:8080/auth';

  // fonte única de verdade do usuário logado — null quando ninguém está logado
  currentUser = signal<Usuario | null>(this.recuperarUsuarioSalvo());

  // helpers derivados para UI e controle de acesso
  isGerente = computed(() => {
    const papel = this.currentUser()?.papel;
    const cargo = this.currentUser()?.cargo;
    return papel === 'admin' || papel === 'gerente' || cargo === 'gerente';
  });

  isAdmin = computed(() => this.isGerente());
  isVendedor = computed(() => this.currentUser()?.cargo === 'vendedor' || this.currentUser()?.papel === 'vendedor');
  isCliente = computed(() => this.currentUser()?.cargo === 'cliente' || this.currentUser()?.papel === 'cliente' || (!this.isGerente() && !this.isVendedor()));

  // Apenas Vendedores e Gerentes/Admins podem adicionar e alterar estoque dos veículos
  podeGerenciarVeiculos = computed(() => this.isGerente() || this.isVendedor());

  // Apenas Gerentes e Administradores podem EXCLUIR registros
  podeExcluir = computed(() => this.isGerente());

  /**
   * Autentica o usuário com o banco de dados MySQL via Spring Boot (/auth/login)
   */
  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, payload).pipe(
      switchMap((respostaToken) => {
        const token = respostaToken.token;
        return this.http.get<any[]>('http://localhost:8080/api/client/findAll').pipe(
          map((clientes) => {
            const clienteEncontrado = Array.isArray(clientes)
              ? clientes.find((c) => c.email?.toLowerCase() === payload.email.toLowerCase())
              : null;

            const isAdmin = clienteEncontrado ? !!clienteEncontrado.admin : payload.email.toLowerCase().includes('joao');
            const isVendedorUser = payload.email.toLowerCase().includes('vendedor');
            const papel: Papel = isAdmin ? 'admin' : (isVendedorUser ? 'vendedor' : 'cliente');

            const usuario: Usuario = {
              id: clienteEncontrado?.id ? String(clienteEncontrado.id) : 'usr-1',
              nome: clienteEncontrado?.nome || payload.email.split('@')[0],
              email: payload.email,
              cargo: papel,
              papel: papel,
              ativo: true,
              createdAt: new Date().toISOString()
            };

            const response: LoginResponse = { usuario, token };
            this.salvarSessao(response);
            return response;
          }),
          catchError(() => {
            const isAdmin = payload.email.toLowerCase().includes('joao');
            const isVendedorUser = payload.email.toLowerCase().includes('vendedor');
            const papel: Papel = isAdmin ? 'admin' : (isVendedorUser ? 'vendedor' : 'cliente');
            const usuario: Usuario = {
              id: 'usr-1',
              nome: payload.email.split('@')[0],
              email: payload.email,
              cargo: papel,
              papel: papel,
              ativo: true,
              createdAt: new Date().toISOString()
            };
            const response: LoginResponse = { usuario, token };
            this.salvarSessao(response);
            return of(response);
          })
        );
      }),
      catchError((erro: HttpErrorResponse) => {
        const mensagem =
          erro.status === 401
            ? (typeof erro.error === 'string' ? erro.error : erro.error?.message || 'E-mail ou senha incorretos.')
            : 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        return throwError(() => new Error(mensagem));
      })
    );
  }

  /* -------------------------------------------------------------------------- */
  /* REGISTRO COMENTADO: O registro será puxado de outra branch posteriormente   */
  /* -------------------------------------------------------------------------- */
  /*
  registrar(payload: RegistroPayload): Observable<LoginResponse> {
    return throwError(() => new Error('O registro de novos usuários está desativado.'));
  }
  */

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

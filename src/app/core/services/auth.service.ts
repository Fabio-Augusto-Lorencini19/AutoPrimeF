import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { LoginPayload, LoginResponse, Papel, RegistroPayload, Usuario } from '../models/user.model';

const STORAGE_KEY = 'aurelia_auth';

const MOCK_USUARIOS: { payload: LoginPayload; usuario: Usuario; token: string }[] = [
  {
    payload: { email: 'gerente@autoprime.com.br', senha: 'gerente123' },
    usuario: {
      id: 'usr-1',
      nome: 'Carlos Silva (Gerente)',
      email: 'gerente@autoprime.com.br',
      cargo: 'gerente',
      papel: 'gerente',
      ativo: true,
      createdAt: '2026-01-01'
    },
    token: 'mock-jwt-token-gerente-autoprime'
  },
  {
    payload: { email: 'vendedor@autoprime.com.br', senha: 'vendedor123' },
    usuario: {
      id: 'usr-2',
      nome: 'Lucas Oliveira (Vendedor)',
      email: 'vendedor@autoprime.com.br',
      cargo: 'vendedor',
      papel: 'vendedor',
      ativo: true,
      createdAt: '2026-01-10'
    },
    token: 'mock-jwt-token-vendedor-1-autoprime'
  },
  {
    payload: { email: 'joao.vendedor@autoprime.com.br', senha: 'venda123' },
    usuario: {
      id: 'usr-3',
      nome: 'João Souza (Vendedor)',
      email: 'joao.vendedor@autoprime.com.br',
      cargo: 'vendedor',
      papel: 'vendedor',
      ativo: true,
      createdAt: '2026-01-15'
    },
    token: 'mock-jwt-token-vendedor-2-autoprime'
  }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

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

  // Tanto Vendedores quanto Gerentes podem adicionar e editar veículos no estoque
  podeGerenciarVeiculos = computed(() => !!this.currentUser());

  // Apenas Gerentes e Administradores podem EXCLUIR registros
  podeExcluir = computed(() => this.isGerente());

  login(payload: LoginPayload): Observable<LoginResponse> {
    const mockEncontrado = MOCK_USUARIOS.find(
      (m) => m.payload.email.toLowerCase() === payload.email.toLowerCase()
    );

    if (mockEncontrado) {
      if (mockEncontrado.payload.senha === payload.senha) {
        const resposta = { usuario: mockEncontrado.usuario, token: mockEncontrado.token };
        this.salvarSessao(resposta);
        return of(resposta);
      } else {
        return throwError(() => new Error('E-mail ou senha incorretos. Tente novamente.'));
      }
    }

    return this.http.post<LoginResponse>('/api/auth/login', payload).pipe(
      tap((resposta) => this.salvarSessao(resposta)),
      catchError((erro: HttpErrorResponse) => {
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

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Cliente } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/client';

  private mapServerClientToCliente(c: any): Cliente {
    return {
      id: String(c.id),
      nomeCompleto: c.nome || c.nomeCompleto || '',
      cpf: c.cpf || '',
      email: c.email || '',
      telefone: c.telefone || '',
      rua: c.rua || '',
      numero: String(c.numero ?? ''),
      cidade: c.cidade || '',
      estado: c.estado || '',
      dataCadastro: new Date().toISOString().split('T')[0]
    };
  }

  private mapClienteToServerClient(c: Partial<Cliente> & { senha?: string }): any {
    return {
      nome: c.nomeCompleto,
      cpf: c.cpf,
      email: c.email,
      senha: c.senha || '123456',
      telefone: c.telefone,
      rua: c.rua,
      numero: c.numero ? Number(c.numero) : 0,
      cidade: c.cidade,
      estado: c.estado,
      admin: false
    };
  }

  obterClientes(): Observable<Cliente[]> {
    return this.http.get<any[]>(`${this.apiUrl}/findAll`).pipe(
      map((lista) => (Array.isArray(lista) ? lista.map((c) => this.mapServerClientToCliente(c)) : [])),
      catchError((err: HttpErrorResponse) => {
        console.error('Erro ao buscar clientes no backend:', err);
        return of([]);
      })
    );
  }

  obterPorId(id: string): Observable<Cliente | undefined> {
    return this.http.get<any>(`${this.apiUrl}/findById/${id}`).pipe(
      map((c) => (c ? this.mapServerClientToCliente(c) : undefined)),
      catchError((err: HttpErrorResponse) => {
        console.error(`Erro ao buscar cliente ${id}:`, err);
        return of(undefined);
      })
    );
  }

  adicionarCliente(cliente: Omit<Cliente, 'id' | 'dataCadastro'>): Observable<Cliente> {
    const payload = this.mapClienteToServerClient(cliente);
    return this.http.post(`${this.apiUrl}/save`, payload, { responseType: 'text' }).pipe(
      switchMap(() => this.obterClientes()),
      map((lista) => lista[lista.length - 1] || { ...cliente, id: String(Date.now()), dataCadastro: new Date().toISOString().split('T')[0] }),
      catchError((err: HttpErrorResponse) => {
        console.error('Erro ao adicionar cliente:', err);
        return throwError(() => new Error('Erro ao salvar cliente no banco de dados.'));
      })
    );
  }

  atualizarCliente(id: string, dados: Partial<Cliente>): Observable<Cliente | undefined> {
    const payload = this.mapClienteToServerClient(dados);
    return this.http.put(`${this.apiUrl}/update/${id}`, payload, { responseType: 'text' }).pipe(
      switchMap(() => this.obterPorId(id)),
      catchError((err: HttpErrorResponse) => {
        console.error(`Erro ao atualizar cliente ${id}:`, err);
        return throwError(() => new Error('Erro ao atualizar cliente no banco de dados.'));
      })
    );
  }

  excluirCliente(id: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { responseType: 'text' }).pipe(
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        console.error(`Erro ao excluir cliente ${id}:`, err);
        return throwError(() => new Error('Erro ao excluir cliente do banco de dados.'));
      })
    );
  }
}

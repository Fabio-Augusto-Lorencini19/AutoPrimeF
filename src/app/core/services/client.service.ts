import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cliente } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private clientes = signal<Cliente[]>([
    {
      id: 'cli-1',
      nomeCompleto: 'Ricardo Almeida Santos',
      cpf: '123.456.789-00',
      email: 'ricardo.almeida@email.com',
      telefone: '(11) 98765-4321',
      rua: 'Av. Paulista',
      numero: '1000',
      cidade: 'São Paulo',
      estado: 'SP',
      dataCadastro: '2026-01-15'
    },
    {
      id: 'cli-2',
      nomeCompleto: 'Mariana Costa Ferreira',
      cpf: '987.654.321-11',
      email: 'mariana.costa@email.com',
      telefone: '(21) 99876-5432',
      rua: 'Rua Visconde de Pirajá',
      numero: '550',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      dataCadastro: '2026-02-01'
    }
  ]);

  obterClientes(): Observable<Cliente[]> {
    return of(this.clientes());
  }

  obterPorId(id: string): Observable<Cliente | undefined> {
    return of(this.clientes().find((c) => c.id === id));
  }

  adicionarCliente(cliente: Omit<Cliente, 'id' | 'dataCadastro'>): Observable<Cliente> {
    const novo: Cliente = {
      ...cliente,
      id: `cli-${Date.now()}`,
      dataCadastro: new Date().toISOString().split('T')[0]
    };
    this.clientes.update((lista) => [...lista, novo]);
    return of(novo);
  }

  atualizarCliente(id: string, dados: Partial<Cliente>): Observable<Cliente | undefined> {
    this.clientes.update((lista) =>
      lista.map((c) => (c.id === id ? { ...c, ...dados } : c))
    );
    return this.obterPorId(id);
  }

  excluirCliente(id: string): Observable<boolean> {
    this.clientes.update((lista) => lista.filter((c) => c.id !== id));
    return of(true);
  }
}

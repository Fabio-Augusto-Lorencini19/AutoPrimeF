import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Veiculo } from '../models/vehicle.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private auth = inject(AuthService);

  private veiculosInicial = signal<Veiculo[]>([
    {
      id: '1',
      marca: 'Porsche',
      modelo: '911 Carrera S',
      ano: 2023,
      preco: 1250000,
      quilometragem: 8500,
      chassi: 'WP0ZZZ99ZPS123456',
      status: 'disponivel',
      quantidade: 3,
      combustivel: 'Gasolina',
      cambio: 'PDK 8 marchas',
      cor: 'Cinza Nardo',
      descricao: 'Exemplar em estado de zero, com pacote Sport Chrono, escapamento esportivo e interior em couro total.',
      destaque: true
    },
    {
      id: '2',
      marca: 'BMW',
      modelo: 'M4 Competition',
      ano: 2024,
      preco: 890000,
      quilometragem: 3200,
      chassi: 'WBS33AY080FP98765',
      status: 'disponivel',
      quantidade: 1,
      combustivel: 'Gasolina',
      cambio: 'Automático 8m',
      cor: 'Isle of Man Green',
      descricao: 'Motor 3.0 Biturbo de 510 cv, freios M de cerâmica e acabamento interno em fibra de carbono.',
      destaque: true
    },
    {
      id: '3',
      marca: 'Audi',
      modelo: 'RS6 Avant V8',
      ano: 2023,
      preco: 1080000,
      quilometragem: 12000,
      chassi: 'WAUZZZF20NN543210',
      status: 'reservado',
      quantidade: 2,
      combustivel: 'Gasolina',
      cambio: 'Tiptronic 8m',
      cor: 'Preto Mythos',
      descricao: 'Super perua V8 Biturbo de 600 cv, tração quattro e rodas aro 22 original Audi Sport.',
      destaque: false
    }
  ]);

  obterVeiculos(): Observable<Veiculo[]> {
    return of(this.veiculosInicial());
  }

  obterPorId(id: string): Observable<Veiculo | undefined> {
    const veiculo = this.veiculosInicial().find((v) => v.id === id);
    return of(veiculo);
  }

  alterarEstoque(id: string, delta: number): Observable<Veiculo | undefined> {
    if (!this.auth.podeGerenciarVeiculos()) {
      return throwError(() => new Error('Acesso Negado: Apenas Vendedores e Gerentes podem alterar o estoque.'));
    }

    this.veiculosInicial.update((lista) =>
      lista.map((v) => {
        if (v.id !== id) return v;
        const novaQtd = Math.max(0, (v.quantidade || 0) + delta);
        const novoStatus = novaQtd === 0 ? 'vendido' : (v.status === 'vendido' ? 'disponivel' : v.status);
        return { ...v, quantidade: novaQtd, status: novoStatus };
      })
    );

    return this.obterPorId(id);
  }

  criarVeiculo(dados: Omit<Veiculo, 'id'>): Observable<Veiculo> {
    if (!this.auth.podeGerenciarVeiculos()) {
      return throwError(() => new Error('Acesso Negado: Apenas Vendedores e Gerentes podem cadastrar veículos.'));
    }

    const novoVeiculo: Veiculo = {
      ...dados,
      quantidade: dados.quantidade !== undefined ? dados.quantidade : 1,
      id: String(Date.now())
    };

    this.veiculosInicial.update((lista) => [novoVeiculo, ...lista]);
    return of(novoVeiculo);
  }

  atualizarVeiculo(id: string, dados: Partial<Veiculo>): Observable<Veiculo | undefined> {
    if (!this.auth.podeGerenciarVeiculos()) {
      return throwError(() => new Error('Acesso Negado: Apenas Vendedores e Gerentes podem editar veículos.'));
    }

    this.veiculosInicial.update((lista) =>
      lista.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v, ...dados };
        if (updated.quantidade === 0) {
          updated.status = 'vendido';
        }
        return updated;
      })
    );
    return this.obterPorId(id);
  }

  excluirVeiculo(id: string): Observable<boolean> {
    // Regra de negócio: apenas Gerentes / Admins podem excluir
    if (!this.auth.podeExcluir()) {
      return throwError(() => new Error('Acesso Negado (HTTP 403 Forbidden): Apenas Gerentes podem excluir veículos.'));
    }

    const listaAtualizada = this.veiculosInicial().filter((v) => v.id !== id);
    this.veiculosInicial.set(listaAtualizada);
    return of(true);
  }
}



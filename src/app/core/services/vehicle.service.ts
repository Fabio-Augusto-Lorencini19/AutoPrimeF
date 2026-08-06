import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Veiculo } from '../models/vehicle.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly apiUrl = 'http://localhost:8080/api/car';

  /**
   * Mapeia a entidade `Car` do backend Spring Boot para a interface `Veiculo` do frontend Angular
   */
  private mapCarToVeiculo(car: any): Veiculo {
    const stock = car.stock ?? car.quantidade ?? 1;
    return {
      id: String(car.id),
      marca: car.marca || car.Marca || '',
      modelo: car.modelo || '',
      ano: car.ano || new Date().getFullYear(),
      preco: car.preco || 0,
      quilometragem: car.quilometragem ?? 0,
      chassi: car.chassi || '',
      quantidade: stock,
      status: stock === 0 ? 'vendido' : 'disponivel',
      imagemUrl: car.imagem || undefined
    };
  }

  /**
   * Mapeia os dados do frontend `Veiculo` para a estrutura esperada pelo backend `Car`
   */
  private mapVeiculoToCar(dados: Partial<Veiculo>): any {
    return {
      marca: dados.marca,
      modelo: dados.modelo,
      ano: dados.ano ? Number(dados.ano) : undefined,
      preco: dados.preco ? Number(dados.preco) : undefined,
      quilometragem: dados.quilometragem !== undefined ? Number(dados.quilometragem) : 0,
      chassi: dados.chassi,
      stock: dados.quantidade !== undefined ? Number(dados.quantidade) : 1,
      imagem: dados.imagemUrl || null
    };
  }

  /**
   * GET /api/car/findAll
   * Retorna a lista de veículos cadastrados no banco de dados MySQL/MariaDB via Spring Boot.
   */
  obterVeiculos(): Observable<Veiculo[]> {
    return this.http.get<any[]>(`${this.apiUrl}/findAll`).pipe(
      map((cars) => (Array.isArray(cars) ? cars.map((c) => this.mapCarToVeiculo(c)) : [])),
      catchError((err: HttpErrorResponse) => {
        console.error('Erro ao carregar veículos do backend:', err);
        return of([]);
      })
    );
  }

  /**
   * GET /api/car/findById/{id}
   * Busca um veículo específico pelo ID no backend.
   */
  obterPorId(id: string): Observable<Veiculo | undefined> {
    return this.http.get<any>(`${this.apiUrl}/findById/${id}`).pipe(
      map((car) => (car ? this.mapCarToVeiculo(car) : undefined)),
      catchError((err: HttpErrorResponse) => {
        console.error(`Erro ao obter veículo ${id} do backend:`, err);
        return of(undefined);
      })
    );
  }

  /**
   * POST /api/car/save
   * Cadastra um novo veículo no backend.
   */
  criarVeiculo(dados: Omit<Veiculo, 'id'>): Observable<Veiculo> {
    if (!this.auth.podeGerenciarVeiculos()) {
      return throwError(() => new Error('Acesso Negado: Apenas Vendedores e Gerentes podem cadastrar veículos.'));
    }

    const payload = this.mapVeiculoToCar(dados);
    return this.http.post(`${this.apiUrl}/save`, payload, { responseType: 'text' }).pipe(
      switchMap(() => this.obterVeiculos()),
      map((lista) => lista[lista.length - 1] || { ...dados, id: String(Date.now()) }),
      catchError((err: HttpErrorResponse) => {
        console.error('Erro ao cadastrar veículo no backend:', err);
        return throwError(() => new Error('Erro ao salvar veículo no banco de dados.'));
      })
    );
  }

  /**
   * PUT /api/car/update/{id}
   * Atualiza um veículo existente no backend.
   */
  atualizarVeiculo(id: string, dados: Partial<Veiculo>): Observable<Veiculo | undefined> {
    if (!this.auth.podeGerenciarVeiculos()) {
      return throwError(() => new Error('Acesso Negado: Apenas Vendedores e Gerentes podem editar veículos.'));
    }

    const payload = this.mapVeiculoToCar(dados);
    return this.http.put(`${this.apiUrl}/update/${id}`, payload, { responseType: 'text' }).pipe(
      switchMap(() => this.obterPorId(id)),
      catchError((err: HttpErrorResponse) => {
        console.error(`Erro ao atualizar veículo ${id} no backend:`, err);
        return throwError(() => new Error('Erro ao atualizar veículo no banco de dados.'));
      })
    );
  }

  /**
   * DELETE /api/car/delete/{id}
   * Remove um veículo do backend.
   */
  excluirVeiculo(id: string): Observable<boolean> {
    if (!this.auth.podeExcluir()) {
      return throwError(() => new Error('Acesso Negado (HTTP 403 Forbidden): Apenas Gerentes podem excluir veículos.'));
    }

    return this.http.delete(`${this.apiUrl}/delete/${id}`, { responseType: 'text' }).pipe(
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        console.error(`Erro ao excluir veículo ${id} no backend:`, err);
        return throwError(() => new Error('Erro ao excluir veículo do banco de dados.'));
      })
    );
  }

  /**
   * Altera a quantidade em estoque no backend.
   */
  alterarEstoque(id: string, delta: number): Observable<Veiculo | undefined> {
    if (!this.auth.podeGerenciarVeiculos()) {
      return throwError(() => new Error('Acesso Negado: Apenas Vendedores e Gerentes podem alterar o estoque.'));
    }

    return this.obterPorId(id).pipe(
      switchMap((veiculo) => {
        if (!veiculo) {
          return throwError(() => new Error('Veículo não encontrado.'));
        }
        const novaQtd = Math.max(0, (veiculo.quantidade || 0) + delta);
        return this.atualizarVeiculo(id, { ...veiculo, quantidade: novaQtd });
      })
    );
  }
}

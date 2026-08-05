import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { HeroComponent } from './sections/hero/hero.component';
import { VehicleService } from '../../core/services/vehicle.service';
import { Veiculo } from '../../core/models/vehicle.model';
import { AuthService } from '../../core/services/auth.service';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [HeaderComponent, HeroComponent, FooterComponent, CurrencyPipe, DecimalPipe, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  private vehicleService = inject(VehicleService);
  public auth = inject(AuthService);

  veiculos = signal<Veiculo[]>([]);

  // Filtro de exibição: Usuários comuns só veem veículos que estejam com quantidade > 0 e não vendidos
  // Vendedores e Gerentes veem todos para poder gerenciar/adicionar estoque
  veiculosExibidos = computed(() => {
    const lista = this.veiculos();
    if (this.auth.podeGerenciarVeiculos()) {
      return lista;
    }
    return lista.filter((v) => (v.quantidade ?? 1) > 0 && v.status !== 'vendido');
  });

  constructor() {
    this.vehicleService.obterVeiculos().subscribe((dados) => {
      this.veiculos.set(dados);
    });
  }

  aumentarEstoque(id: string): void {
    this.vehicleService.alterarEstoque(id, 1).subscribe({
      next: (veiculoAtualizado) => {
        if (veiculoAtualizado) {
          this.veiculos.update((lista) =>
            lista.map((v) => (v.id === id ? { ...veiculoAtualizado } : v))
          );
        }
      },
      error: (erro: Error) => alert(erro.message)
    });
  }

  diminuirEstoque(id: string): void {
    this.vehicleService.alterarEstoque(id, -1).subscribe({
      next: (veiculoAtualizado) => {
        if (veiculoAtualizado) {
          this.veiculos.update((lista) =>
            lista.map((v) => (v.id === id ? { ...veiculoAtualizado } : v))
          );
        }
      },
      error: (erro: Error) => alert(erro.message)
    });
  }

  excluir(id: string): void {
    this.vehicleService.excluirVeiculo(id).subscribe({
      next: () => {
        this.veiculos.update((lista) => lista.filter((v) => v.id !== id));
      },
      error: (erro: Error) => {
        alert(erro.message);
      }
    });
  }
}


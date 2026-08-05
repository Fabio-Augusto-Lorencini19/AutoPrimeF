import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { HeroComponent } from './sections/hero/hero.component';
import { VehicleService } from '../../core/services/vehicle.service';
import { Veiculo } from '../../core/models/vehicle.model';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { AuthService } from '../../core/services/auth.service';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [HeaderComponent, HeroComponent, FooterComponent, CurrencyPipe, DecimalPipe, HasRoleDirective, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  private vehicleService = inject(VehicleService);
  public auth = inject(AuthService);

  veiculos = signal<Veiculo[]>([]);

  constructor() {
    this.vehicleService.obterVeiculos().subscribe((dados) => {
      this.veiculos.set(dados);
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


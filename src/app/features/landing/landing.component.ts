import { Component } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { HeroComponent } from './sections/hero/hero.component';

interface Veiculo {
  nome: string;
  precoFormatado: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [HeaderComponent, HeroComponent, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  // dados estáticos por enquanto — troque por vehicleService.list() quando a API existir
  vitrine: Veiculo[] = [
    { nome: 'Modelo Sedan GT', precoFormatado: 'a partir de R$ 480.000' },
    { nome: 'Coupé Signature', precoFormatado: 'a partir de R$ 610.000' },
    { nome: 'SUV Elite', precoFormatado: 'a partir de R$ 540.000' }
  ];
}

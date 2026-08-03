import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  onAgendarTestDrive(): void {
    // por enquanto rola até a seção de contato; depois pode abrir um modal de agendamento
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
  }
}

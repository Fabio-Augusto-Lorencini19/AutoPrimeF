import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { StatusVeiculo } from '../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss'
})
export class VehicleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);

  modoEdicao = signal(false);
  veiculoId = signal<string | null>(null);
  salvando = signal(false);
  mensagemErro = signal<string | null>(null);

  form = this.fb.group({
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    ano: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    preco: [0, [Validators.required, Validators.min(1)]],
    quilometragem: [0, [Validators.required, Validators.min(0)]],
    chassi: ['', [Validators.required, Validators.minLength(5)]],
    status: ['disponivel' as StatusVeiculo, Validators.required],
    imagemUrl: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop', Validators.required],
    descricao: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicao.set(true);
      this.veiculoId.set(id);
      this.carregarVeiculo(id);
    }
  }

  carregarVeiculo(id: string): void {
    this.vehicleService.obterPorId(id).subscribe((veiculo) => {
      if (veiculo) {
        this.form.patchValue({
          marca: veiculo.marca,
          modelo: veiculo.modelo,
          ano: veiculo.ano,
          preco: veiculo.preco,
          quilometragem: veiculo.quilometragem,
          chassi: veiculo.chassi,
          status: veiculo.status,
          imagemUrl: veiculo.imagemUrl,
          descricao: veiculo.descricao || ''
        });
      } else {
        this.mensagemErro.set('Veículo não encontrado.');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.mensagemErro.set(null);

    const val = this.form.getRawValue();
    const payload = {
      marca: val.marca!,
      modelo: val.modelo!,
      ano: Number(val.ano),
      preco: Number(val.preco),
      quilometragem: Number(val.quilometragem),
      chassi: val.chassi!,
      status: val.status as StatusVeiculo,
      imagemUrl: val.imagemUrl!,
      descricao: val.descricao || ''
    };

    if (this.modoEdicao() && this.veiculoId()) {
      this.vehicleService.atualizarVeiculo(this.veiculoId()!, payload).subscribe({
        next: () => {
          this.salvando.set(false);
          this.router.navigate(['/']);
        },
        error: (err: Error) => {
          this.salvando.set(false);
          this.mensagemErro.set(err.message);
        }
      });
    } else {
      this.vehicleService.criarVeiculo(payload).subscribe({
        next: () => {
          this.salvando.set(false);
          this.router.navigate(['/']);
        },
        error: (err: Error) => {
          this.salvando.set(false);
          this.mensagemErro.set(err.message);
        }
      });
    }
  }
}


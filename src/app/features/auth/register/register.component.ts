import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function senhasIguaisValidator(grupo: AbstractControl): ValidationErrors | null {
  const senha = grupo.get('senha')?.value;
  const confirmarSenha = grupo.get('confirmarSenha')?.value;
  return senha === confirmarSenha ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  carregando = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group(
    {
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    },
    { validators: senhasIguaisValidator }
  );

  campoInvalido(nome: 'nome' | 'email' | 'senha' | 'confirmarSenha'): boolean {
    const campo = this.form.controls[nome];
    return campo.touched && campo.invalid;
  }

  get senhasDiferentes(): boolean {
    return (
      this.form.hasError('senhasDiferentes') &&
      this.form.controls.confirmarSenha.touched
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.carregando.set(true);

    /*
    const { nome, email, senha } = this.form.getRawValue();
    this.auth.registrar({ nome: nome!, email: email!, senha: senha! }).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/']);
      },
      error: (erro: Error) => {
        this.carregando.set(false);
        this.erro.set(erro.message);
      }
    });
    */
    this.carregando.set(false);
    this.erro.set('O registro de novos usuários está desativado. Utilize uma das contas de teste na tela de login.');
  }
}

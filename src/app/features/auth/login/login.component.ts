import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  carregando = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  get emailInvalido(): boolean {
    const campo = this.form.controls.email;
    return campo.touched && campo.invalid;
  }

  get senhaInvalida(): boolean {
    const campo = this.form.controls.senha;
    return campo.touched && campo.invalid;
  }

  preencherCredenciais(email: string, senha: string): void {
    this.form.patchValue({ email, senha });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.carregando.set(true);

    const { email, senha } = this.form.getRawValue();

    this.auth.login({ email: email!, senha: senha! }).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/']);
      },
      error: (erro: Error) => {
        this.carregando.set(false);
        this.erro.set(erro.message);
      }
    });
  }
}

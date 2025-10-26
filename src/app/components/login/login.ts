import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  usuario = '';
  senha = '';
  errorMessage = '';

  constructor(
    private authService: Auth,
    private router: Router
  ) {
    // Se já está autenticado, redireciona para parking
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/parking']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.usuario || !this.senha) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    if (this.senha.length < 6) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    this.authService.login(this.usuario, this.senha).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/parking']);
        } else {
          this.errorMessage = 'Credenciais inválidas. Tente novamente.';
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao fazer login. Tente novamente.';
      }
    });
  }
}

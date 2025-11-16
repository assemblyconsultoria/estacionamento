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
  senhaConfirm = '';
  errorMessage = '';
  usersExist = true;
  showFirstAccessModal = false;
  firstAccessUsername = '';
  firstAccessPassword = '';
  firstAccessPasswordConfirm = '';
  isRegisterMode = false;

  constructor(
    private authService: Auth,
    private router: Router
  ) {
    // Se já está autenticado, redireciona para parking
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/parking']);
    }

    // Verificar se existem usuários no sistema
    this.checkUsersExist();
  }

  checkUsersExist(): void {
    this.authService.checkUsersExist().subscribe({
      next: (exists) => {
        this.usersExist = exists;
      },
      error: () => {
        this.usersExist = true; // Em caso de erro, assume que existem usuários
      }
    });
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

  openFirstAccessModal(): void {
    this.showFirstAccessModal = true;
    this.firstAccessUsername = '';
    this.firstAccessPassword = '';
    this.firstAccessPasswordConfirm = '';
    this.errorMessage = '';
  }

  closeFirstAccessModal(): void {
    this.showFirstAccessModal = false;
  }

  onFirstAccessSubmit(): void {
    this.errorMessage = '';

    if (!this.firstAccessUsername || !this.firstAccessPassword || !this.firstAccessPasswordConfirm) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    if (this.firstAccessPassword.length < 6) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (this.firstAccessPassword !== this.firstAccessPasswordConfirm) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.authService.register(this.firstAccessUsername, this.firstAccessPassword).subscribe({
      next: (success) => {
        if (success) {
          this.closeFirstAccessModal();
          this.router.navigate(['/parking']);
        } else {
          this.errorMessage = 'Erro ao criar usuário. Tente novamente.';
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao criar usuário. Tente novamente.';
      }
    });
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.usuario = '';
    this.senha = '';
    this.senhaConfirm = '';
  }

  onRegisterSubmit(): void {
    this.errorMessage = '';

    if (!this.usuario || !this.senha || !this.senhaConfirm) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    if (this.senha.length < 6) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (this.senha !== this.senhaConfirm) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.authService.register(this.usuario, this.senha).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/parking']);
        } else {
          this.errorMessage = 'Erro ao criar usuário. Tente novamente.';
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao criar usuário. Tente novamente.';
      }
    });
  }
}

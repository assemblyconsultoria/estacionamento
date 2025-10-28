import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

interface UserData {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-admin-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-modal.html',
  styleUrl: './admin-modal.scss',
})
export class AdminModal implements OnInit {
  @Output() close = new EventEmitter<void>();

  users: UserData[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Edit user
  editingUserId: string | null = null;
  editUsername = '';

  // Reset password
  resettingUserId: string | null = null;
  newPassword = '';
  newPasswordConfirm = '';

  constructor(private authService: Auth) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao carregar usuários';
        this.loading = false;
      }
    });
  }

  startEdit(user: UserData): void {
    this.editingUserId = user.id;
    this.editUsername = user.username;
    this.cancelResetPassword();
    this.clearMessages();
  }

  cancelEdit(): void {
    this.editingUserId = null;
    this.editUsername = '';
  }

  saveEdit(userId: string): void {
    if (!this.editUsername.trim()) {
      this.errorMessage = 'Nome de usuário não pode estar vazio';
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.authService.updateUser(userId, this.editUsername).subscribe({
      next: () => {
        this.successMessage = 'Usuário atualizado com sucesso';
        this.cancelEdit();
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao atualizar usuário';
        this.loading = false;
      }
    });
  }

  startResetPassword(user: UserData): void {
    this.resettingUserId = user.id;
    this.newPassword = '';
    this.newPasswordConfirm = '';
    this.cancelEdit();
    this.clearMessages();
  }

  cancelResetPassword(): void {
    this.resettingUserId = null;
    this.newPassword = '';
    this.newPasswordConfirm = '';
  }

  resetPassword(userId: string): void {
    if (!this.newPassword || !this.newPasswordConfirm) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
      return;
    }

    if (this.newPassword !== this.newPasswordConfirm) {
      this.errorMessage = 'As senhas não coincidem';
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.authService.resetUserPassword(userId, this.newPassword).subscribe({
      next: () => {
        this.successMessage = 'Senha resetada com sucesso';
        this.cancelResetPassword();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao resetar senha';
        this.loading = false;
      }
    });
  }

  deleteUser(user: UserData): void {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.username}"?`)) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.authService.deleteUser(user.id).subscribe({
      next: () => {
        this.successMessage = 'Usuário excluído com sucesso';
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao excluir usuário';
        this.loading = false;
      }
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  onClose(): void {
    this.close.emit();
  }
}

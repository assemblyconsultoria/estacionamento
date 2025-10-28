import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    isAdmin?: boolean;
  };
  token: string;
}

interface UserResponse {
  success: boolean;
  user: {
    id: string;
    username: string;
    isAdmin?: boolean;
    created_at: string;
  };
}

interface CheckUsersResponse {
  success: boolean;
  usersExist: boolean;
  count: number;
}

interface UsersListResponse {
  success: boolean;
  users: Array<{
    id: string;
    username: string;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  login(usuario: string, senha: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      username: usuario,
      password: senha
    }).pipe(
      map(response => {
        if (response.success && response.token) {
          // Store token and username
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('usuario', response.user.username);
          localStorage.setItem('userId', response.user.id);
          localStorage.setItem('isAdmin', String(response.user.isAdmin || false));
          this.isAuthenticatedSubject.next(true);
          return true;
        }
        return false;
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    const token = localStorage.getItem('authToken');

    // Call logout endpoint (optional, since JWT is stateless)
    if (token) {
      this.http.post(`${this.apiUrl}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).subscribe({
        next: () => console.log('Logout successful'),
        error: (error) => console.error('Logout error:', error)
      });
    }

    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getUsuario(): string | null {
    return localStorage.getItem('usuario');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  // Get current user info from API
  getCurrentUser(): Observable<UserResponse> {
    const token = this.getToken();
    return this.http.get<UserResponse>(`${this.apiUrl}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Register new user
  register(usuario: string, senha: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, {
      username: usuario,
      password: senha
    }).pipe(
      map(response => {
        if (response.success && response.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('usuario', response.user.username);
          localStorage.setItem('userId', response.user.id);
          localStorage.setItem('isAdmin', String(response.user.isAdmin || false));
          this.isAuthenticatedSubject.next(true);
          return true;
        }
        return false;
      }),
      catchError(this.handleError)
    );
  }

  // Check if users exist (for first-time setup)
  checkUsersExist(): Observable<boolean> {
    return this.http.get<CheckUsersResponse>(`${this.apiUrl}/auth/check-users`).pipe(
      map(response => response.usersExist),
      catchError(() => {
        return throwError(() => new Error('Erro ao verificar existência de usuários'));
      })
    );
  }

  // Check if current user is admin
  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  // Get all users (admin only)
  getAllUsers(): Observable<UsersListResponse> {
    const token = this.getToken();
    return this.http.get<UsersListResponse>(`${this.apiUrl}/auth/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Update user (admin only)
  updateUser(id: string, username: string): Observable<any> {
    const token = this.getToken();
    return this.http.put(`${this.apiUrl}/auth/users/${id}`,
      { username },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete user (admin only)
  deleteUser(id: string): Observable<any> {
    const token = this.getToken();
    return this.http.delete(`${this.apiUrl}/auth/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Reset user password (admin only)
  resetUserPassword(id: string, newPassword: string): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/auth/users/${id}/reset-password`,
      { newPassword },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.error || error.error?.message || `Erro ${error.status}: ${error.message}`;
    }

    console.error('Auth service error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

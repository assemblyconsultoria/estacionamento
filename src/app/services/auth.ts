import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {}

  login(usuario: string, senha: string): boolean {
    // Em produção, isso seria uma chamada à API
    // Por enquanto, validação simples para demonstração
    if (usuario && senha && senha.length >= 6) {
      const token = btoa(`${usuario}:${Date.now()}`);
      localStorage.setItem('authToken', token);
      localStorage.setItem('usuario', usuario);
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
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
}

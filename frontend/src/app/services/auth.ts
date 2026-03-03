import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    };
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  registro(datos: { nombre: string, apellidos: string, usuario: string, email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuario`, datos, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: this.getHeaders()
    });
  }

  actualizarUsuario(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuario`, datos, {
      headers: this.getHeaders()
    });
  }

  eliminarCuenta(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuario`, {
      headers: this.getHeaders()
    });
  }

  saveToken(token: string) {
    if (this.isBrowser()) localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem('token') : null;
  }

  removeToken() {
    if (this.isBrowser()) localStorage.removeItem('token');
  }

  saveUsuario(usuario: any) {
    if (this.isBrowser()) localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  getUsuario(): any {
    if (!this.isBrowser()) return null;
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  removeUsuario() {
    if (this.isBrowser()) localStorage.removeItem('usuario');
  }
}
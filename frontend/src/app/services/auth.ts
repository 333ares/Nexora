import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://localhost:8000/api';
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  isLoggedIn$ = this.loggedIn.asObservable(); // Observable público

  constructor(private http: HttpClient) { }

  // --- HEADERS ---
  private getHeaders() {
    const token = this.getToken();

    // Construimos los headers y agregamos Authorization solo si hay token
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // --- AUTENTICACIÓN ---
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  registro(datos: { nombre: string, apellidos: string, usuario: string, email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, datos, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers: this.getHeaders() });
  }

  // --- USUARIO ---
  actualizarUsuario(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuario`, datos, { headers: this.getHeaders() });
  }

  eliminarCuenta(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuario`, { headers: this.getHeaders() });
  }

  // --- ESTADÍSTICAS ---
  getBalanceTotal(): Observable<any> {
    return this.http.get(`${this.apiUrl}/balanceTotal`, { headers: this.getHeaders() });
  }

  getIngresoMensual(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ingresoMensual`, { headers: this.getHeaders() });
  }

  getGastoMensual(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gastoMensual`, { headers: this.getHeaders() });
  }

  getHistorialMovimientos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/movimientos`, { headers: this.getHeaders() });
  }

  // --- MOVIMIENTOS ---
  apuntarMovimiento(datos: { tipo: string, cantidad: number, categoria: string, descripcion?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/movimiento`, datos, {
      headers: this.getHeaders()
    });
  }

  // --- LOCAL STORAGE ---
  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.loggedIn.next(true); // avisar que está logueado
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
    this.loggedIn.next(false); // avisar que ha cerrado sesión
  }

  saveUsuario(usuario: any) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  getUsuario(): any {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  removeUsuario() {
    localStorage.removeItem('usuario');
  }
}
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

  getIngresoMensualPorCategoria(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ingresoMensualCat`, { headers: this.getHeaders() });
  }

  getGastoMensualPorCategoria(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gastoMensualCat`, { headers: this.getHeaders() });
  }

  // --- MOVIMIENTOS ---
  apuntarMovimiento(datos: { tipo: string, cantidad: number, categoria: string, descripcion?: string, fecha?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/movimiento`, datos, {
      headers: this.getHeaders()
    });
  }

  actualizarMovimiento(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/movimiento`, datos, { headers: this.getHeaders() });
  }

  borrarMovimimento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/movimiento`, {
      headers: this.getHeaders(),
      body: { id }
    });
  }

  // --- RETOS ---
  getRetos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/retos`, { headers: this.getHeaders() });
  }

  crearReto(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reto`, datos, { headers: this.getHeaders() });
  }

  actualizarReto(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reto`, datos, { headers: this.getHeaders() });
  }

  borrarReto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reto`, {
      headers: this.getHeaders(),
      body: { id }
    });
  }

  aportarAReto(id: number, cantidad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reto/aportar`, { id, cantidad }, { headers: this.getHeaders() });
  }

  retirarDeReto(id: number, cantidad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reto/retirar`, { id, cantidad }, { headers: this.getHeaders() });
  }

  // --- ADMIN ---
  listarUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/usuarios`, { headers: this.getHeaders() });
  }

  bloquearUsuario(user_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/bloquear`, { user_id }, { headers: this.getHeaders() });
  }

  desbloquearUsuario(user_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/desbloquear`, { user_id }, { headers: this.getHeaders() });
  }

  eliminarUsuario(user_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/usuario`, {
      headers: this.getHeaders(),
      body: { user_id }
    });
  }

  // --- FORO ---
  listarForos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/foros`, { headers: this.getHeaders() });
  }

  listarForosUsuario(): Observable<any> {
    return this.http.get(`${this.apiUrl}/foros/usuario`, { headers: this.getHeaders() });
  }

  visitarForo(IDforo: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/foros/ver`, { IDforo }, { headers: this.getHeaders() });
  }

  crearForo(datos: { titulo: string, contenido: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/foro`, datos, { headers: this.getHeaders() });
  }

  actualizarForo(datos: { IDforo: number, titulo?: string, contenido?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/foros`, datos, { headers: this.getHeaders() });
  }

  borrarForo(IDforo: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/foro`, {
      headers: this.getHeaders(),
      body: { IDforo }
    });
  }

  // --- RESPUESTAS ---
  responderForo(datos: { IDforo: number, respuesta: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/respuesta`, datos, { headers: this.getHeaders() });
  }

  modificarRespuesta(datos: { IDrespuesta: number, respuesta: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/respuesta`, datos, { headers: this.getHeaders() });
  }

  borrarRespuesta(IDrespuesta: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/respuesta`, {
      headers: this.getHeaders(),
      body: { IDrespuesta }
    });
  }

  toggleVotoRespuesta(IDrespuesta: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/respuesta/votar`, { IDrespuesta }, { headers: this.getHeaders() });
  }

  // --- MEMBRESIA DEL FORO ---
  unirseAForo(IDforo: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/miembro`, { IDforo }, { headers: this.getHeaders() });
  }

  salirDeForo(IDmembresia: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/miembro`, {
      headers: this.getHeaders(),
      body: { IDmembresia }
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
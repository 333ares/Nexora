import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://localhost:8000/api';
  // BehaviorSubject emite el estado actual inmediatamente a cualquier suscriptor nuevo,
  // lo que permite que la barra de navegación sepa si el usuario está logueado al arrancar
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  isLoggedIn$ = this.loggedIn.asObservable(); // Observable público que otros componentes pueden suscribir

  constructor(private http: HttpClient) { }

  // Construye los headers HTTP incluyendo el token Bearer solo si existe en localStorage
  private getHeaders() {
    const token = this.getToken();
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // Autenticación
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

  // Usuario
  actualizarUsuario(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuario`, datos, { headers: this.getHeaders() });
  }

  eliminarCuenta(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuario`, { headers: this.getHeaders() });
  }

  // Estadísticas financieras del usuario
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

  // Movimientos: crear, editar y borrar
  apuntarMovimiento(datos: { tipo: string, cantidad: number, categoria: string, descripcion?: string, fecha?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/movimiento`, datos, {
      headers: this.getHeaders()
    });
  }

  actualizarMovimiento(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/movimiento`, datos, { headers: this.getHeaders() });
  }

  // El body del DELETE lleva el id porque la API REST de Laravel lo espera en el cuerpo, no en la URL
  borrarMovimimento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/movimiento`, {
      headers: this.getHeaders(),
      body: { id }
    });
  }

  // Retos de ahorro
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

  // Administración (solo accesible con id=1)
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

  // Foro
  listarForos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/foros`, { headers: this.getHeaders() });
  }

  listarForosUsuario(): Observable<any> {
    return this.http.get(`${this.apiUrl}/foros/usuario`, { headers: this.getHeaders() });
  }

  // Visitar incrementa el contador de visitas en el backend
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

  // Respuestas del foro
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

  // Un voto por usuario por respuesta; si ya votó, lo elimina (toggle)
  toggleVotoRespuesta(IDrespuesta: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/respuesta/votar`, { IDrespuesta }, { headers: this.getHeaders() });
  }

  // Membresía del foro
  getMisForos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/miembros/mis-foros`, { headers: this.getHeaders() });
  }

  unirseAForo(IDforo: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/miembro`, { IDforo }, { headers: this.getHeaders() });
  }

  // El DELETE necesita el IDmembresia (no el IDforo) porque la tabla miembros tiene su propia PK
  salirDeForo(IDmembresia: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/miembro`, {
      headers: this.getHeaders(),
      body: { IDmembresia }
    });
  }

  // Gestión del token y datos del usuario en localStorage
  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.loggedIn.next(true); // Notifica a todos los suscriptores de isLoggedIn$ que hay sesión activa
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
    this.loggedIn.next(false); // Notifica a los suscriptores que la sesión ha terminado
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

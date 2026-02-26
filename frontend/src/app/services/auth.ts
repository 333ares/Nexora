import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  registro(datos: { nombre: string, apellidos: string, usuario: string, email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuario`, datos, {
      headers: { 'Content-Type': 'application/json' }
    });
  }


  logout(): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RetosService {
  private apiUrl = 'http://localhost:8000/api/retos';

  constructor(private http: HttpClient) { }

  getRetos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  crearReto(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reto`, datos);
  }
  
}
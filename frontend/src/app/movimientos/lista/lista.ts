import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista.html',
  styleUrl: './lista.css'
})
export class Lista implements OnInit {
  movimientos: any[] = [];
  movimientosFiltrados: any[] = [];
  filtroActivo: string = 'todos';

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarHistorialMovimientos();
  }

  cargarHistorialMovimientos(): void {
    this.authService.getHistorialMovimientos().subscribe({
      next: (response) => {
        this.movimientos = response.movimientos;
        this.movimientosFiltrados = this.movimientos;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 400) {
          this.movimientos = [];
          this.movimientosFiltrados = [];
        } else {
          console.error('Error al obtener el historial:', err);
        }
      }
    });
  }

  filtrar(tipo: string): void {
    this.filtroActivo = tipo;
    if (tipo === 'todos') {
      this.movimientosFiltrados = this.movimientos;
    } else {
      this.movimientosFiltrados = this.movimientos.filter(m => m.tipo === tipo);
    }
    this.cdr.detectChanges();
  }
}
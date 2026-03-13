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

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarHistorialMovimientos();
  }

  cargarHistorialMovimientos(): void {
    this.authService.getHistorialMovimientos().subscribe({
      next: (response) => {
        this.movimientos = response.movimientos;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 400) {
          this.movimientos = [];
        } else {
          console.error('Error al obtener el historial:', err);
        }
      }
    });
  }
}
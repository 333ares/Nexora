import { Component, OnInit, ChangeDetectorRef, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './resumen.html',
  styleUrl: './resumen.css'
})

export class Resumen implements OnInit {
  balanceTotal: number = 0.00;
  ingresoMensual: number = 0.00;
  gastoMensual: number = 0.00;
  movimientos: any[] = [];

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarBalanceTotal();
    this.cargarIngresoMensual();
    this.cargarGastoMensual();
    this.cargarHistorialMovimientos();
  }

  cargarBalanceTotal(): void {
    this.authService.getBalanceTotal().subscribe({
      next: (response) => {
        console.log('Respuesta:', response);
        this.balanceTotal = parseFloat(response.balance_total);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener el balance total:', err);
      }
    });
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
  
  cargarIngresoMensual(): void {
    this.authService.getIngresoMensual().subscribe({
      next: (response) => {
        console.log('Respuesta:', response);
        this.ingresoMensual = parseFloat(response.data.ingreso_mes_actual);
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404) {
          this.ingresoMensual = 0;
          this.cdr.detectChanges();
        } else {
          console.error('Error al obtener el ingreso mensual:', err);
        }
      }
    });
  }

  cargarGastoMensual(): void {
    this.authService.getGastoMensual().subscribe({
      next: (response) => {
        console.log('Respuesta:', response);
        this.gastoMensual = parseFloat(response.data.gasto_mes_actual);
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404) {
          this.gastoMensual = 0;
          this.cdr.detectChanges();
        } else {
          console.error('Error al obtener el gasto mensual:', err);
        }
      }
    });
  }
}
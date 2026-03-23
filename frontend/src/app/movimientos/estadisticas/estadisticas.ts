import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css'
})
export class Estadisticas implements OnInit {
  balanceTotal: number = 0.00;
  ingresoMensual: number = 0.00;
  gastoMensual: number = 0.00;
  movimientos: any[] = [];

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarBalanceTotal();
    this.cargarIngresoMensual();
    this.cargarGastoMensual();
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
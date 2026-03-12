import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen.html',
  styleUrl: './resumen.css'
})

export class Resumen implements OnInit {
  balanceTotal: number = 0;

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarBalanceTotal();
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
}
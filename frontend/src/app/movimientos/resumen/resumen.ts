import { Component, OnInit } from '@angular/core';
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

  constructor(private authService: Auth) { }

  ngOnInit(): void {
    this.cargarBalanceTotal();
  }

  cargarBalanceTotal(): void {
    this.authService.getBalanceTotal().subscribe({
      next: (response) => {
        this.balanceTotal = response.balance_total;
      },
      error: (err) => {
        console.error('Error al obtener el balance total:', err);
      }
    });
  }
}
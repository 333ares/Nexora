import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';

Chart.register(...registerables);

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface MesStat {
  año: number;
  mes: number;
  total: number;
}

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './resumen.html',
  styleUrl: './resumen.css'
})
export class Resumen implements OnInit, OnDestroy {

  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;

  balanceTotal = 0;
  ingresoMensual = 0;
  gastoMensual = 0;
  movimientos: any[] = [];

  private gastosMensuales: MesStat[] = [];
  private ingresosMensuales: MesStat[] = [];

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    forkJoin({
      balance: this.authService.getBalanceTotal(),
      gastos: this.authService.getGastoMensual(),
      ingresos: this.authService.getIngresoMensual(),
      historial: this.authService.getHistorialMovimientos()
    }).subscribe({
      next: ({ balance, gastos, ingresos, historial }) => {
        this.balanceTotal = parseFloat(balance.balance_total);
        this.gastoMensual = parseFloat(gastos.data.gasto_mes_actual);
        this.ingresoMensual = parseFloat(ingresos.data.ingreso_mes_actual);

        this.gastosMensuales = [...gastos.data.gastos_mensuales].reverse();
        this.ingresosMensuales = [...ingresos.data.ingresos_mensuales].reverse();

        const todos = historial.movimientos ?? [];
        this.movimientos = todos
          .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 4);

        this.cdr.detectChanges();
        setTimeout(() => this.renderBarChart(), 0);
      },
      error: (err) => console.error('Error cargando resumen:', err)
    });
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
  }

  private renderBarChart(): void {
    if (!this.barChartRef?.nativeElement) return;
    this.chartInstance?.destroy();

    const labels = this.ingresosMensuales.map(i => `${MESES[i.mes - 1]} ${i.año}`);
    const dataIngresos = this.ingresosMensuales.map(i => i.total);
    const dataGastos = this.ingresosMensuales.map(i =>
      this.gastosMensuales.find(g => g.año === i.año && g.mes === i.mes)?.total ?? 0
    );

    this.chartInstance = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Ingresos', data: dataIngresos, backgroundColor: '#59b881', borderRadius: 6, barPercentage: 0.4 },
          { label: 'Gastos', data: dataGastos, backgroundColor: '#e27d7d', borderRadius: 6, barPercentage: 0.4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Lato' }, color: '#999' } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, color: '#999', callback: v => v + ' €' } }
        }
      }
    });
  }
}
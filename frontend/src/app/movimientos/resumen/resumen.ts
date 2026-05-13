import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { forkJoin, Subscription } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TranslateCategoryPipe } from '../../pipes/translate-category';

Chart.register(...registerables);

interface MesStat {
  año: number;
  mes: number;
  total: number;
}

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, TranslateCategoryPipe],
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
  cargandoMovimientos = true;
  retoActual: any = null;
  retoSeleccionadoId: number | null = null;
  listaRetos: any[] = [];

  private gastosMensuales: MesStat[] = [];
  private ingresosMensuales: MesStat[] = [];
  private langSub!: Subscription;

  constructor(
    private authService: Auth, 
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.renderBarChart();
    });
    forkJoin({
      balance: this.authService.getBalanceTotal(),
      gastos: this.authService.getGastoMensual(),
      ingresos: this.authService.getIngresoMensual(),
      historial: this.authService.getHistorialMovimientos(),
      retos: this.authService.getRetos()
    }).subscribe({
      next: ({ balance, gastos, ingresos, historial, retos }) => {
        this.balanceTotal = parseFloat(balance.balance_total);
        this.gastoMensual = parseFloat(gastos.data.gasto_mes_actual);
        this.ingresoMensual = parseFloat(ingresos.data.ingreso_mes_actual);
        const guardado = localStorage.getItem('retoSeleccionadoId');
        this.retoSeleccionadoId = guardado ? Number(guardado) : null;
        this.gastosMensuales = [...gastos.data.gastos_mensuales].reverse();
        this.ingresosMensuales = [...ingresos.data.ingresos_mensuales].reverse();

        const todos = historial.movimientos ?? [];
        this.movimientos = todos
          .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 4);

        const listaRetos = retos.retos ?? retos ?? [];
        this.listaRetos = listaRetos;

        const activos = listaRetos.filter((r: any) => r.activo && !r.cumplido);

        if (activos.length === 0) {
          this.retoActual = null;
        } else {
          // si hay selección previa
          const seleccionado = activos.find((r: any) => r.IDreto === this.retoSeleccionadoId);
          this.retoActual = seleccionado ?? activos[0];
        }

        this.cargandoMovimientos = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderBarChart(), 0);
      },
      error: (err) => {
        console.error('Error cargando resumen:', err);
        this.cargandoMovimientos = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.langSub) this.langSub.unsubscribe();
    this.chartInstance?.destroy();
  }

  private renderBarChart(): void {
    if (!this.barChartRef?.nativeElement) return;
    this.chartInstance?.destroy();

    const lang = this.translate.currentLang || 'es';
    const formatter = new Intl.DateTimeFormat(lang, { month: 'short' });

    const labels = this.ingresosMensuales.map(i => {
      const monthName = formatter.format(new Date(i.año, i.mes - 1));
      return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${i.año}`;
    });
    
    const dataIngresos = this.ingresosMensuales.map(i => i.total);
    const dataGastos = this.ingresosMensuales.map(i =>
      this.gastosMensuales.find(g => g.año === i.año && g.mes === i.mes)?.total ?? 0
    );

    const lblIngresos = this.translate.instant('RESUMEN.INGRESOS');
    const lblGastos = this.translate.instant('RESUMEN.GASTOS');

    this.chartInstance = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: lblIngresos, data: dataIngresos, backgroundColor: '#59b881', borderRadius: 6, barPercentage: 0.4 },
          { label: lblGastos, data: dataGastos, backgroundColor: '#e27d7d', borderRadius: 6, barPercentage: 0.4 }
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

  progreso(reto: any): number {
    if (!reto?.cantidad || reto.cantidad <= 0) return 0;
    return Math.min(100, Math.round((reto.cantidad_actual / reto.cantidad) * 100));
  }

  dropdownOpen = false;

  seleccionarReto(id: number) {
    this.dropdownOpen = false;
    this.retoSeleccionadoId = id;
    localStorage.setItem('retoSeleccionadoId', String(id));

    const activos = this.listaRetos.filter(r => r.activo && !r.cumplido);
    this.retoActual = activos.find(r => r.IDreto === id) ?? null;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
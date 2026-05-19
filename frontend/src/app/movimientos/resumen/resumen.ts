import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { forkJoin, Subscription } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TranslateCategoryPipe } from '../../pipes/translate-category';

Chart.register(...registerables);

// Representa el total de movimientos de un mes concreto
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

  // Referencia al canvas del DOM que usa Chart.js para dibujar el gráfico
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  // Guardamos la instancia del gráfico para poder destruirla antes de recrearla y evitar duplicados
  private chartInstance: Chart | null = null;

  balanceTotal = 0;
  ingresoMensual = 0;
  gastoMensual = 0;
  movimientos: any[] = [];              // Últimos 4 movimientos para la mini-tabla del resumen
  cargandoMovimientos = true;
  retoActual: any = null;               // Reto que se muestra en la card de la derecha
  retoSeleccionadoId: number | null = null; // ID del reto elegido, se persiste en localStorage
  listaRetos: any[] = [];               // Todos los retos del usuario (activos e inactivos)

  // Arrays internos con el historial por mes; se invierten para mostrar orden cronológico
  private gastosMensuales: MesStat[] = [];
  private ingresosMensuales: MesStat[] = [];
  // Suscripción al cambio de idioma para re-renderizar el gráfico con los textos correctos
  private langSub!: Subscription;

  constructor(
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    // Cuando el idioma cambia se redibuja el gráfico para actualizar las etiquetas de meses
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.renderBarChart();
    });

    // forkJoin lanza todas las llamadas HTTP en paralelo y espera a que todas terminen antes de continuar
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

        // El backend devuelve los meses de más reciente a más antiguo; reverse() los pone en orden cronológico
        this.gastosMensuales = [...gastos.data.gastos_mensuales].reverse();
        this.ingresosMensuales = [...ingresos.data.ingresos_mensuales].reverse();

        // localStorage guarda el reto elegido la última vez para recordarlo entre sesiones
        const guardado = localStorage.getItem('retoSeleccionadoId');
        this.retoSeleccionadoId = guardado ? Number(guardado) : null;

        // Solo mostramos los 4 movimientos más recientes en la mini-tabla del resumen
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
          // Si el usuario ya eligió un reto antes y sigue activo, lo mostramos; si no, el primero
          const seleccionado = activos.find((r: any) => r.IDreto === this.retoSeleccionadoId);
          this.retoActual = seleccionado ?? activos[0];
        }

        this.cargandoMovimientos = false;
        this.cdr.detectChanges();
        // setTimeout garantiza que el canvas ya está insertado en el DOM antes de dibujar el gráfico
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
    // Destruir el gráfico al salir de la pantalla para liberar memoria y evitar fugas
    this.chartInstance?.destroy();
  }

  private renderBarChart(): void {
    if (!this.barChartRef?.nativeElement) return;
    // Destruir el gráfico anterior para evitar duplicados en el canvas
    this.chartInstance?.destroy();

    // Obtiene el idioma actual para localizar nombres de meses
    const lang = this.translate.currentLang || 'es';
    const formatter = new Intl.DateTimeFormat(lang, { month: 'short' });

    // Formatea etiquetas como "Ene 2026", "Feb 2026", etc.
    const labels = this.ingresosMensuales.map(i => {
      const monthName = formatter.format(new Date(i.año, i.mes - 1));
      return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${i.año}`;
    });

    // Extrae totales de ingresos por mes en orden cronológico
    const dataIngresos = this.ingresosMensuales.map(i => i.total);
    
    // Sincroniza gastos con ingresos encontrando coincidencias mes/año
    // Usa 0 como fallback para meses sin datos de gastos
    const dataGastos = this.ingresosMensuales.map(i =>
      this.gastosMensuales.find(g => g.año === i.año && g.mes === i.mes)?.total ?? 0
    );

    // Traduce etiquetas de leyenda para ingresos y gastos
    const lblIngresos = this.translate.instant('RESUMEN.INGRESOS');
    const lblGastos = this.translate.instant('RESUMEN.GASTOS');

    // Crea el gráfico de barras con Chart.js usando los datos y etiquetas formateados
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

  // Calcula el porcentaje de avance del reto
  // Limitado a máximo 100% aunque se supere la cantidad objetivo
  progreso(reto: any): number {
    if (!reto?.cantidad || reto.cantidad <= 0) return 0;
    const porcentaje = (reto.cantidad_actual / reto.cantidad) * 100;
    return Math.min(100, Math.round(porcentaje));
  }

  dropdownOpen = false;

  // Cambia el reto actual y persiste la selección en localStorage
  // Esto permite recordar la preferencia del usuario entre sesiones
  seleccionarReto(id: number) {
    this.dropdownOpen = false;
    this.retoSeleccionadoId = id;
    localStorage.setItem('retoSeleccionadoId', String(id));

    // Busca el reto en la lista de activos no cumplidos
    const activos = this.listaRetos.filter(r => r.activo && !r.cumplido);
    this.retoActual = activos.find(r => r.IDreto === id) ?? null;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}

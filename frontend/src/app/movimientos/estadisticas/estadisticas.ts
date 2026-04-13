import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js'
import { forkJoin } from 'rxjs';
import { Auth } from '../../services/auth';

// Registro de todos los componentes de Chart.js
Chart.register(...registerables);

// Interfaz para estadísticas por categoría
export interface CategoriaStat {
  categoria: string; // Nombre de la categoría
  total: number; // Total de dinero en esa categoría
  cantidad_movimientos: number; // Número de movimientos
}

// Interfaz para estadísticas por mes
export interface MesStat {
  año: number;
  mes: number;
  total: number;
  cantidad_movimientos: number;
}

// Array de nombres abreviados de meses
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Component({
  selector: 'app-estadisticas', // Nombre del componente
  standalone: true, // Componente standalone (no necesita módulo)
  imports: [CommonModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css'
})
export class Estadisticas implements OnInit, OnDestroy {

  // Referencias a los canvas del DOM para los gráficos
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutGasto') donutGastoRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutIngreso') donutIngresoRef!: ElementRef<HTMLCanvasElement>;

  // Array para almacenar las instancias de gráficos
  private charts: (Chart | null)[] = [null, null, null];

  // Variables de estado
  balanceTotal = 0;
  ingresoMensual = 0;
  gastoMensual = 0;
  gastosPorCategoria: CategoriaStat[] = [];
  ingresosPorCategoria: CategoriaStat[] = [];
  cargando = true; // Indicador de carga

  // Datos mensuales internos
  private gastosMensuales: MesStat[] = [];
  private ingresosMensuales: MesStat[] = [];

  // Colores para gráficos
  readonly gastoColores = ['#e74c3c', '#3498db', '#f59e42', '#9b59b6'];
  readonly ingresoColores = ['#27ae60', '#1abc9c', '#2ecc71', '#16a085', '#82ca9d'];

  // Inyección de dependencias
  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  // Getter para calcular la tasa de ahorro (%)
  get tasaAhorro(): number {
    return this.ingresoMensual <= 0
      ? 0
      : Math.round(((this.ingresoMensual - this.gastoMensual) / this.ingresoMensual) * 100);
  }

  // Getter para total de gastos
  get totalGastos(): number {
    return this.gastosPorCategoria.reduce((acc, s) => acc + s.total, 0);
  }

  // Getter para total de ingresos
  get totalIngresos(): number {
    return this.ingresosPorCategoria.reduce((acc, s) => acc + s.total, 0);
  }

  // Hook de inicialización del componente
  ngOnInit(): void {
    // Ejecuta todas las llamadas HTTP en paralelo
    forkJoin({
      balance: this.authService.getBalanceTotal(),
      gastos: this.authService.getGastoMensual(),
      ingresos: this.authService.getIngresoMensual(),
      gastosCat: this.authService.getGastoMensualPorCategoria(),
      ingresosCat: this.authService.getIngresoMensualPorCategoria()
    }).subscribe({
      next: ({ balance, gastos, ingresos, gastosCat, ingresosCat }) => {
        // Parseo de datos recibidos
        this.balanceTotal = parseFloat(balance.balance_total);
        this.gastoMensual = parseFloat(gastos.data.gasto_mes_actual);
        this.ingresoMensual = parseFloat(ingresos.data.ingreso_mes_actual);

        // Invertir arrays para mostrar del más antiguo al más reciente
        this.gastosMensuales = [...gastos.data.gastos_mensuales].reverse();
        this.ingresosMensuales = [...ingresos.data.ingresos_mensuales].reverse();

        // Filtrar categorías con valores > 0
        this.gastosPorCategoria = gastosCat.stats.filter((s: CategoriaStat) => s.total > 0);
        this.ingresosPorCategoria = ingresosCat.stats.filter((s: CategoriaStat) => s.total > 0);

        this.cargando = false;

        // Forzar detección de cambios en Angular
        this.cdr.detectChanges();

        // Espera a que el DOM esté listo antes de renderizar gráficos
        setTimeout(() => this.renderizarGraficos(), 0);
      },
      error: (err) => {
        // Manejo de errores
        console.error('Error cargando estadísticas:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Hook al destruir el componente
  ngOnDestroy(): void {
    // Destruye todos los gráficos para evitar fugas de memoria
    this.charts.forEach(c => c?.destroy());
  }

  // Método que renderiza todos los gráficos
  private renderizarGraficos(): void {
    this.renderBarChart();
    this.renderDonut(this.donutGastoRef, this.gastosPorCategoria, this.gastoColores, 0);
    this.renderDonut(this.donutIngresoRef, this.ingresosPorCategoria, this.ingresoColores, 1);
  }

  // Renderiza gráfico de barras (ingresos vs gastos por mes)
  private renderBarChart(): void {
    if (!this.barChartRef?.nativeElement) return;

    // Destruye gráfico anterior si existe
    this.charts[2]?.destroy();

    // Genera etiquetas (mes + año)
    const labels = this.ingresosMensuales.map(i => `${MESES[i.mes - 1]} ${i.año}`);

    // Datos de ingresos
    const dataIngresos = this.ingresosMensuales.map(i => i.total);

    // Datos de gastos (buscando coincidencia mes/año)
    const dataGastos = this.ingresosMensuales.map(i =>
      this.gastosMensuales.find(g => g.año === i.año && g.mes === i.mes)?.total ?? 0
    );

    // Creación del gráfico
    this.charts[2] = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Ingresos', data: dataIngresos, backgroundColor: '#27ae60', borderRadius: 6, barPercentage: 0.4 },
          { label: 'Gastos', data: dataGastos, backgroundColor: '#d94f4f', borderRadius: 6, barPercentage: 0.4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12, family: 'Lato' }, color: '#999' } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, color: '#999', callback: v => v + ' €' } }
        }
      }
    });
  }

  // Renderiza gráfico tipo donut (para categorías)
  private renderDonut(ref: ElementRef<HTMLCanvasElement>, stats: CategoriaStat[], colores: string[], idx: 0 | 1): void {
    if (!ref?.nativeElement || stats.length === 0) return;

    // Destruye gráfico anterior
    this.charts[idx]?.destroy();

    // Creación del gráfico donut
    this.charts[idx] = new Chart(ref.nativeElement, {
      type: 'doughnut',
      data: {
        labels: stats.map(s => s.categoria),
        datasets: [{
          data: stats.map(s => s.total),
          backgroundColor: colores.slice(0, stats.length),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: false,
        cutout: '68%', // Tamaño del agujero central
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              // Formato del tooltip
              label: ctx => {
                const val = typeof ctx.raw === 'number' ? ctx.raw : parseFloat(String(ctx.raw));
                return ` ${ctx.label}: ${isNaN(val) ? 0 : val.toFixed(2)} €`;
              }
            }
          }
        }
      }
    });
  }

  // Calcula porcentaje de un valor respecto a un total
  getPct(valor: number, total: number): number {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  }
}
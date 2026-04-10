import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css'
})
export class Estadisticas implements OnInit {

  balanceTotal = 0;
  ingresoMensual = 0;
  gastoMensual = 0;

  gastosMensuales: any[] = [];
  ingresosMensuales: any[] = [];

  gastosCategoria: any[] = [];
  ingresosCategoria: any[] = [];

  categoriaTopGasto = '';
  mesMasGasto = '';
  mesMasIngreso = '';

  constructor(private auth: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.cargarTodo();
  }

  cargarTodo() {
    this.auth.getBalanceTotal().subscribe(r => {
      this.balanceTotal = +r.balance_total;
    });

    this.auth.getGastoMensual().subscribe(r => {
      this.gastoMensual = +r.data.gasto_mes_actual;
      this.gastosMensuales = r.data.gastos_mensuales;
      this.obtenerMesMasGasto();
      this.crearGraficoComparativa();
    });

    this.auth.getIngresoMensual().subscribe(r => {
      this.ingresoMensual = +r.data.ingreso_mes_actual;
      this.ingresosMensuales = r.data.ingresos_mensuales;
      this.obtenerMesMasIngreso();
      this.crearGraficoComparativa();
    });

    this.auth.getGastoCategoria().subscribe(r => {
      this.gastosCategoria = r.stats;
      this.obtenerTopCategoria();
      this.crearDonut('gastoDonut', this.gastosCategoria, true);
    });

    this.auth.getIngresoCategoria().subscribe(r => {
      this.ingresosCategoria = r.stats;
      this.crearDonut('ingresoDonut', this.ingresosCategoria, false);
    });
  }

  // 📊 COMPARATIVA INGRESO VS GASTO
  crearGraficoComparativa() {
    if (!this.gastosMensuales.length || !this.ingresosMensuales.length) return;

    const labels = this.gastosMensuales.map(d => `${d.mes}/${d.año}`);

    const gastos = this.gastosMensuales.map(d => d.total);
    const ingresos = this.ingresosMensuales.map(d => {
      const match = this.gastosMensuales.find(g => g.mes === d.mes && g.año === d.año);
      return match ? d.total : 0;
    });

    new Chart('comparativaChart', {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Gastos', data: gastos },
          { label: 'Ingresos', data: ingresos }
        ]
      }
    });
  }

  // 🍩 DONUT
  crearDonut(id: string, data: any[], esGasto: boolean) {
    const labels = data.map(d => d.categoria);
    const valores = data.map(d => d.total);

    new Chart(id, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: esGasto
            ? ['#e74c3c', '#f39c12', '#e67e22', '#c0392b']
            : ['#27ae60', '#2ecc71', '#16a085', '#1abc9c']
        }]
      }
    });
  }

  // 🏆 TOP CATEGORIA
  obtenerTopCategoria() {
    if (this.gastosCategoria.length > 0) {
      this.categoriaTopGasto = this.gastosCategoria[0].categoria;
    }
  }

  // 📅 MES MÁS GASTO
  obtenerMesMasGasto() {
    const max = this.gastosMensuales.reduce((a, b) => a.total > b.total ? a : b);
    this.mesMasGasto = `${max.mes}/${max.año}`;
  }

  // 📅 MES MÁS INGRESO
  obtenerMesMasIngreso() {
    const max = this.ingresosMensuales.reduce((a, b) => a.total > b.total ? a : b);
    this.mesMasIngreso = `${max.mes}/${max.año}`;
  }

  get tasaAhorro(): number {
    if (this.ingresoMensual === 0) return 0;
    return ((this.ingresoMensual - this.gastoMensual) / this.ingresoMensual) * 100;
  }
}
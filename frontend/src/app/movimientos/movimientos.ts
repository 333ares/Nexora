import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Movimiento {
  id: number;
  nombre: string;
  categoria: string;
  tipo: 'gasto' | 'ingreso';
  importe: number;
  fecha: Date;
  icono: string;
}

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css'
})
export class Movimientos {

  // ── Menú ──────────────────────────────────────────────────────────
  menuActivo = signal('movimientos');
  setMenu(item: string) { this.menuActivo.set(item); }

  menuItems = [
    { id: 'academia',    label: 'Academia'    },
    { id: 'movimientos', label: 'Movimientos' },
    { id: 'perfil',      label: 'Perfil'       },
  ];

  // ── Calendario ────────────────────────────────────────────────────
  mesActual = signal(new Date());

  nombreMes = computed(() =>
    this.mesActual().toLocaleString('es-ES', { month: 'long' }).toUpperCase()
  );
  anio = computed(() => this.mesActual().getFullYear());

  diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  diasDelMes = computed(() => {
    const hoy    = new Date();
    const fecha  = this.mesActual();
    const año    = fecha.getFullYear();
    const mes    = fecha.getMonth();
    const total  = new Date(año, mes + 1, 0).getDate();
    const offset = (new Date(año, mes, 1).getDay() + 6) % 7;

    const dias: { numero: number; pasado: boolean; hoy: boolean; vacio: boolean }[] = [];

    for (let i = 0; i < offset; i++)
      dias.push({ numero: 0, pasado: false, hoy: false, vacio: true });

    for (let d = 1; d <= total; d++) {
      const esHoy    = d === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();
      const esPasado = new Date(año, mes, d) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      dias.push({ numero: d, pasado: esPasado && !esHoy, hoy: esHoy, vacio: false });
    }
    return dias;
  });

  mesAnterior() {
    const d = new Date(this.mesActual());
    d.setMonth(d.getMonth() - 1);
    this.mesActual.set(d);
  }

  mesSiguiente() {
    const d = new Date(this.mesActual());
    d.setMonth(d.getMonth() + 1);
    this.mesActual.set(d);
  }

  // ── Movimientos ───────────────────────────────────────────────────
  movimientos = signal<Movimiento[]>([
    { id: 1, nombre: 'Mercadona',     categoria: 'Alimentación',  tipo: 'gasto',   importe:  87.50,  fecha: new Date(), icono: '🛒' },
    { id: 2, nombre: 'Nómina Marzo',  categoria: 'Trabajo',       tipo: 'ingreso', importe: 1800.00, fecha: new Date(), icono: '💼' },
    { id: 3, nombre: 'Spotify',       categoria: 'Suscripciones', tipo: 'gasto',   importe:   9.99,  fecha: new Date(), icono: '🎵' },
    { id: 4, nombre: 'Alquiler',      categoria: 'Vivienda',      tipo: 'gasto',   importe: 650.00,  fecha: new Date(), icono: '🏠' },
    { id: 5, nombre: 'Freelance web', categoria: 'Trabajo',       tipo: 'ingreso', importe: 350.00,  fecha: new Date(), icono: '💻' },
    { id: 6, nombre: 'Gasolina',      categoria: 'Transporte',    tipo: 'gasto',   importe:  45.00,  fecha: new Date(), icono: '⛽' },
  ]);

  totalGasto   = computed(() => this.movimientos().filter(m => m.tipo === 'gasto').reduce((a, m) => a + m.importe, 0));
  totalIngreso = computed(() => this.movimientos().filter(m => m.tipo === 'ingreso').reduce((a, m) => a + m.importe, 0));
  saldoBanco   = computed(() => this.totalIngreso() - this.totalGasto());

  // ── Gráfica ───────────────────────────────────────────────────────
  mesesGrafica = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'];
  datosGrafica = [320, 580, 410, 760, 490, 870];

  get maxGrafica() { return Math.max(...this.datosGrafica); }
  alturaBarraPct(v: number) { return Math.round((v / this.maxGrafica) * 100); }
}
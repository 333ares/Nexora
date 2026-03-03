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
  estado: 'completado' | 'pendiente';
}

export interface Reto {
  id: number;
  nombre: string;
  icono: string;
  ahorroMensual: number;
  actual: number;
  meta: number;
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

  // ── Límite mensual ────────────────────────────────────────────────
  limiteMensual = 2000;

  // ── Retos de ahorro ───────────────────────────────────────────────
  retos = signal<Reto[]>([
    { id: 1, nombre: 'Comprar coche',  icono: '🚗', ahorroMensual: 100, actual: 5000,  meta: 25000 },
    { id: 2, nombre: 'Fondo de boda',  icono: '💍', ahorroMensual: 100, actual: 351,   meta: 25000 },
    { id: 3, nombre: 'PS5',            icono: '🎮', ahorroMensual: 100, actual: 180,   meta: 550   },
  ]);

  // ── Movimientos ───────────────────────────────────────────────────
  movimientos = signal<Movimiento[]>([
    { id: 1, nombre: 'Mercadona',      categoria: 'Supermercado',   tipo: 'gasto',   importe:  87.50,  fecha: new Date('2024-03-20T10:32:00'), icono: '🛒', estado: 'completado' },
    { id: 2, nombre: 'Nómina Marzo',   categoria: 'Trabajo',        tipo: 'ingreso', importe: 1800.00, fecha: new Date('2024-03-20T09:00:00'), icono: '💼', estado: 'completado' },
    { id: 3, nombre: 'Spotify',        categoria: 'Suscripciones',  tipo: 'gasto',   importe:   9.99,  fecha: new Date('2024-03-19T18:00:00'), icono: '🎵', estado: 'completado' },
    { id: 4, nombre: 'Alquiler',       categoria: 'Vivienda',       tipo: 'gasto',   importe: 650.00,  fecha: new Date('2024-03-01T08:00:00'), icono: '🏠', estado: 'completado' },
    { id: 5, nombre: 'Freelance web',  categoria: 'Trabajo',        tipo: 'ingreso', importe: 350.00,  fecha: new Date('2024-03-15T12:00:00'), icono: '💻', estado: 'completado' },
    { id: 6, nombre: 'Gasolina',       categoria: 'Transporte',     tipo: 'gasto',   importe:  45.00,  fecha: new Date('2024-03-18T17:30:00'), icono: '⛽', estado: 'pendiente'  },
  ]);

  totalGasto   = computed(() => this.movimientos().filter(m => m.tipo === 'gasto').reduce((a, m) => a + m.importe, 0));
  totalIngreso = computed(() => this.movimientos().filter(m => m.tipo === 'ingreso').reduce((a, m) => a + m.importe, 0));
  saldoBanco   = computed(() => this.totalIngreso() - this.totalGasto());
}
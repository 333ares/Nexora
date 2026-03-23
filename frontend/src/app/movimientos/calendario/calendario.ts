import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class Calendario implements OnInit {

  // --- FECHA ACTUAL Y MES VISIBLE ---
  hoy = new Date();
  mesActual: Date = new Date();

  // --- MOVIMIENTOS ---
  movimientos: any[] = [];

  // --- DÍA SELECCIONADO ---
  diaSeleccionado: number | null = null;

  // --- MODAL AÑADIR ---
  modalAbierto = false;
  cargando = false;
  errorModal = '';
  cantidadDisplay: string = '';
  nuevoMovimiento = {
    tipo: 'ingreso',
    cantidad: null as number | null,
    categoria: '',
    descripcion: '',
    fecha: '',
    hora: '',
    fechaHora: ''
  };

  categoríasIngreso = ['Nómina', 'Capital (Alquileres)', 'Negocios y ventas', 'Otros'];
  categoríasGasto = ['Ocio', 'Supervivencia', 'Cultura', 'Extras o imprevistos'];

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // Seleccionar el día actual por defecto
    this.diaSeleccionado = this.hoy.getDate();
    this.cargarMovimientos();
  }

  // Obtiene todos los movimientos del usuario
  cargarMovimientos() {
    this.authService.getHistorialMovimientos().subscribe({
      next: (res) => {
        this.movimientos = res.movimientos ?? res ?? [];
        this.cdr.detectChanges();
      },
      error: () => { this.movimientos = []; }
    });
  }

  // --- NAVEGACIÓN ---
  mesAnterior() {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
    this.diaSeleccionado = null;
  }

  mesSiguiente() {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 1);
    this.diaSeleccionado = null;
  }

  get tituloMes(): string {
    return this.mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  // --- CONSTRUCCIÓN DEL GRID ---
  // Devuelve los días del mes con sus offsets iniciales (nulls = celdas vacías)
  get diasDelMes(): (number | null)[] {
    const año = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    const totalDias = new Date(año, mes + 1, 0).getDate();

    // Lunes=0, en JS domingo=0 → convertimos
    let primerDia = new Date(año, mes, 1).getDay();
    primerDia = primerDia === 0 ? 6 : primerDia - 1;

    const dias: (number | null)[] = [];
    for (let i = 0; i < primerDia; i++) dias.push(null);
    for (let i = 1; i <= totalDias; i++) dias.push(i);
    return dias;
  }

  esHoy(dia: number): boolean {
    return dia === this.hoy.getDate()
      && this.mesActual.getMonth() === this.hoy.getMonth()
      && this.mesActual.getFullYear() === this.hoy.getFullYear();
  }

  seleccionarDia(dia: number) {
    this.diaSeleccionado = dia;
  }

  // --- MOVIMIENTOS POR DÍA ---
  movimientosDelDia(dia: number): any[] {
    const año = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    return this.movimientos.filter(m => {
      const fecha = new Date(m.fecha);
      return fecha.getDate() === dia
        && fecha.getMonth() === mes
        && fecha.getFullYear() === año;
    });
  }

  get movimientosDiaSeleccionado(): any[] {
    return this.diaSeleccionado ? this.movimientosDelDia(this.diaSeleccionado) : [];
  }

  tieneIngresos(dia: number): boolean {
    return this.movimientosDelDia(dia).some(m => m.tipo === 'ingreso');
  }

  tieneGastos(dia: number): boolean {
    return this.movimientosDelDia(dia).some(m => m.tipo === 'gasto');
  }

  // --- RESUMEN DEL MES ---
  get totalGastosMes(): number {
    const mes = this.mesActual.getMonth();
    const año = this.mesActual.getFullYear();
    return this.movimientos
      .filter(m => m.tipo === 'gasto' && new Date(m.fecha).getMonth() === mes && new Date(m.fecha).getFullYear() === año)
      .reduce((acc, m) => acc + parseFloat(m.cantidad), 0);
  }

  get totalIngresosMes(): number {
    const mes = this.mesActual.getMonth();
    const año = this.mesActual.getFullYear();
    return this.movimientos
      .filter(m => m.tipo === 'ingreso' && new Date(m.fecha).getMonth() === mes && new Date(m.fecha).getFullYear() === año)
      .reduce((acc, m) => acc + parseFloat(m.cantidad), 0);
  }

  // --- MODAL ---
  get categoriasActuales(): string[] {
    return this.nuevoMovimiento.tipo === 'ingreso' ? this.categoríasIngreso : this.categoríasGasto;
  }

  onFechaChange() {
    const ahora = new Date();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    this.nuevoMovimiento.fechaHora = `${this.nuevoMovimiento.fecha}T${hora}:${minutos}`;
  }

  abrirModal() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(this.diaSeleccionado ?? ahora.getDate()).padStart(2, '0'); // usa el día seleccionado
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    this.nuevoMovimiento = {
      tipo: 'ingreso',
      cantidad: null,
      categoria: '',
      descripcion: '',
      fecha: `${año}-${mes}-${dia}`,
      hora: `${hora}:${minutos}`,   // inicializa con hora actual
      fechaHora: ''
    };
    this.cantidadDisplay = '';
    this.errorModal = '';
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  onTipoChange() {
    this.nuevoMovimiento.categoria = '';
  }

  formatearCantidad(input: HTMLInputElement) {
    const valor = parseFloat(this.cantidadDisplay.replace(',', '.'));
    if (!isNaN(valor) && valor > 0) {
      this.nuevoMovimiento.cantidad = valor;
      this.cantidadDisplay = valor.toFixed(2);
      input.value = valor.toFixed(2);
    } else {
      this.nuevoMovimiento.cantidad = null;
      this.cantidadDisplay = '';
      input.value = '';
    }
  }

  guardarMovimiento() {
    if (!this.nuevoMovimiento.cantidad || !this.nuevoMovimiento.categoria) {
      this.errorModal = 'Cantidad y categoría son obligatorias.';
      return;
    }

    // Combina fecha y hora en un solo string datetime
    const fechaHoraFinal = this.nuevoMovimiento.hora
      ? `${this.nuevoMovimiento.fecha}T${this.nuevoMovimiento.hora}`
      : this.nuevoMovimiento.fecha;

    this.cargando = true;
    this.errorModal = '';

    this.authService.apuntarMovimiento({
      tipo: this.nuevoMovimiento.tipo,
      cantidad: this.nuevoMovimiento.cantidad,
      categoria: this.nuevoMovimiento.categoria,
      descripcion: this.nuevoMovimiento.descripcion,
      fecha: fechaHoraFinal
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.cerrarModal();
        this.cargarMovimientos();
      },
      error: (err) => {
        this.cargando = false;
        const errores = err.error?.errors;
        if (typeof errores === 'object' && errores !== null) {
          this.errorModal = Object.values(errores).flat().join(', ');
        } else {
          this.errorModal = errores || 'Error al añadir el movimiento.';
        }
      }
    });
  }
}
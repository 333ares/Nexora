import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista.html',
  styleUrl: './lista.css'
})
export class Lista implements OnInit {

  movimientos: any[] = [];
  movimientosFiltrados: any[] = [];
  filtroActivo: string = 'todos';
  modalAbierto = false;
  cargando = false;
  errorModal = '';
  exitoModal = '';

  categoríasIngreso = ['Nómina', 'Capital (Alquileres)', 'Negocios y ventas', 'Otros'];
  categoríasGasto = ['Ocio', 'Supervivencia', 'Cultura', 'Extras o imprevistos'];

  nuevoMovimiento = {
    tipo: 'ingreso',
    cantidad: null as number | null,
    categoria: '',
    descripcion: ''
  };

  constructor(private authService: Auth) { }

  ngOnInit() {
    this.cargarMovimientos();
  }

  cargarMovimientos() {
    this.authService.getHistorialMovimientos().subscribe({
      next: (res) => {
        this.movimientos = res.movimientos ?? res;
        this.filtrar(this.filtroActivo);
      },
      error: (err) => console.error(err)
    });
  }

  filtrar(tipo: string) {
    this.filtroActivo = tipo;
    this.movimientosFiltrados = tipo === 'todos'
      ? this.movimientos
      : this.movimientos.filter(m => m.tipo === tipo);
  }

  get categoriasActuales(): string[] {
    return this.nuevoMovimiento.tipo === 'ingreso'
      ? this.categoríasIngreso
      : this.categoríasGasto;
  }

  cantidadDisplay: string = '';

  abrirModal() {
    this.nuevoMovimiento = { tipo: 'ingreso', cantidad: null, categoria: '', descripcion: '' };
    this.cantidadDisplay = '';
    this.errorModal = '';
    this.exitoModal = '';
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  onTipoChange() {
    this.nuevoMovimiento.categoria = ''; // reset categoría al cambiar tipo
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

    this.cargando = true;
    this.errorModal = '';

    this.authService.apuntarMovimiento({
      tipo: this.nuevoMovimiento.tipo,
      cantidad: this.nuevoMovimiento.cantidad,
      categoria: this.nuevoMovimiento.categoria,
      descripcion: this.nuevoMovimiento.descripcion
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.exitoModal = 'Movimiento añadido correctamente.';
        this.cargarMovimientos();
        setTimeout(() => this.cerrarModal(), 1200);
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
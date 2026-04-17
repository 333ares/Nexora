import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  // --- DATOS ---
  movimientos: any[] = [];
  movimientosFiltrados: any[] = [];
  filtroActivo: string = 'todos';

  // --- PAGINACIÓN ---
  paginaActual = 1;
  itemsPorPagina = 10;

  get totalPaginas(): number {
    return Math.ceil(this.movimientosFiltrados.length / this.itemsPorPagina);
  }

  get movimientosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.movimientosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get paginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const rango: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) rango.push(i);
    } else {
      rango.push(1);
      if (actual > 3) rango.push(-1); // ellipsis
      for (let i = Math.max(2, actual - 1); i <= Math.min(total - 1, actual + 1); i++) {
        rango.push(i);
      }
      if (actual < total - 2) rango.push(-1); // ellipsis
      rango.push(total);
    }
    return rango;
  }

  irAPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.cdr.detectChanges();
  }

  // --- ESTADO MODAL ---
  modalAbierto = false;
  modoEdicion = false;
  movimientoEditandoId: number | null = null;
  cargando = false;
  errorModal = '';
  exitoModal = '';

  // --- CATEGORÍAS ---
  categoríasIngreso = ['Nómina', 'Capital (Alquileres)', 'Negocios y ventas', 'Otros'];
  categoríasGasto = ['Ocio', 'Supervivencia', 'Cultura', 'Extras o imprevistos'];

  // --- FORMULARIO ---
  cantidadDisplay: string = '';
  nuevoMovimiento = {
    tipo: 'ingreso',
    cantidad: null as number | null,
    categoria: '',
    descripcion: '',
    fecha: '',
    fechaHora: ''
  };

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.cargarMovimientos();
  }

  // Obtiene los movimientos del usuario desde el backend
  cargarMovimientos() {
    this.authService.getHistorialMovimientos().subscribe({
      next: (res) => {
        this.movimientos = res.movimientos ?? res ?? [];
        this.filtrar(this.filtroActivo);
        this.cdr.detectChanges();
      },
      error: () => {
        this.movimientos = [];
        this.filtrar(this.filtroActivo);
        this.cdr.detectChanges();
      }
    });
  }

  // Filtra los movimientos por tipo: todos, ingreso o gasto
  filtrar(tipo: string) {
    this.filtroActivo = tipo;
    this.paginaActual = 1; // ← resetea a página 1 al filtrar
    this.movimientosFiltrados = tipo === 'todos'
      ? this.movimientos
      : this.movimientos.filter(m => m.tipo === tipo);
  }

  // Descripciones de ayuda por categoría
  private readonly categoriaHints: Record<string, string> = {
    'Nómina': 'Tu salario mensual, pagas extra o ingresos por trabajo por cuenta ajena.',
    'Capital (Alquileres)': 'Rentas de inmuebles, dividendos, intereses de cuentas o inversiones.',
    'Negocios y ventas': 'Ingresos de tu empresa, freelance, venta de productos o servicios propios.',
    'Otros': 'Premios, herencias, devoluciones de impuestos u otros ingresos puntuales.',
    'Ocio': 'Salir a cenar, bares, conciertos, viajes, deportes o entretenimiento.',
    'Supervivencia': 'Alimentación, alquiler, facturas, transporte, ropa básica o medicamentos.',
    'Cultura': 'Libros, cursos, museos, suscripciones de streaming o formación.',
    'Extras o imprevistos': 'Reparaciones, multas, gastos médicos inesperados o cualquier imprevisto.'
  };

  // Devuelve el hint de una categoría o cadena vacía si no existe
  getCategoriaHint(categoria: string): string {
    return this.categoriaHints[categoria] ?? '';
  }

  // Devuelve las categorías según el tipo de movimiento seleccionado
  get categoriasActuales(): string[] {
    return this.nuevoMovimiento.tipo === 'ingreso'
      ? this.categoríasIngreso
      : this.categoríasGasto;
  }

  // Abre el modal en modo creación
  abrirModal() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    this.modoEdicion = false;
    this.movimientoEditandoId = null;
    this.nuevoMovimiento = {
      tipo: 'ingreso',
      cantidad: null,
      categoria: '',
      descripcion: '',
      fecha: `${año}-${mes}-${dia}`, // input date
      fechaHora: `${año}-${mes}-${dia}T${hora}:${minutos}` // backend
    };
    this.cantidadDisplay = '';
    this.errorModal = '';
    this.exitoModal = '';
    this.modalAbierto = true;
  }


  // Abre el modal en modo edición, precargando los datos del movimiento
  abrirModalEditar(mov: any) {
    this.modoEdicion = true;
    this.movimientoEditandoId = mov.id;
    this.nuevoMovimiento = {
      tipo: mov.tipo,
      cantidad: mov.cantidad,
      categoria: mov.categoria,
      descripcion: mov.descripcion || '',
      fecha: mov.fecha,
      fechaHora: mov.fechaHora
    };
    this.cantidadDisplay = Number(mov.cantidad).toFixed(2);
    this.errorModal = '';
    this.exitoModal = '';
    this.modalAbierto = true;
  }

  onFechaChange() {
    const ahora = new Date();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    this.nuevoMovimiento.fechaHora = `${this.nuevoMovimiento.fecha}T${hora}:${minutos}`;
  }

  // Cierra el modal y resetea el estado
  cerrarModal() {
    this.modalAbierto = false;
    this.modoEdicion = false;
    this.movimientoEditandoId = null;
  }

  // Resetea la categoría al cambiar el tipo de movimiento
  onTipoChange() {
    this.nuevoMovimiento.categoria = '';
  }

  // Formatea la cantidad a 2 decimales al salir del input
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

  // Guarda o actualiza el movimiento según el modo del modal
  guardarMovimiento() {
    if (!this.nuevoMovimiento.cantidad || !this.nuevoMovimiento.categoria) {
      this.errorModal = 'Cantidad y categoría son obligatorias.';
      return;
    }

    this.cargando = true;
    this.errorModal = '';

    if (this.modoEdicion && this.movimientoEditandoId !== null) {
      // Modo edición: enviamos PUT con el id del movimiento
      // ← corregido: usa actualizarMovimiento (PUT) con el id
      this.authService.actualizarMovimiento({
        id: this.movimientoEditandoId,
        tipo: this.nuevoMovimiento.tipo,
        cantidad: this.nuevoMovimiento.cantidad,
        categoria: this.nuevoMovimiento.categoria,
        descripcion: this.nuevoMovimiento.descripcion,
        fecha: this.nuevoMovimiento.fechaHora
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
            this.errorModal = errores || 'Error al actualizar el movimiento.';
          }
          this.cdr.detectChanges();
        }
      });
    } else {
      // Modo creación: enviamos POST con los datos del formulario
      this.authService.apuntarMovimiento({
        tipo: this.nuevoMovimiento.tipo,
        cantidad: this.nuevoMovimiento.cantidad,
        categoria: this.nuevoMovimiento.categoria,
        descripcion: this.nuevoMovimiento.descripcion,
        fecha: this.nuevoMovimiento.fechaHora
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
          this.cdr.detectChanges();
        }
      });
    }
  }

  // --- CONFIRMAR BORRADO ---
  modalBorrarAbierto = false;
  movimientoBorrandoId: number | null = null;
  cargandoBorrar = false;

  abrirModalBorrar(id: number) {
    this.movimientoBorrandoId = id;
    this.modalBorrarAbierto = true;
  }

  cerrarModalBorrar() {
    this.modalBorrarAbierto = false;
    this.movimientoBorrandoId = null;
    this.cargandoBorrar = false;
  }

  confirmarBorrar() {
    if (this.movimientoBorrandoId === null) return;
    this.cargandoBorrar = true;
    this.authService.borrarMovimimento(this.movimientoBorrandoId).subscribe({
      next: () => {
        this.cerrarModalBorrar();
        this.cargarMovimientos();
      },
      error: (err) => {
        console.error('Error al borrar:', err);
        this.cerrarModalBorrar();
      }
    });
  }
}
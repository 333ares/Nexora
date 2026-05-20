import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateCategoryPipe } from '../../pipes/translate-category';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, TranslateCategoryPipe],
  templateUrl: './lista.html',
  styleUrl: './lista.css'
})
export class Lista implements OnInit {

  movimientos: any[] = [];           // Lista completa descargada del servidor
  movimientosFiltrados: any[] = [];  // Subconjunto que se muestra según el filtro activo
  filtroActivo: string = 'todos';

  paginaActual = 1;
  itemsPorPagina = 10;

  // Total de páginas calculado a partir de los movimientos filtrados
  get totalPaginas(): number {
    return Math.ceil(this.movimientosFiltrados.length / this.itemsPorPagina);
  }

  // Slice de movimientos correspondiente a la página visible
  get movimientosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.movimientosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  // Genera el array de números de página con ellipsis (-1) cuando hay muchas páginas
  get paginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const rango: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) rango.push(i);
    } else {
      rango.push(1);
      if (actual > 3) rango.push(-1); // -1 representa "..." en el HTML
      for (let i = Math.max(2, actual - 1); i <= Math.min(total - 1, actual + 1); i++) {
        rango.push(i);
      }
      if (actual < total - 2) rango.push(-1);
      rango.push(total);
    }
    return rango;
  }

  irAPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.cdr.detectChanges();
  }

  modalAbierto = false;
  modoEdicion = false;             // true = editar movimiento existente, false = crear nuevo
  movimientoEditandoId: number | null = null;
  cargandoLista = true;
  cargando = false;                // Spinner del botón guardar dentro del modal
  errorModal = '';
  exitoModal = '';

  categoríasIngreso = ['Nómina', 'Capital (Alquileres)', 'Negocios y ventas', 'Otros'];
  categoríasGasto = ['Ocio', 'Supervivencia', 'Cultura', 'Extras o imprevistos'];

  cantidadDisplay: string = ''; // Texto visible del input (puede tener coma como separador)
  nuevoMovimiento = {
    tipo: 'ingreso',
    cantidad: null as number | null,
    categoria: '',
    descripcion: '',
    fecha: '',
    fechaHora: '' // Combina fecha + hora actual para enviarlo al backend
  };

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.cargarMovimientos();
  }

  // Obtiene todos los movimientos del usuario desde el backend
  cargarMovimientos() {
    this.authService.getHistorialMovimientos().subscribe({
      next: (res) => {
        this.movimientos = res.movimientos ?? res ?? [];
        this.filtrar(this.filtroActivo);
        this.cargandoLista = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.movimientos = [];
        this.filtrar(this.filtroActivo);
        this.cargandoLista = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Filtra por tipo y resetea a la primera página para que el usuario no quede en una página vacía
  filtrar(tipo: string) {
    this.filtroActivo = tipo;
    this.paginaActual = 1;
    this.movimientosFiltrados = tipo === 'todos'
      ? this.movimientos
      : this.movimientos.filter(m => m.tipo === tipo);
  }

  // Descripciones de ayuda que se muestran debajo de cada categoría en el selector del modal
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

  getCategoriaHint(categoria: string): string {
    return this.categoriaHints[categoria] ?? '';
  }

  // Devuelve las categorías correspondientes al tipo seleccionado en el formulario
  get categoriasActuales(): string[] {
    return this.nuevoMovimiento.tipo === 'ingreso'
      ? this.categoríasIngreso
      : this.categoríasGasto;
  }

  // Abre el modal en modo creación y pre-rellena la fecha y hora con el momento actual
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
      fecha: `${año}-${mes}-${dia}`,         // Para el input type="date"
      fechaHora: `${año}-${mes}-${dia}T${hora}:${minutos}` // Para enviarlo al backend
    };
    this.cantidadDisplay = '';
    this.errorModal = '';
    this.exitoModal = '';
    this.modalAbierto = true;
  }

  // Abre el modal en modo edición pre-cargando los datos del movimiento seleccionado
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

  // Cuando el usuario cambia la fecha manualmente, recalculamos fechaHora con la hora actual
  onFechaChange() {
    const ahora = new Date();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    this.nuevoMovimiento.fechaHora = `${this.nuevoMovimiento.fecha}T${hora}:${minutos}`;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.modoEdicion = false;
    this.movimientoEditandoId = null;
  }

  // Al cambiar el tipo (ingreso/gasto) limpiamos la categoría porque cada tipo tiene categorías distintas
  onTipoChange() {
    this.nuevoMovimiento.categoria = '';
  }

  // Acepta coma como separador decimal y formatea siempre a 2 decimales
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

  // Guarda o actualiza el movimiento según el modo del modal (creación o edición)
  guardarMovimiento() {
    if (!this.nuevoMovimiento.cantidad || !this.nuevoMovimiento.categoria) {
      this.errorModal = 'Cantidad y categoría son obligatorias.';
      return;
    }

    this.cargando = true;
    this.errorModal = '';

    if (this.modoEdicion && this.movimientoEditandoId !== null) {
      // Modo edición: PUT con el id del movimiento
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
      // Modo creación: POST con los datos del formulario
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

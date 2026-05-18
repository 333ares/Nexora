import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateCategoryPipe } from '../../pipes/translate-category';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, TranslateCategoryPipe],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class Calendario implements OnInit, OnDestroy {

  hoy = new Date();         // Fecha de hoy; se usa para resaltar el día actual en el grid
  mesActual: Date = new Date(); // Mes que se está visualizando (puede ser diferente del mes real al navegar)

  movimientos: any[] = []; // Todos los movimientos del usuario, filtrados por día en la vista

  diaSeleccionado: number | null = null; // Número del día en el que el usuario ha hecho clic

  modalAbierto = false;
  cargando = false;
  errorModal = '';
  cantidadDisplay: string = ''; // Texto del input de cantidad (acepta coma como separador decimal)
  nuevoMovimiento = {
    tipo: 'ingreso',
    cantidad: null as number | null,
    categoria: '',
    descripcion: '',
    fecha: '',
    hora: '',
    fechaHora: '' // Combina fecha + hora para enviarlo al backend
  };

  categoríasIngreso = ['Nómina', 'Capital (Alquileres)', 'Negocios y ventas', 'Otros'];
  categoríasGasto = ['Ocio', 'Supervivencia', 'Cultura', 'Extras o imprevistos'];

  private langSub: any; // Suscripción al cambio de idioma para actualizar el título del mes

  constructor(
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    // Cuando el idioma cambia forzamos la detección de cambios para actualizar el título del mes
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.detectChanges();
    });
    // Seleccionar el día actual por defecto al cargar para que el panel lateral muestre algo
    this.diaSeleccionado = this.hoy.getDate();
    this.cargarMovimientos();
  }

  ngOnDestroy() {
    if (this.langSub) this.langSub.unsubscribe();
  }

  // Descarga todos los movimientos; se filtran por día/mes en los getters del template
  cargarMovimientos() {
    this.authService.getHistorialMovimientos().subscribe({
      next: (res) => {
        this.movimientos = res.movimientos ?? res ?? [];
        this.cdr.detectChanges();
      },
      error: () => { this.movimientos = []; }
    });
  }

  mesAnterior() {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
    this.diaSeleccionado = null; // Al cambiar de mes limpiamos la selección para evitar confusión
  }

  mesSiguiente() {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 1);
    this.diaSeleccionado = null;
  }

  // Título localizado del mes visible (ej: "Mayo 2025") según el idioma activo
  get tituloMes(): string {
    const lang = this.translate.currentLang || 'es';
    const formatter = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' });
    const formatted = formatter.format(this.mesActual);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  // Genera el array de celdas del grid: null = celda vacía de relleno, number = día del mes
  get diasDelMes(): (number | null)[] {
    const año = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    const totalDias = new Date(año, mes + 1, 0).getDate();

    // En JS getDay() devuelve 0=Domingo, pero el grid empieza en Lunes (0), así que convertimos
    let primerDia = new Date(año, mes, 1).getDay();
    primerDia = primerDia === 0 ? 6 : primerDia - 1;

    const dias: (number | null)[] = [];
    for (let i = 0; i < primerDia; i++) dias.push(null); // Celdas vacías antes del día 1
    for (let i = 1; i <= totalDias; i++) dias.push(i);
    return dias;
  }

  // Comprueba si un día del grid es el día de hoy en el mes y año que se está visualizando
  esHoy(dia: number): boolean {
    return dia === this.hoy.getDate()
      && this.mesActual.getMonth() === this.hoy.getMonth()
      && this.mesActual.getFullYear() === this.hoy.getFullYear();
  }

  seleccionarDia(dia: number) {
    this.diaSeleccionado = dia;
  }

  // Devuelve los movimientos que ocurrieron en un día concreto del mes visible
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

  // Movimientos del día seleccionado; se usa en el panel lateral derecho del calendario
  get movimientosDiaSeleccionado(): any[] {
    return this.diaSeleccionado ? this.movimientosDelDia(this.diaSeleccionado) : [];
  }

  // Indica si un día tiene al menos un ingreso (para mostrar el punto verde en el grid)
  tieneIngresos(dia: number): boolean {
    return this.movimientosDelDia(dia).some(m => m.tipo === 'ingreso');
  }

  // Indica si un día tiene al menos un gasto (para mostrar el punto rojo en el grid)
  tieneGastos(dia: number): boolean {
    return this.movimientosDelDia(dia).some(m => m.tipo === 'gasto');
  }

  // Total de gastos del mes visible (solo los movimientos de ese mes y año)
  get totalGastosMes(): number {
    const mes = this.mesActual.getMonth();
    const año = this.mesActual.getFullYear();
    return this.movimientos
      .filter(m => m.tipo === 'gasto' && new Date(m.fecha).getMonth() === mes && new Date(m.fecha).getFullYear() === año)
      .reduce((acc, m) => acc + parseFloat(m.cantidad), 0);
  }

  // Total de ingresos del mes visible
  get totalIngresosMes(): number {
    const mes = this.mesActual.getMonth();
    const año = this.mesActual.getFullYear();
    return this.movimientos
      .filter(m => m.tipo === 'ingreso' && new Date(m.fecha).getMonth() === mes && new Date(m.fecha).getFullYear() === año)
      .reduce((acc, m) => acc + parseFloat(m.cantidad), 0);
  }

  // Categorías disponibles según el tipo de movimiento seleccionado en el modal
  get categoriasActuales(): string[] {
    return this.nuevoMovimiento.tipo === 'ingreso' ? this.categoríasIngreso : this.categoríasGasto;
  }

  // Cuando el usuario cambia la fecha manualmente, recalculamos fechaHora con la hora actual
  onFechaChange() {
    const ahora = new Date();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    this.nuevoMovimiento.fechaHora = `${this.nuevoMovimiento.fecha}T${hora}:${minutos}`;
  }

  // Abre el modal pre-rellenando la fecha con el mes y día seleccionados en el calendario
  abrirModal() {
    const ahora = new Date();
    const año = this.mesActual.getFullYear();
    const mes = String(this.mesActual.getMonth() + 1).padStart(2, '0');
    const dia = String(this.diaSeleccionado ?? ahora.getDate()).padStart(2, '0');
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    this.nuevoMovimiento = {
      tipo: 'ingreso',
      cantidad: null,
      categoria: '',
      descripcion: '',
      fecha: `${año}-${mes}-${dia}`,
      hora: `${hora}:${minutos}`,
      fechaHora: ''
    };
    this.cantidadDisplay = '';
    this.errorModal = '';
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  // Al cambiar el tipo limpiamos la categoría porque cada tipo tiene categorías distintas
  onTipoChange() {
    this.nuevoMovimiento.categoria = '';
  }

  // Acepta coma como separador decimal y formatea a 2 decimales
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

    // Combina la fecha elegida con la hora introducida por el usuario (o la actual si está vacía)
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
        this.cargarMovimientos(); // Recargamos para que el nuevo movimiento aparezca en el día
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

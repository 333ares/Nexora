import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import {
  ReactiveFormsModule, FormGroup, FormControl,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Validador personalizado que rechaza fechas anteriores a mañana (el backend también lo valida, pero esta comprobación da feedback inmediato al usuario)
function fechaNoAnteriorAHoy(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const manana = new Date();
  manana.setHours(0, 0, 0, 0);
  manana.setDate(manana.getDate() + 1);
  const fechaFin = new Date(control.value);
  return fechaFin < manana ? { fechaAnterior: true } : null;
}


@Component({
  selector: 'app-retos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './retos.html',
  styleUrl: './retos.css'
})
export class Retos implements OnInit {
  listaDeRetos: any[] = [];
  vistaActiva: 'activos' | 'historial' = 'activos'; // Pestaña visible: retos en curso o retos terminados
  retoForm: FormGroup;
  mostrarPopup = false;
  errorModal = '';
  cargando = false;

  sliderIndex = 0; // Índice del slide actualmente visible

  // Retos que aún no han sido cumplidos ni han expirado
  get retosActivos(): any[] {
    return this.listaDeRetos.filter(r => r.activo && !r.cumplido);
  }

  // Retos ya cerrados: cumplidos o expirados
  get retosHistorial(): any[] {
    return this.listaDeRetos.filter(r => !r.activo || r.cumplido);
  }

  // Devuelve la lista que corresponde a la pestaña seleccionada en ese momento
  get retosVisibles(): any[] {
    return this.vistaActiva === 'activos' ? this.retosActivos : this.retosHistorial;
  }

  // Suma del dinero ya aportado en todos los retos
  get totalAhorrado(): number {
    return this.listaDeRetos.reduce((sum, reto) => sum + (parseFloat(reto.cantidad_actual) || 0), 0);
  }

  // Suma del objetivo total de todos los retos
  get totalObjetivo(): number {
    return this.listaDeRetos.reduce((sum, reto) => sum + (parseFloat(reto.cantidad) || 0), 0);
  }

  // Porcentaje global de avance sobre todos los retos combinados
  get progresoGlobal(): number {
    if (this.totalObjetivo <= 0) return 0;
    return Math.min(100, Math.round((this.totalAhorrado / this.totalObjetivo) * 100));
  }

  // Fecha de hace 30 días a medianoche, para filtrar retos recientes
  get fechaHace30Dias(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Retos creados en los últimos 30 días
  get retosUltimos30Dias(): any[] {
    return this.listaDeRetos.filter(r => {
      const inicio = new Date(r.fecha_inicio);
      return inicio >= this.fechaHace30Dias;
    });
  }

  // Dinero aportado en retos de los últimos 30 días
  get ahorradoUltimos30Dias(): number {
    return this.retosUltimos30Dias
      .reduce((sum, r) => sum + (parseFloat(r.cantidad_actual) || 0), 0);
  }

  // Porcentaje de avance solo de los retos de los últimos 30 días
  get progresoGlobal30Dias(): number {
    const objetivo = this.retosUltimos30Dias
      .reduce((sum, r) => sum + (parseFloat(r.cantidad) || 0), 0);
    if (objetivo <= 0) return 0;
    return Math.min(100, Math.round((this.ahorradoUltimos30Dias / objetivo) * 100));
  }

  // Reto activo con la fecha de vencimiento más próxima, para mostrar la cuenta atrás
  get retoMasCercano(): any | null {
    const activos = this.listaDeRetos.filter(r => r.activo && !r.cumplido);
    if (!activos.length) return null;
    return activos.reduce((prev, curr) =>
      new Date(curr.fecha_final) < new Date(prev.fecha_final) ? curr : prev
    );
  }

  // Días que quedan hasta que venza el reto más próximo
  get diasRestantesMasCercano(): number | null {
    if (!this.retoMasCercano) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fin = new Date(this.retoMasCercano.fecha_final);
    fin.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // Genera un array [0, 1, 2, ...] para iterar los puntos de navegación del slider
  get sliderIndices(): number[] {
    return Array.from({ length: this.retosVisibles.length }, (_, i) => i);
  }

  cantidadDisplay: string = '';   // Texto visible en el input de cantidad (con comas o puntos)
  cantidadValor: number | null = null; // Valor numérico parseado listo para enviar al backend

  // Calcula el mínimo seleccionable en el input de fecha: siempre mañana o posterior
  fechaMinima: string = (() => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().split('T')[0];
  })();

  constructor(private Auth: Auth, private cdr: ChangeDetectorRef) {
    this.retoForm = new FormGroup({
      titulo: new FormControl('', Validators.required),
      fecha_final: new FormControl('', [Validators.required, fechaNoAnteriorAHoy]),
    });
  }

  ngOnInit(): void {
    this.cargarRetos();
  }

  cargarRetos() {
    this.Auth.getRetos().subscribe({
      next: (res: any) => {
        this.listaDeRetos = res.retos ?? res ?? [];
        this.sliderIndex = 0;
        this.cdr.detectChanges();
      },
      error: () => {
        this.listaDeRetos = [];
        this.sliderIndex = 0;
        this.cdr.detectChanges();
      }
    });
  }

  // Calcula el porcentaje de avance de un reto individual, capeado a 100
  progreso(reto: any): number {
    if (!reto.cantidad || reto.cantidad <= 0) return 0;
    return Math.min(100, Math.round((reto.cantidad_actual / reto.cantidad) * 100));
  }

  // Cambia entre las pestañas "activos" e "historial" y reinicia el slider al primer slide
  cambiarVista(vista: 'activos' | 'historial') {
    this.vistaActiva = vista;
    this.sliderIndex = 0;
    this.cdr.detectChanges();
  }

  // Avanza al slide anterior de forma circular (al llegar al principio salta al último)
  sliderAnterior() {
    if (this.retosVisibles.length > 0)
      this.sliderIndex = (this.sliderIndex - 1 + this.retosVisibles.length) % this.retosVisibles.length;
  }

  sliderSiguiente() {
    if (this.retosVisibles.length > 0)
      this.sliderIndex = (this.sliderIndex + 1) % this.retosVisibles.length;
  }

  sliderIr(index: number) {
    this.sliderIndex = index;
  }


  // Normaliza la cantidad: acepta comas como separador decimal y formatea a 2 decimales
  formatearCantidad(input: HTMLInputElement) {
    const valor = parseFloat(this.cantidadDisplay.replace(',', '.'));
    if (!isNaN(valor) && valor > 0) {
      this.cantidadValor = valor;
      this.cantidadDisplay = valor.toFixed(2);
      input.value = valor.toFixed(2);
    } else {
      this.cantidadValor = null;
      this.cantidadDisplay = '';
      input.value = '';
    }
  }

  abrirModal() {
    this.errorModal = '';
    this.cantidadDisplay = '';
    this.cantidadValor = null;
    this.retoForm.reset();
    this.mostrarPopup = true;
  }

  cerrarModal() {
    this.mostrarPopup = false;
    this.errorModal = '';
    this.cantidadDisplay = '';
    this.cantidadValor = null;
    this.retoForm.reset();
  }

  guardarReto() {
    if (!this.cantidadValor || this.cantidadValor <= 0) {
      this.errorModal = 'Introduce una cantidad válida.';
      this.cdr.detectChanges()
      return;
    }

    if (this.retoForm.invalid) {
      this.retoForm.markAllAsTouched();
      this.errorModal = 'Revisa los campos obligatorios.';
      this.cdr.detectChanges()
      return;
    }

    // La fecha de inicio siempre es hoy; el usuario solo elige la fecha final
    const hoyISO = new Date().toISOString().split('T')[0];

    const payload = {
      titulo: this.retoForm.value.titulo,
      cantidad: this.cantidadValor,
      fecha_inicio: hoyISO,
      fecha_final: this.retoForm.value.fecha_final,
    };

    this.cargando = true;
    this.errorModal = '';

    this.Auth.crearReto(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.cerrarModal();
        // Recargamos la lista completa para que el nuevo reto aparezca en el slider
        this.cargarRetos();
      },
      error: (err) => {
        this.cargando = false;
        const errores = err.error?.errors;
        if (typeof errores === 'object' && errores !== null) {
          this.errorModal = Object.values(errores).flat().join(', ');
        } else {
          this.errorModal = err.error?.message || 'Error al guardar el reto.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  modalBorrarAbierto = false;
  retoBorrandoId: number | null = null;
  cargandoBorrar = false;

  abrirModalBorrar(id: number) {
    this.retoBorrandoId = id;
    this.modalBorrarAbierto = true;
  }

  cerrarModalBorrar() {
    this.modalBorrarAbierto = false;
    this.retoBorrandoId = null;
    this.cargandoBorrar = false;
  }

  confirmarBorrar() {
    if (this.retoBorrandoId === null) return;
    this.cargandoBorrar = true;
    this.Auth.borrarReto(this.retoBorrandoId).subscribe({
      next: () => {
        this.cerrarModalBorrar();
        this.cargarRetos();
      },
      error: (err) => {
        console.error('Error al borrar el reto:', err);
        this.cerrarModalBorrar();
        this.cdr.detectChanges();
      }
    });
  }

  modalAportarAbierto = false;
  retoAportandoId: number | null = null;
  retoAportandoTitulo: string = '';
  aportarDisplay: string = '';
  aportarValor: number | null = null;
  errorAportar: string = '';
  cargandoAportar = false;

  abrirModalAportar(reto: any) {
    this.retoAportandoId = reto.IDreto;
    this.retoAportandoTitulo = reto.titulo;
    this.aportarDisplay = '';
    this.aportarValor = null;
    this.errorAportar = '';
    this.modalAportarAbierto = true;
  }

  cerrarModalAportar() {
    this.modalAportarAbierto = false;
    this.retoAportandoId = null;
    this.retoAportandoTitulo = '';
    this.aportarDisplay = '';
    this.aportarValor = null;
    this.errorAportar = '';
    this.cargandoAportar = false;
  }

  // Mismo patrón que formatearCantidad: acepta comas y formatea a 2 decimales
  formatearAportar(input: HTMLInputElement) {
    const valor = parseFloat(this.aportarDisplay.replace(',', '.'));
    if (!isNaN(valor) && valor > 0) {
      this.aportarValor = valor;
      this.aportarDisplay = valor.toFixed(2);
      input.value = valor.toFixed(2);
    } else {
      this.aportarValor = null;
      this.aportarDisplay = '';
      input.value = '';
    }
  }

  confirmarAportar() {
    if (!this.aportarValor || this.aportarValor <= 0) {
      this.errorAportar = 'Introduce una cantidad válida.';
      this.cdr.detectChanges()
      return;
    }
    if (this.retoAportandoId === null) return;

    this.cargandoAportar = true;
    this.errorAportar = '';

    this.Auth.aportarAReto(this.retoAportandoId, this.aportarValor).subscribe({
      next: () => {
        this.cerrarModalAportar();
        this.cargarRetos();
      },
      error: (err) => {
        this.cargandoAportar = false;
        const errores = err.error?.errors;
        this.errorAportar = typeof errores === 'string'
          ? errores
          : err.error?.message || 'Error al aportar.';
        this.cdr.detectChanges();
      }
    });
  }

  modalRetirarAbierto = false;
  retoRetirandoId: number | null = null;
  retoRetirandoTitulo: string = '';
  retoRetirandoMax: number = 0; // Máximo que se puede retirar: lo que hay en la hucha en ese momento
  retirarDisplay: string = '';
  retirarValor: number | null = null;
  errorRetirar: string = '';
  cargandoRetirar = false;

  abrirModalRetirar(reto: any) {
    this.retoRetirandoId = reto.IDreto;
    this.retoRetirandoTitulo = reto.titulo;
    this.retoRetirandoMax = parseFloat(reto.cantidad_actual);
    this.retirarDisplay = '';
    this.retirarValor = null;
    this.errorRetirar = '';
    this.modalRetirarAbierto = true;
  }

  cerrarModalRetirar() {
    this.modalRetirarAbierto = false;
    this.retoRetirandoId = null;
    this.retoRetirandoTitulo = '';
    this.retoRetirandoMax = 0;
    this.retirarDisplay = '';
    this.retirarValor = null;
    this.errorRetirar = '';
    this.cargandoRetirar = false;
  }

  formatearRetirar(input: HTMLInputElement) {
    const valor = parseFloat(this.retirarDisplay.replace(',', '.'));
    if (!isNaN(valor) && valor > 0) {
      this.retirarValor = valor;
      this.retirarDisplay = valor.toFixed(2);
      input.value = valor.toFixed(2);
    } else {
      this.retirarValor = null;
      this.retirarDisplay = '';
      input.value = '';
    }
  }

  confirmarRetirar() {
    if (!this.retirarValor || this.retirarValor <= 0) {
      this.errorRetirar = 'Introduce una cantidad válida.';
      this.cdr.detectChanges()
      return;
    }
    // Validación frontend: no se puede retirar más de lo que hay en la hucha
    if (this.retirarValor > this.retoRetirandoMax) {
      this.errorRetirar = `No puedes retirar más de ${this.retoRetirandoMax.toFixed(2)} €.`;
      this.cdr.detectChanges()
      return;
    }
    if (this.retoRetirandoId === null) return;

    this.cargandoRetirar = true;
    this.errorRetirar = '';

    this.Auth.retirarDeReto(this.retoRetirandoId, this.retirarValor).subscribe({
      next: () => {
        this.cerrarModalRetirar();
        this.cargarRetos();
      },
      error: (err) => {
        this.cargandoRetirar = false;
        const errores = err.error?.errors;
        this.errorRetirar = typeof errores === 'string'
          ? errores
          : err.error?.message || 'Error al retirar.';
        this.cdr.detectChanges();
      }
    });
  }

  modalEditarAbierto = false;
  retoEditandoId: number | null = null;
  editarForm: FormGroup = new FormGroup({
    titulo: new FormControl('', Validators.required),
    cantidad: new FormControl('', [Validators.required, Validators.min(0.01)]),
    fecha_final: new FormControl('', [Validators.required, fechaNoAnteriorAHoy]),
  });
  errorEditar: string = '';
  cargandoEditar = false;

  abrirModalEditar(reto: any) {
    this.retoEditandoId = reto.IDreto;
    this.errorEditar = '';

    // El backend puede devolver la fecha con hora (YYYY-MM-DDTHH:mm:ss) o con espacio; tomamos solo la parte de fecha
    const fechaFinal = reto.fecha_final
      ? reto.fecha_final.split('T')[0].split(' ')[0]
      : '';

    this.editarForm.setValue({
      titulo: reto.titulo,
      cantidad: reto.cantidad,
      fecha_final: fechaFinal,
    });

    this.modalEditarAbierto = true;
  }

  cerrarModalEditar() {
    this.modalEditarAbierto = false;
    this.retoEditandoId = null;
    this.errorEditar = '';
    this.cargandoEditar = false;
    this.editarForm.reset();
  }

  confirmarEditar() {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      this.errorEditar = 'Revisa los campos.';
      this.cdr.detectChanges()
      return;
    }
    if (this.retoEditandoId === null) return;

    this.cargandoEditar = true;
    this.errorEditar = '';

    const payload = {
      id: this.retoEditandoId,
      titulo: this.editarForm.value.titulo,
      cantidad: parseFloat(this.editarForm.value.cantidad),
      fecha_final: this.editarForm.value.fecha_final,
    };

    this.Auth.actualizarReto(payload).subscribe({
      next: () => {
        this.cerrarModalEditar();
        this.cargarRetos();
      },
      error: (err) => {
        this.cargandoEditar = false;
        const errores = err.error?.errors;
        if (typeof errores === 'object' && errores !== null) {
          this.errorEditar = Object.values(errores).flat().join(', ');
        } else {
          this.errorEditar = err.error?.message || 'Error al actualizar el reto.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}

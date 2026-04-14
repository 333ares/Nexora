import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import {
  ReactiveFormsModule, FormGroup, FormControl,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';

function fechaNoAnteriorAHoy(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const manana = new Date();
  manana.setHours(0, 0, 0, 0);
  manana.setDate(manana.getDate() + 1);
  const fechaFin = new Date(control.value);
  return fechaFin < manana ? { fechaAnterior: true } : null;
}

function formatearFechaParaLaravel(fechaISO: string): string {
  const [año, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${año}`;
}

@Component({
  selector: 'app-retos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './retos.html',
  styleUrl: './retos.css'
})
export class Retos implements OnInit {
  listaDeRetos: any[] = [];
  vistaActiva: 'activos' | 'historial' = 'activos';
  retoForm: FormGroup;
  mostrarPopup = false;
  errorModal = '';
  cargando = false;

  @ViewChild('retosSlider', { static: false }) retosSlider!: ElementRef<HTMLDivElement>;
  sliderIndex = 0;

  get retosActivos(): any[] {
    return this.listaDeRetos.filter(r => r.activo && !r.cumplido);
  }

  get retosHistorial(): any[] {
    return this.listaDeRetos.filter(r => !r.activo || r.cumplido);
  }

  get retosVisibles(): any[] {
    return this.vistaActiva === 'activos' ? this.retosActivos : this.retosHistorial;
  }

  get totalAhorrado(): number {
    return this.listaDeRetos.reduce((sum, reto) => sum + (parseFloat(reto.cantidad_actual) || 0), 0);
  }

  get totalObjetivo(): number {
    return this.listaDeRetos.reduce((sum, reto) => sum + (parseFloat(reto.cantidad) || 0), 0);
  }

  get progresoGlobal(): number {
    if (this.totalObjetivo <= 0) return 0;
    return Math.min(100, Math.round((this.totalAhorrado / this.totalObjetivo) * 100));
  }

  get sliderIndices(): number[] {
    return Array.from({ length: this.retosVisibles.length }, (_, i) => i);
  }

  cantidadDisplay: string = '';
  cantidadValor: number | null = null;

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

  progreso(reto: any): number {
    if (!reto.cantidad || reto.cantidad <= 0) return 0;
    return Math.min(100, Math.round((reto.cantidad_actual / reto.cantidad) * 100));
  }

  cambiarVista(vista: 'activos' | 'historial') {
    this.vistaActiva = vista;
    this.sliderIndex = 0;
    this.cdr.detectChanges();
    setTimeout(() => this.scrollToSlide(), 0);
  }

  sliderAnterior() {
    if (this.retosVisibles.length > 0) {
      this.sliderIndex = (this.sliderIndex - 1 + this.retosVisibles.length) % this.retosVisibles.length;
      this.scrollToSlide();
    }
  }

  sliderSiguiente() {
    if (this.retosVisibles.length > 0) {
      this.sliderIndex = (this.sliderIndex + 1) % this.retosVisibles.length;
      this.scrollToSlide();
    }
  }

  sliderIr(index: number) {
    this.sliderIndex = index;
    this.scrollToSlide();
  }

  private scrollToSlide() {
    if (!this.retosSlider) return;
    const scrollLeft = this.sliderIndex * this.retosSlider.nativeElement.offsetWidth;
    this.retosSlider.nativeElement.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  }

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

  // --- BORRAR RETO ---
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

  // --- APORTAR DINERO ---
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

  // --- RETIRAR DINERO ---
  modalRetirarAbierto = false;
  retoRetirandoId: number | null = null;
  retoRetirandoTitulo: string = '';
  retoRetirandoMax: number = 0;
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

  // --- EDITAR RETO ---
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

    // Convertir fecha del backend (YYYY-MM-DD o con tiempo) a YYYY-MM-DD para el input
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
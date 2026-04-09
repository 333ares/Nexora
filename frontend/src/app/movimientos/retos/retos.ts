import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  manana.setDate(manana.getDate() + 1); // mínimo mañana
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
  retoForm: FormGroup;
  mostrarPopup = false;
  errorModal = '';
  cargando = false;

  // igual que en calendario
  cantidadDisplay: string = '';
  cantidadValor: number | null = null;

  // minimo que el reto dure hasta mañana
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
        this.cdr.detectChanges()
      },
      error: (err) => {
        this.listaDeRetos = [];
        this.cdr.detectChanges()
      }
    });
  }

  // Igual que en calendario
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
    // Validamos cantidad manualmente (ya no está en el FormGroup)
    if (!this.cantidadValor || this.cantidadValor <= 0) {
      this.errorModal = 'Introduce una cantidad válida.';
      return;
    }

    if (this.retoForm.invalid) {
      this.retoForm.markAllAsTouched();
      this.errorModal = 'Revisa los campos obligatorios.';
      return;
    }

    const hoyISO = new Date().toISOString().split('T')[0];

    const payload = {
      titulo: this.retoForm.value.titulo,
      cantidad: this.cantidadValor,
      fecha_inicio: formatearFechaParaLaravel(hoyISO),
      fecha_final: formatearFechaParaLaravel(this.retoForm.value.fecha_final),
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
      }
    });
  }
}
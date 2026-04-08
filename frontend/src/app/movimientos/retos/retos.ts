import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetosService } from '../../services/retos.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Validador personalizado: fecha_final no puede ser anterior a hoy
function fechaNoAnteriorAHoy(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaFin = new Date(control.value);
  return fechaFin < hoy ? { fechaAnterior: true } : null;
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
  mostrarPopup: boolean = false;
  errorModal: string = '';

  // Fecha mínima para el input date (hoy en formato YYYY-MM-DD)
  fechaMinima: string = new Date().toISOString().split('T')[0];

  constructor(private retosService: RetosService) {
    this.retoForm = new FormGroup({
      titulo: new FormControl('', Validators.required),
      cantidad: new FormControl('', [Validators.required, Validators.min(0.01)]),
      fecha_final: new FormControl('', [Validators.required, fechaNoAnteriorAHoy]),
      fecha_inicio: new FormControl(new Date().toISOString().split('T')[0]),
      IDusuario: new FormControl(1)
    });
  }

  ngOnInit(): void {
    this.cargarRetos();
  }

  cargarRetos() {
    this.retosService.getRetos().subscribe({
      next: (data: any) => {
        this.listaDeRetos = data;
      },
      error: (err: any) => console.error('Fallo al conectar con Laravel', err)
    });
  }

  abrirModal() {
    this.errorModal = '';
    this.retoForm.reset({
      fecha_inicio: new Date().toISOString().split('T')[0],
      IDusuario: 1
    });
    this.mostrarPopup = true;
  }

  cerrarModal() {
    this.mostrarPopup = false;
    this.errorModal = '';
    this.retoForm.reset({
      fecha_inicio: new Date().toISOString().split('T')[0],
      IDusuario: 1
    });
  }

  guardarReto() {
    if (this.retoForm.invalid) {
      this.retoForm.markAllAsTouched();
      this.errorModal = 'Revisa los campos obligatorios.';
      return;
    }

    this.errorModal = '';
    this.retosService.crearReto(this.retoForm.value).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarRetos();
      },
      error: (err) => {
        const errores = err.error?.errors;
        if (typeof errores === 'object' && errores !== null) {
          this.errorModal = Object.values(errores).flat().join(', ');
        } else {
          this.errorModal = err.error?.message || 'Error al guardar el reto.';
        }
      }
    });
  }
}
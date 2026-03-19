import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetosService } from '../../services/retos.service'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

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
  
  // Usaremos esta variable para el Popup (asegúrate que en el HTML ponga *ngIf="mostrarPopup")
  mostrarPopup: boolean = false; 

  constructor(private retosService: RetosService) {
    this.retoForm = new FormGroup({
      titulo: new FormControl('', [Validators.required, Validators.minLength(3)]),
      emoji: new FormControl('🎯', Validators.required),
      cantidad: new FormControl('', [Validators.required, Validators.min(1)]),
      fecha_inicio: new FormControl(new Date().toISOString().split('T')[0], Validators.required),
      fecha_final: new FormControl('', Validators.required),
      IDusuario: new FormControl(1) 
    });
  }

  ngOnInit(): void {
    this.cargarRetos();
  }

  // Centralizamos la carga de retos
  cargarRetos() {
    this.retosService.getRetos().subscribe({
      next: (data: any) => {
        this.listaDeRetos = data;
        console.log('Retos cargados: ', data);
      },
      error: (err: any) => console.error('Fallo al conectar con Laravel', err)
    });
  }

  // Lógica del Popup
  abrirModal() {
    this.mostrarPopup = true;
  }

  cerrarModal() {
    this.mostrarPopup = false;
    // Reseteamos el formulario al cerrar para que esté limpio la próxima vez
    this.retoForm.reset({ 
      emoji: '🎯', 
      IDusuario: 1, 
      fecha_inicio: new Date().toISOString().split('T')[0] 
    });
  }

  // Función única para guardar (fusionada y corregida)
  guardarReto() {
    if (this.retoForm.valid) {
      console.log('Enviando reto...', this.retoForm.value);
      
      this.retosService.crearReto(this.retoForm.value).subscribe({
        next: (res: any) => {
          console.log('¡Reto guardado con éxito!', res);
          this.cargarRetos(); // Recargamos la lista
          this.cerrarModal(); // Cerramos el popup
        },
        error: (err: any) => {
          console.error('Error de Laravel:', err);
          if (err.status === 422) {
            console.table(err.error.errors); // Muestra los errores de validación de Laravel
          }
        }
      });
    } else {
      alert('Por favor, rellena todos los campos correctamente.');
    }
  }

  // Mantenemos esta por si tu botón viejo todavía la llama, 
  // pero ahora simplemente abre el modal profesional
  crearNuevoReto() {
    this.abrirModal();
  }
}
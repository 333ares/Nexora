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
    // Solo pedimos 3 cosas, sin reglas raras
    titulo: new FormControl('', Validators.required),
    emoji: new FormControl('🎯', Validators.required),
    cantidad: new FormControl('', [Validators.required, Validators.min(0.01)]), // 0.01 por si pones céntimos
    IDusuario: new FormControl(1) // Fijo y sin validador
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
  // Añadimos este console.log para ver qué pasa si falla
  if (this.retoForm.invalid) {
    console.error('❌ El formulario es inválido. Mira qué campo falla:');
    console.log('- Errores Título:', this.retoForm.get('titulo')?.errors);
    console.log('- Errores Cantidad:', this.retoForm.get('cantidad')?.errors);
    console.log('- Estado general:', this.retoForm.value);
    alert('Revisa la consola (F12), hay un campo inválido.');
    return; // Detenemos la ejecución aquí
  }

  // Si es válido, enviamos a Laravel
  console.log('✅ Formulario válido, enviando:', this.retoForm.value);
  this.retosService.crearReto(this.retoForm.value).subscribe({
    next: (res) => {
      console.log('¡Guardado!', res);
      this.cerrarModal();
      this.cargarRetos();
    },
    error: (err) => console.error('Error de Laravel:', err)
  });
}

  // Mantenemos esta por si tu botón viejo todavía la llama, 
  // pero ahora simplemente abre el modal profesional
  crearNuevoReto() {
    this.abrirModal();
  }

  
}
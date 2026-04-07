import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-administrar-contenido',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './administrar-contenido.html',
  styleUrl: './administrar-contenido.css',
})
export class AdministrarContenido {

  // ── Modal subir contenido ──
  mostrarModalSubir = false;
  nuevoTitulo = '';
  nuevoCategoria = 'Ahorro';
  nuevoDescripcion = '';
  nuevoTipoArchivo: 'video' | 'documento' = 'video';
  subirError = '';

  abrirModalSubir(): void {
    this.mostrarModalSubir = true;
  }

  cerrarModalSubir(): void {
    this.mostrarModalSubir = false;
    this.subirError = '';
  }

  seleccionarTipo(tipo: 'video' | 'documento'): void {
    this.nuevoTipoArchivo = tipo;
  }

  publicarContenido(): void {
    this.subirError = '';

    if (!this.nuevoTitulo.trim()) {
      this.subirError = 'El título del contenido es obligatorio.';
      return;
    }

    if (!this.nuevoDescripcion.trim()) {
      this.subirError = 'La descripción es obligatoria.';
      return;
    }

    // Aquí iría la llamada al backend
    this.mostrarModalSubir = false;
    this.nuevoTitulo = '';
    this.nuevoCategoria = 'Ahorro';
    this.nuevoDescripcion = '';
    this.nuevoTipoArchivo = 'video';
  }
}

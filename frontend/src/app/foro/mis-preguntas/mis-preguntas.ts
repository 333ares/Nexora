import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Pregunta propia del usuario.
 * BACKEND: poblar `misPreguntas` desde la API.
 */
export interface MiPregunta {
  id: number;
  titulo: string;
  descripcion: string;
  respuestas: number;
  visitas: number;
  tiempo: string;
  estado: 'abierta' | 'respondida' | 'cerrada';
}

@Component({
  selector: 'app-mis-preguntas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-preguntas.html',
  styleUrl: './mis-preguntas.css'
})
export class MisPreguntas {

  filtroActivo: 'todas' | 'abierta' | 'respondida' = 'todas';
  misPreguntas: MiPregunta[] = [];

  constructor(private router: Router) { }

  get preguntasFiltradas(): MiPregunta[] {
    if (this.filtroActivo === 'todas') return this.misPreguntas;
    return this.misPreguntas.filter(p => p.estado === this.filtroActivo);
  }

  cambiarFiltro(f: 'todas' | 'abierta' | 'respondida') {
    this.filtroActivo = f;
  }

  editar(id: number) {
    // BACKEND: abrir edición o navegar al editor.
  }

  borrar(id: number) {
    // BACKEND: llamar al servicio para borrar.
  }

  abrirDetalle(id: number) {
    this.router.navigate(['/foro/detalle', id]);
  }
}
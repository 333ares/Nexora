import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Foro al que pertenece el usuario.
 * BACKEND: poblar `foros` desde la API.
 */
export interface ForoUnido {
  id: number;
  titulo: string;
  miembros: number;
  respuestas: number;
  ultimaActividad: Date;
}

@Component({
  selector: 'app-mis-foros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-foros.html',
  styleUrl: './mis-foros.css'
})
export class MisForos {

  foros: ForoUnido[] = [];

  constructor(private router: Router) { }

  abrirForo(f: ForoUnido) {
    this.router.navigate(['/foro/detalle', f.id]);
  }

  salirForo(ev: MouseEvent, f: ForoUnido) {
    ev.stopPropagation();
    // BACKEND: desuscribir al usuario de este foro y refrescar la lista.
  }
}
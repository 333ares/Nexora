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

  tiempoRelativo(fecha: Date): string {
    if (!fecha) return '';
    const diff = Date.now() - new Date(fecha).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'ahora';
    if (min < 60) return `${min} min`;
    const horas = Math.floor(min / 60);
    if (horas < 24) return `${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `${dias} día${dias > 1 ? 's' : ''}`;
    return new Date(fecha).toLocaleDateString('es');
  }

  abrirForo(f: ForoUnido) {
    this.router.navigate(['/foro/detalle', f.id]);
  }

  salirForo(ev: MouseEvent, f: ForoUnido) {
    ev.stopPropagation();
    // BACKEND: desuscribir al usuario de este foro y refrescar la lista.
  }
}
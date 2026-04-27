import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

export interface Respuesta {
  id: number;
  autor: string;
  contenido: string;
  fecha: Date;
  votos: number;
  yaVotada?: boolean;
}

export interface PreguntaDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  respuestas: number;
  visitas: number;
  miembros: number;
  fecha: Date;
  autor: string;
  unido: boolean;
}

@Component({
  selector: 'app-detalle-foro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-foro.html',
  styleUrl: './detalle-foro.css'
})
export class DetalleForo implements OnInit {

  pregunta: PreguntaDetalle | null = null;
  respuestas: Respuesta[] = [];
  nuevaRespuesta = '';
  popupUnirseAbierto = false;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // BACKEND: cargar la pregunta y sus respuestas a partir de `id`.
  }

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

  volver() {
    this.router.navigate(['/foro/ver']);
  }

  abrirUnirse() { this.popupUnirseAbierto = true; }
  cerrarUnirse() { this.popupUnirseAbierto = false; }

  confirmarUnirse() {
    // BACKEND: registrar al usuario como miembro del foro.
    this.cerrarUnirse();
  }

  salirDelForo() {
    // BACKEND: desuscribir al usuario del foro.
  }

  publicarRespuesta() {
    // BACKEND: enviar la respuesta al servicio y refrescar la lista.
    this.nuevaRespuesta = '';
  }

  toggleVotoRespuesta(r: Respuesta) {
    r.yaVotada = !r.yaVotada;
    // BACKEND: llamar al servicio para registrar/quitar el voto de la respuesta.
  }
}
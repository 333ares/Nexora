import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Mensaje del chat con Kiro.
 * BACKEND: los mensajes se añadirán al array `mensajes`
 * tras llamar a la API de Claude.
 */
export interface Mensaje {
  autor: 'kiro' | 'user';
  texto: string;
  hora: string;
}

@Component({
  selector: 'app-kiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kiro.html',
  styleUrl: './kiro.css'
})
export class Kiro {

  /** Texto que el usuario está escribiendo en el input. */
  mensaje = '';

  /** Indicador de que Kiro está generando una respuesta. */
  cargandoRespuesta = false;

  /**
   * Historial de mensajes de la conversación.
   * BACKEND: poblar con la respuesta de la API de Claude.
   */
  mensajes: Mensaje[] = [];

  /**
   * Envía el mensaje actual.
   * BACKEND: aquí se llamará al servicio que consulta la API de Claude,
   * se añadirá el mensaje del usuario al historial y, cuando llegue la
   * respuesta, se añadirá el mensaje de Kiro.
   */
  enviar() {
    const texto = this.mensaje.trim();
    if (!texto) return;
    // BACKEND: delegar a kiroService.preguntar(texto) y manejar la respuesta.
    this.mensaje = '';
  }

  
}
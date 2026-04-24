import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * Modelo de pregunta del foro.
 * BACKEND: los datos reales vendrán de la API.
 */
export interface Pregunta {
  id: number;
  titulo: string;
  descripcion: string;
  respuestas: number;
  visitas: number;
  miembros: number;
  fecha: Date;
  autor: string;
}

type OrdenKey = 'nuevo' | 'viejo' | 'popular' | 'miembros';

@Component({
  selector: 'app-ver-foro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-foro.html',
  styleUrl: './ver-foro.css'
})
export class VerForo {

  busqueda = '';
  filtroAbierto = false;
  ordenActivo: OrdenKey = 'nuevo';
  popupNuevaAbierto = false;
  nuevaTitulo = '';
  nuevaDescripcion = '';

  opcionesOrden: { key: OrdenKey, label: string, icon: string }[] = [
    { key: 'nuevo', label: 'Más nuevo', icon: 'bi-arrow-up-circle' },
    { key: 'viejo', label: 'Más viejo', icon: 'bi-arrow-down-circle' },
    { key: 'popular', label: 'Más popular', icon: 'bi-fire' },
    { key: 'miembros', label: 'Más miembros', icon: 'bi-people' }
  ];

  /**
   * Lista de preguntas.
   * BACKEND: poblar desde el servicio/API.
   */
  preguntas: Pregunta[] = [];

  constructor(private router: Router) { }

  @HostListener('document:click', ['$event'])
  onClickFuera(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (!target.closest('.filter-wrapper')) {
      this.filtroAbierto = false;
    }
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

  get labelOrdenActivo(): string {
    return this.opcionesOrden.find(o => o.key === this.ordenActivo)?.label || 'Ordenar';
  }

  toggleFiltro(ev: MouseEvent) {
    ev.stopPropagation();
    this.filtroAbierto = !this.filtroAbierto;
  }

  elegirOrden(k: OrdenKey) {
    this.ordenActivo = k;
    this.filtroAbierto = false;
    // BACKEND: llamar al servicio con este orden.
  }

  abrirDetalle(p: Pregunta) {
    this.router.navigate(['/foro/detalle', p.id]);
  }

  abrirNueva() {
    this.popupNuevaAbierto = true;
  }

  cerrarNueva() {
    this.popupNuevaAbierto = false;
    this.nuevaTitulo = '';
    this.nuevaDescripcion = '';
  }

  publicarNueva() {
    // BACKEND: enviar { titulo, descripcion } al servicio.
    this.cerrarNueva();
  }
}
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
type ModoVista = 'inicio' | 'popular' | 'respondidas' | 'recientes';

@Component({
  selector: 'app-ver-foro',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslateModule],
  templateUrl: './ver-foro.html',
  styleUrl: './ver-foro.css'
})
export class VerForo implements OnInit {

  modoVista: ModoVista = 'inicio';
  busqueda = '';
  filtroAbierto = false;
  ordenActivo: OrdenKey = 'nuevo';
  popupNuevaAbierto = false;
  nuevaTitulo = '';
  nuevaDescripcion = '';

  opcionesOrden: { key: OrdenKey, label: string, icon: string }[] = [
    { key: 'nuevo', label: 'FORO.MAS_NUEVO', icon: 'bi-arrow-up-circle' },
    { key: 'viejo', label: 'FORO.MAS_VIEJO', icon: 'bi-arrow-down-circle' },
    { key: 'popular', label: 'FORO.MAS_POPULAR', icon: 'bi-fire' },
    { key: 'miembros', label: 'FORO.MAS_MIEMBROS', icon: 'bi-people' }
  ];

  // Lista raw que llega del backend (nunca se toca)
  private preguntasRaw: Pregunta[] = [];

  // Lista que se muestra en el template (ordenada + filtrada)
  preguntas: Pregunta[] = [];

  constructor(private router: Router, private auth: Auth, private cdr: ChangeDetectorRef) { }

  error = '';
  cargando = true;

  ngOnInit(): void {
    this.auth.listarForos().subscribe({
      next: (res) => {
        this.preguntasRaw = res.foros.map((f: any) => ({
          id: f.IDforo,
          titulo: f.titulo,
          descripcion: f.contenido,
          respuestas: f.respuestas,
          visitas: f.visitas,
          miembros: f.miembros ?? 0,
          fecha: new Date(f.created_at),
          autor: f.creador ?? f.IDusuario
        }));
        this.aplicarOrdenYFiltro();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando foros', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get etiquetaModo(): string {
    switch (this.modoVista) {
      case 'popular': return 'FORO.FOROS_POPULARES';
      case 'respondidas': return 'FORO.FOROS_RESPONDIDOS';
      case 'recientes': return 'FORO.FOROS_RECIENTES';
      default: return '';
    }
  }

  get preguntasPopulares(): Pregunta[] {
    return [...this.preguntasRaw].sort((a, b) => b.visitas - a.visitas).slice(0, 3);
  }

  get preguntasRespondidas(): Pregunta[] {
    return [...this.preguntasRaw].sort((a, b) => b.respuestas - a.respuestas).slice(0, 3);
  }

  get preguntasRecientes(): Pregunta[] {
    return [...this.preguntasRaw].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 3);
  }

  private aplicarOrdenYFiltro(): void {
    const texto = this.busqueda.toLowerCase().trim();

    let lista = texto
      ? this.preguntasRaw.filter(p =>
        p.titulo.toLowerCase().includes(texto) ||
        p.descripcion.toLowerCase().includes(texto)
      )
      : [...this.preguntasRaw];

    switch (this.modoVista) {
      case 'popular':
        lista.sort((a, b) => b.visitas - a.visitas);
        break;
      case 'respondidas':
        lista.sort((a, b) => b.respuestas - a.respuestas);
        break;
      case 'recientes':
        lista.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        break;
      case 'inicio':
        break;
    }

    this.preguntas = lista;
  }

  // Eventos del template
  @HostListener('document:click', ['$event'])
  onClickFuera(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (!target.closest('.filter-wrapper')) this.filtroAbierto = false;
  }

  get labelOrdenActivo(): string {
    return this.opcionesOrden.find(o => o.key === this.ordenActivo)?.label || 'FORO.ORDENAR_POR';
  }

  toggleFiltro(ev: MouseEvent) {
    ev.stopPropagation();
    this.filtroAbierto = !this.filtroAbierto;
  }

  elegirOrden(k: OrdenKey) {
    this.ordenActivo = k;
    this.filtroAbierto = false;
    this.aplicarOrdenYFiltro();
  }

  onBusqueda() {
    this.aplicarOrdenYFiltro();
  }

  verMas(modo: 'popular' | 'respondidas' | 'recientes') {
    this.modoVista = modo;
    this.busqueda = '';
    this.aplicarOrdenYFiltro();
  }

  volverAlInicio() {
    this.modoVista = 'inicio';
    this.busqueda = '';
    this.ordenActivo = 'nuevo';
  }

  abrirDetalle(p: Pregunta) {
    this.router.navigate(['/foro/detalle', p.id]);
  }

  abrirNueva() { this.popupNuevaAbierto = true; }

  publicando = false;

  publicarNueva() {
    this.publicando = true;
    this.error = '';
    this.auth.crearForo({ titulo: this.nuevaTitulo, contenido: this.nuevaDescripcion }).subscribe({
      next: (res) => {
        const nuevo: Pregunta = {
          id: res.foro.IDforo,
          titulo: res.foro.titulo,
          descripcion: res.foro.contenido,
          respuestas: 0,
          visitas: 0,
          miembros: 0,
          fecha: new Date(res.foro.created_at),
          autor: this.auth.getUsuario()?.usuario ?? ''
        };
        this.preguntasRaw.unshift(nuevo);
        this.aplicarOrdenYFiltro();
        this.cerrarNueva();
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Error del backend
        if (err?.error?.errors) {
          const e = err.error.errors;
          // El back puede devolver string o objeto con campos
          this.error = typeof e === 'string'
            ? e
            : Object.values(e).flat().join(' ');
        } else if (err?.error?.message) {
          this.error = err.error.message;
        } else {
          // Fallback de Angular (red caída, timeout, etc.)
          this.error = 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
        }
        this.publicando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarNueva() {
    this.popupNuevaAbierto = false;
    this.nuevaTitulo = '';
    this.nuevaDescripcion = '';
    this.publicando = false;
    this.error = '';
  }

  getAvatarUrl(nombre: string): string {
    if (!nombre) return '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre.trim())}&background=random`;
  }

}
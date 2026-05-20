import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface Pregunta {
  id: number; // ID único
  titulo: string; // Título de la pregunta
  descripcion: string; // Contenido/descripción
  respuestas: number; // Cuántas respuestas tiene
  visitas: number; // Cuántas veces se vio
  miembros: number; // Cuántos participan
  fecha: Date; // Cuándo se creó
  autor: string; // Quién la escribió
}

type ModoVista = 'inicio' | 'popular' | 'respondidas' | 'recientes';

// Componente principal: gestor de la lista de foros
@Component({
  selector: 'app-listar-foros',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslateModule],
  templateUrl: './listar-foros.html',
  styleUrl: './listar-foros.css'
})
export class ListarForos implements OnInit {

  modoVista: ModoVista = 'inicio';
  busqueda = '';
  popupNuevaAbierto = false;
  nuevaTitulo = '';
  nuevaDescripcion = '';
  error = '';
  cargando = true;
  publicando = false;

  private preguntasRaw: Pregunta[] = [];
  preguntas: Pregunta[] = [];

  
  constructor(private router: Router, private auth: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Pedimos al servidor la lista de foros
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
        this.aplicarFiltro();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Si hay error, solo quitamos el "cargando..." para que no quede para siempre
        console.error('Error cargando foros', err);
        this.cargando = false;    // Aunque haya error, quitamos el loader
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
    // Copiamos la lista, la ordenamos por visitas y tomamos solo los 3 primeros
    return [...this.preguntasRaw].sort((a, b) => b.visitas - a.visitas).slice(0, 3);
  }

  get preguntasRespondidas(): Pregunta[] {
    return [...this.preguntasRaw].sort((a, b) => b.respuestas - a.respuestas).slice(0, 3);
  }

  get preguntasRecientes(): Pregunta[] {
    return [...this.preguntasRaw].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 3);
  }

  private aplicarFiltro(): void {
    const texto = this.busqueda.toLowerCase().trim();

    let lista = texto
      ? this.preguntasRaw.filter(p =>
          p.titulo.toLowerCase().includes(texto) ||
          p.descripcion.toLowerCase().includes(texto)
        )
      : [...this.preguntasRaw];

    switch (this.modoVista) {
      case 'popular':
        // Ordenamos por más visitas primero
        lista.sort((a, b) => b.visitas - a.visitas);
        break;
      case 'respondidas':
        // Ordenamos por más respuestas primero
        lista.sort((a, b) => b.respuestas - a.respuestas);
        break;
      case 'recientes':
      default:
        lista.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        break;
      case 'inicio':
        break; // En inicio no se aplica orden adicional
    }

    this.preguntas = lista;
    this.cdr.detectChanges();
  }

  onBusqueda() {
    this.aplicarOrdenYFiltro();
  }

  verMas(modo: 'popular' | 'respondidas' | 'recientes') {
    // Cambiamos a esa sección
    this.modoVista = modo;
    // Limpiamos la búsqueda para empezar con lista completa
    this.busqueda = '';
    this.aplicarFiltro();
  }

  volverAlInicio() {
    this.modoVista = 'inicio';
    this.busqueda = '';
    this.ordenActivo = 'nuevo';
  }

  abrirDetalle(p: Pregunta) {
    // Navegamos a la página de detalle pasándole el ID de la pregunta
    this.router.navigate(['/foro/detalle', p.id]);
  }

  abrirNueva() { this.popupNuevaAbierto = true; }

  publicarNueva() {
    // Marcamos que estamos enviando
    this.publicando = true;
    // Limpiamos errores anteriores
    this.error = '';
    // Enviamos la pregunta al servidor
    this.auth.crearForo({ titulo: this.nuevaTitulo, contenido: this.nuevaDescripcion }).subscribe({
      next: (res) => {
        const nuevo: Pregunta = {
          id: res.foro.IDforo,
          titulo: res.foro.titulo,
          descripcion: res.foro.contenido,
          respuestas: 0, // Es nueva, así que no tiene respuestas
          visitas: 0, // Es nueva, así que no tiene visitas
          miembros: 0, // Es nueva, así que no tiene miembros
          fecha: new Date(res.foro.created_at),
          autor: this.auth.getUsuario()?.usuario ?? ''
        };
        this.preguntasRaw.unshift(nuevo);
        this.aplicarFiltro();
        this.cerrarNueva();
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err?.error?.errors) {
          const e = err.error.errors;
          // Si es un string, mostramos directamente; si es un objeto, extraemos los valores
          this.error = typeof e === 'string'
            ? e
            : Object.values(e).flat().join(' ');
        } else if (err?.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
        }
        this.publicando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarNueva() {
    // Ocultamos el popup
    this.popupNuevaAbierto = false;
    // Limpiamos todos los campos del formulario
    this.nuevaTitulo = '';
    this.nuevaDescripcion = '';
    this.publicando = false;
    this.error = '';
  }

  getAvatarUrl(nombre: string): string {
    if (!nombre) return '';  // Si no hay nombre, devolvemos una URL vacía
    // Generamos la URL con el nombre codificado y un color aleatorio
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre.trim())}&background=random`;
  }

}

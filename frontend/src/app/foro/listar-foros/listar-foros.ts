import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Define la estructura de datos de una pregunta/foro. Cada foro tiene estos campos.
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

// OrdenKey: los posibles criterios de ordenación del dropdown
type OrdenKey = 'nuevo' | 'viejo' | 'popular' | 'miembros';

// ModoVista: las secciones de la pantalla que el usuario puede ver
type ModoVista = 'inicio' | 'popular' | 'respondidas' | 'recientes';

@Component({
  selector: 'app-listar-foros',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslateModule],
  templateUrl: './listar-foros.html',
  styleUrl: './listar-foros.css'
})
export class ListarForos implements OnInit {

  // Estado de la pantalla
  modoVista: ModoVista = 'inicio'; // Sección activa (inicio por defecto)
  busqueda = ''; // Texto que el usuario escribe en el buscador
  filtroAbierto = false; // Controla si el dropdown de orden está visible
  ordenActivo: OrdenKey = 'nuevo'; // Criterio de orden seleccionado (más nuevo por defecto)
  popupNuevaAbierto = false; // Controla si el popup de "crear foro" está abierto
  nuevaTitulo = ''; // Título que el usuario escribe para el nuevo foro
  nuevaDescripcion = ''; // Descripción que el usuario escribe para el nuevo foro
  error = ''; // Mensaje de error que se muestra en la pantalla
  cargando = true; // true mientras se esperan los datos del servidor
  publicando = false; // true mientras se está enviando un nuevo foro al servidor

  // Opciones del dropdown de ordenación: cada una tiene un identificador, etiqueta e icono
  opcionesOrden: { key: OrdenKey, label: string, icon: string }[] = [
    { key: 'nuevo', label: 'FORO.MAS_NUEVO', icon: 'bi-arrow-up-circle' },
    { key: 'viejo', label: 'FORO.MAS_VIEJO', icon: 'bi-arrow-down-circle' },
    { key: 'popular', label: 'FORO.MAS_POPULAR', icon: 'bi-fire' },
    { key: 'miembros', label: 'FORO.MAS_MIEMBROS', icon: 'bi-people' }
  ];

  // Lista original que llega del servidor — nunca se modifica directamente
  private preguntasRaw: Pregunta[] = [];

  // Lista derivada que se muestra en el HTML (ya filtrada y ordenada)
  preguntas: Pregunta[] = [];

  
  constructor(private router: Router, private auth: Auth, private cdr: ChangeDetectorRef) { }

  // ngOnInit se ejecuta automáticamente cuando el componente carga por primera vez
  ngOnInit(): void {
    this.auth.listarForos().subscribe({
      next: (res) => {
        // Transformamos cada foro que llega del servidor al formato Pregunta que usa el frontend
        this.preguntasRaw = res.foros.map((f: any) => ({
          id: f.IDforo,
          titulo: f.titulo,
          descripcion: f.contenido,
          respuestas: f.respuestas,
          visitas: f.visitas,
          miembros: f.miembros ?? 0,          // Si el servidor no manda miembros, usamos 0
          fecha: new Date(f.created_at),
          autor: f.creador ?? f.IDusuario      // Preferimos el nombre; si no viene, usamos el ID
        }));
        this.aplicarOrdenYFiltro(); // Prepara la lista visible con los datos recién llegados
        this.cargando = false;      // Ocultamos el indicador de carga
        this.cdr.detectChanges();   // Avisamos a Angular que actualice la pantalla
      },
      error: (err) => {
        console.error('Error cargando foros', err);
        this.cargando = false;    // Aunque haya error, quitamos el loader
        this.cdr.detectChanges();
      }
    });
  }

  // Getters computados

  // Devuelve la clave de traducción del título de la sección activa
  get etiquetaModo(): string {
    switch (this.modoVista) {
      case 'popular': return 'FORO.FOROS_POPULARES';
      case 'respondidas': return 'FORO.FOROS_RESPONDIDOS';
      case 'recientes': return 'FORO.FOROS_RECIENTES';
      default: return '';
    }
  }

  // Top 3 foros con más visitas (los más leídos)
  get preguntasPopulares(): Pregunta[] {
    return [...this.preguntasRaw].sort((a, b) => b.visitas - a.visitas).slice(0, 3);
  }

  // Top 3 foros con más respuestas
  get preguntasRespondidas(): Pregunta[] {
    return [...this.preguntasRaw].sort((a, b) => b.respuestas - a.respuestas).slice(0, 3);
  }

  // Top 3 foros más recientes (ordenados por fecha, el más nuevo primero)
  get preguntasRecientes(): Pregunta[] {
    return [...this.preguntasRaw].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 3);
  }

  // Devuelve la etiqueta del criterio de orden activo para mostrarla en el botón del dropdown
  get labelOrdenActivo(): string {
    return this.opcionesOrden.find(o => o.key === this.ordenActivo)?.label || 'FORO.ORDENAR_POR';
  }

  // Filtrado y ordenación

  // Aplica el filtro de búsqueda y el orden activo sobre preguntasRaw y guarda el resultado en preguntas
  private aplicarOrdenYFiltro(): void {
    const texto = this.busqueda.toLowerCase().trim();

    // Si hay texto de búsqueda, filtramos; si no, copiamos toda la lista
    let lista = texto
      ? this.preguntasRaw.filter(p =>
          p.titulo.toLowerCase().includes(texto) ||
          p.descripcion.toLowerCase().includes(texto)
        )
      : [...this.preguntasRaw];

    // Ordenamos la lista según la sección activa
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
        break; // En inicio no se aplica orden adicional
    }

    this.preguntas = lista; // Esta es la lista que el HTML renderiza
  }

  // Dropdown de orden

  // @HostListener escucha clics en cualquier parte del documento.
  // Si el clic no fue dentro del filtro, cerramos el dropdown.
  @HostListener('document:click', ['$event'])
  onClickFuera(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (!target.closest('.filter-wrapper')) this.filtroAbierto = false;
  }

  // Abre o cierra el dropdown al pulsar el botón de filtro
  // stopPropagation evita que el clic llegue al listener de arriba y lo cierre inmediatamente
  toggleFiltro(ev: MouseEvent) {
    ev.stopPropagation();
    this.filtroAbierto = !this.filtroAbierto;
  }

  // El usuario elige un criterio de orden: lo guardamos, cerramos el dropdown y recalculamos la lista
  elegirOrden(k: OrdenKey) {
    this.ordenActivo = k;
    this.filtroAbierto = false;
    this.aplicarOrdenYFiltro();
  }

  // Búsqueda

  // Se llama cada vez que el usuario escribe en el buscador
  onBusqueda() {
    this.aplicarOrdenYFiltro();
  }

  // Navegación entre secciones

  // Cambia a una sección específica (popular, respondidas o recientes) y limpia la búsqueda
  verMas(modo: 'popular' | 'respondidas' | 'recientes') {
    this.modoVista = modo;
    this.busqueda = '';
    this.aplicarOrdenYFiltro();
  }

  // Vuelve a la pantalla principal del foro y resetea búsqueda y orden
  volverAlInicio() {
    this.modoVista = 'inicio';
    this.busqueda = '';
    this.ordenActivo = 'nuevo';
  }

  // Navega a la página de detalle del foro que el usuario pulsó
  abrirDetalle(p: Pregunta) {
    this.router.navigate(['/foro/detalle', p.id]);
  }

  // Crear nuevo foro

  // Abre el popup del formulario para crear un nuevo foro
  abrirNueva() { this.popupNuevaAbierto = true; }

  // Envía el nuevo foro al servidor y, si tiene éxito, lo añade al principio de la lista sin recargar la página
  publicarNueva() {
    this.publicando = true;
    this.error = '';
    this.auth.crearForo({ titulo: this.nuevaTitulo, contenido: this.nuevaDescripcion }).subscribe({
      next: (res) => {
        // Construimos el objeto Pregunta con la respuesta del servidor
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
        this.preguntasRaw.unshift(nuevo); // unshift añade al inicio del array (el más reciente primero)
        this.aplicarOrdenYFiltro();
        this.cerrarNueva();
        this.cdr.detectChanges();
      },
      error: (err) => {
        // El servidor puede devolver errores de validación (objeto) o un mensaje simple (string)
        if (err?.error?.errors) {
          const e = err.error.errors;
          this.error = typeof e === 'string'
            ? e
            : Object.values(e).flat().join(' ');
        } else if (err?.error?.message) {
          this.error = err.error.message;
        } else {
          // Fallback: error de red o timeout
          this.error = 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
        }
        this.publicando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Cierra el popup y limpia todos los campos del formulario
  cerrarNueva() {
    this.popupNuevaAbierto = false;
    this.nuevaTitulo = '';
    this.nuevaDescripcion = '';
    this.publicando = false;
    this.error = '';
  }

  // Utilidades

  // Genera una URL de avatar con las iniciales del autor usando el servicio gratuito ui-avatars.com
  getAvatarUrl(nombre: string): string {
    if (!nombre) return '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre.trim())}&background=random`;
  }

}

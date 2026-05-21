import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

// Define qué datos tiene cada pregunta/foro
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

// Las vistas/pantallas posibles: inicio, popular, respondidas o recientes
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

  //  VARIABLES DE ESTADO 
  // Qué sección estoy viendo (inicio, popular, etc.)
  modoVista: ModoVista = 'inicio';
  // Lo que el usuario escribe en el buscador
  busqueda = '';
  // Si está abierto o cerrado el popup de "crear nueva pregunta"
  popupNuevaAbierto = false;
  // Título que está escribiendo el usuario para la nueva pregunta
  nuevaTitulo = '';
  // Descripción que está escribiendo para la nueva pregunta
  nuevaDescripcion = '';
  // Mensaje de error (si algo sale mal)
  error = '';
  // Si estamos esperando que carguen los datos del servidor
  cargando = true;
  // Si estamos enviando una nueva pregunta al servidor
  publicando = false;

  // Lista original sin filtros (tal como viene del servidor)
  private preguntasRaw: Pregunta[] = [];
  // Lista que mostramos en pantalla (ya filtrada y ordenada)
  preguntas: Pregunta[] = [];

  constructor(private router: Router, private auth: Auth, private cdr: ChangeDetectorRef) { }

  // Se ejecuta automáticamente cuando el componente carga por primera vez
  ngOnInit(): void {
    // Pedimos al servidor la lista de foros
    this.auth.listarForos().subscribe({
      next: (res) => {
        // Si todo va bien, transformamos los datos que llegaron del servidor al formato Pregunta
        this.preguntasRaw = res.foros.map((f: any) => ({
          id: f.IDforo,
          titulo: f.titulo,
          descripcion: f.contenido,
          respuestas: f.respuestas,
          visitas: f.visitas,
          miembros: f.miembros ?? 0,  // Si no viene, usamos 0
          fecha: new Date(f.created_at),
          autor: f.creador ?? f.IDusuario  // Preferimos el nombre del creador; si no viene, usamos el ID
        }));
        // Ahora filtramos y ordenamos la lista
        this.aplicarFiltro();
        // Quitamos el "cargando..."
        this.cargando = false;
        // Le decimos a Angular que actualice la pantalla
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Si hay error, solo quitamos el "cargando..." para que no quede para siempre
        console.error('Error cargando foros', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  //  GETTERS (propiedades calculadas) 
  // Devuelve el título de la sección actual (para mostrar en pantalla)
  get etiquetaModo(): string {
    switch (this.modoVista) {
      case 'popular':    return 'FORO.FOROS_POPULARES';
      case 'respondidas': return 'FORO.FOROS_RESPONDIDOS';
      case 'recientes':  return 'FORO.FOROS_RECIENTES';
      default:           return '';
    }
  }

  // Los 3 foros más vistos (más populares)
  get preguntasPopulares(): Pregunta[] {
    // Copiamos la lista, la ordenamos por visitas y tomamos solo los 3 primeros
    return [...this.preguntasRaw].sort((a, b) => b.visitas - a.visitas).slice(0, 3);
  }

  // Los 3 foros con más respuestas
  get preguntasRespondidas(): Pregunta[] {
    return [...this.preguntasRaw].sort((a, b) => b.respuestas - a.respuestas).slice(0, 3);
  }

  // Los 3 foros más recientes (más nuevos primero)
  get preguntasRecientes(): Pregunta[] {
    return [...this.preguntasRaw].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 3);
  }

  // FILTRADO Y BÚSQUEDA 
  // Aplica el filtro de búsqueda y ordena según el modo actual
  private aplicarFiltro(): void {
    // Convertimos la búsqueda a minúsculas y quitamos espacios de más
    const texto = this.busqueda.toLowerCase().trim();

    // Si hay texto de búsqueda, filtramos por título o descripción; si no, mostramos todos
    let lista = texto
      ? this.preguntasRaw.filter(p =>
          p.titulo.toLowerCase().includes(texto) ||
          p.descripcion.toLowerCase().includes(texto)
        )
      : [...this.preguntasRaw];

    // Ordenamos según qué vista estamos viendo
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
        // Ordenamos por más recientes (más nuevos primero)
        lista.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        break;
    }

    // Guardamos la lista filtrada y ordenada para que se muestre en pantalla
    this.preguntas = lista;
    // Le decimos a Angular que redibuje la pantalla
    this.cdr.detectChanges();
  }

  // Se llama cada vez que el usuario escribe en el buscador
  onBusqueda() {
    this.aplicarFiltro();
  }

  // NAVEGACIÓN
  // El usuario hace clic en "Ver más" de una categoría
  verMas(modo: 'popular' | 'respondidas' | 'recientes') {
    // Cambiamos a esa sección
    this.modoVista = modo;
    // Limpiamos la búsqueda para empezar con lista completa
    this.busqueda = '';
    // Aplicamos el filtro/orden del nuevo modo
    this.aplicarFiltro();
  }

  // El usuario quiere volver a la pantalla principal
  volverAlInicio() {
    this.modoVista = 'inicio';
    this.busqueda = '';
    this.aplicarFiltro();
  }

  // El usuario hace clic en una pregunta para verla completa
  abrirDetalle(p: Pregunta) {
    // Navegamos a la página de detalle pasándole el ID de la pregunta
    this.router.navigate(['/foro/detalle', p.id]);
  }

  // CREAR NUEVA PREGUNTA
  // El usuario hace clic en "Nueva pregunta"
  abrirNueva() { 
    this.popupNuevaAbierto = true; 
  }

  // El usuario hace clic en "Publicar" después de escribir la pregunta
  publicarNueva() {
    // Marcamos que estamos enviando
    this.publicando = true;
    // Limpiamos errores anteriores
    this.error = '';
    // Enviamos la pregunta al servidor
    this.auth.crearForo({ titulo: this.nuevaTitulo, contenido: this.nuevaDescripcion }).subscribe({
      next: (res) => {
        // Si todo va bien, creamos el objeto Pregunta con los datos que nos devolvió el servidor
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
        // La añadimos al inicio de la lista (unshift = agregar al principio)
        this.preguntasRaw.unshift(nuevo);
        // Aplicamos filtros (para que aparezca en el lugar correcto)
        this.aplicarFiltro();
        // Cerramos el popup y limpiamos todo
        this.cerrarNueva();
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Si hay error, lo mostramos al usuario
        // El servidor puede devolver errores de validación de varias formas
        if (err?.error?.errors) {
          const e = err.error.errors;
          // Si es un string, mostramos directamente; si es un objeto, extraemos los valores
          this.error = typeof e === 'string'
            ? e
            : Object.values(e).flat().join(' ');
        } else if (err?.error?.message) {
          this.error = err.error.message;
        } else {
          // Fallback: error de conexión o timeout
          this.error = 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
        }
        this.publicando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // El usuario hace clic en "Cancelar" o fuera del popup
  cerrarNueva() {
    // Ocultamos el popup
    this.popupNuevaAbierto = false;
    // Limpiamos todos los campos del formulario
    this.nuevaTitulo = '';
    this.nuevaDescripcion = '';
    this.publicando = false;
    this.error = '';
  }

  // Usamos un servicio externo (ui-avatars.com) que crea avatares automáticamente
  getAvatarUrl(nombre: string): string {
    if (!nombre) return '';  // Si no hay nombre, devolvemos una URL vacía
    // Generamos la URL con el nombre codificado y un color aleatorio
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre.trim())}&background=random`;
  }
}

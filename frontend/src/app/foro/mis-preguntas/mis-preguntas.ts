import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

// Define la estructura de datos de un foro creado por el propio usuario
export interface MiForo {
  id: number;
  titulo: string;
  descripcion: string;
  respuestas: number;
  visitas: number;
  miembros: number;
  fecha: Date;
}

@Component({
  selector: 'app-mis-preguntas',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslateModule],
  templateUrl: './mis-preguntas.html',
  styleUrl: './mis-preguntas.css'
})
export class MisPreguntas implements OnInit {

  // Lista original que llega del servidor — nunca se modifica directamente
  private forosRaw: MiForo[] = [];

  // Lista filtrada por búsqueda (se usa para calcular la paginación)
  forosFiltrados: MiForo[] = [];

  // Subconjunto de forosFiltrados que corresponde a la página actual
  forosPaginados: MiForo[] = [];

  busqueda = ''; // Texto que el usuario escribe en el buscador
  paginaActual = 1; // Página visible actualmente
  readonly porPagina = 6; // Número fijo de foros por página (readonly = no cambia nunca)
  cargando = true; // true mientras se esperan los datos del servidor

  // Variables del popup de edición
  foroParaEditar: MiForo | null = null; // Foro que el usuario quiere editar (null = popup cerrado)
  editTitulo = ''; // Título que el usuario escribe en el formulario de edición
  editDescripcion = ''; // Descripción que el usuario escribe en el formulario de edición
  guardandoEdit = false; // true mientras se envía la edición al servidor
  errorEdit: string | null = null; // Mensaje de error del formulario de edición

  // Variables del popup de borrado
  foroParaBorrar: MiForo | null = null; // Foro que el usuario quiere borrar (null = popup cerrado)
  borrando = false; // true mientras se envía la petición de borrado al servidor

  constructor(private router: Router, private auth: Auth, private cdr: ChangeDetectorRef) { }

  // ngOnInit se ejecuta automáticamente cuando el componente carga por primera vez
  ngOnInit(): void {
    this.auth.listarForosUsuario().subscribe({
      next: (res) => {
        // Transformamos cada foro que llega del servidor al formato MiForo que usa el frontend
        this.forosRaw = (res.foros ?? []).map((f: any) => ({
          id: f.IDforo,
          titulo: f.titulo,
          descripcion: f.contenido,
          respuestas: f.respuestas ?? 0, // Si el servidor no manda el valor, usamos 0
          visitas: f.visitas ?? 0,
          miembros: f.miembros ?? 0,
          fecha: new Date(f.created_at)
        }));
        this.aplicarFiltro(); // Prepara la lista visible con los datos recién llegados
        this.cargando = false;
        this.cdr.detectChanges(); // Avisamos a Angular que actualice la pantalla
      },
      error: () => {
        this.cargando = false; // Aunque haya error, quitamos el loader
        this.cdr.detectChanges();
      }
    });
  }

  // Se llama cada vez que el usuario escribe en el buscador
  // Resetea a la primera página para no quedarse en una página que ya no existe
  onBusqueda(): void {
    this.paginaActual = 1;
    this.aplicarFiltro();
  }

  // Filtra forosRaw por el texto de búsqueda y luego actualiza la página visible
  private aplicarFiltro(): void {
    const txt = this.busqueda.toLowerCase().trim();
    this.forosFiltrados = txt
      ? this.forosRaw.filter(f =>
          f.titulo.toLowerCase().includes(txt) ||
          f.descripcion.toLowerCase().includes(txt)
        )
      : [...this.forosRaw]; // Si no hay búsqueda, mostramos todos
    this.actualizarPagina();
  }

  // Calcula qué foros mostrar en la página actual usando índices de inicio y fin
  private actualizarPagina(): void {
    const inicio = (this.paginaActual - 1) * this.porPagina;
    this.forosPaginados = this.forosFiltrados.slice(inicio, inicio + this.porPagina);
  }

  // Número total de páginas según cuántos foros filtrados hay
  get totalPaginas(): number {
    return Math.ceil(this.forosFiltrados.length / this.porPagina);
  }

  // Array de números [1, 2, 3, ...] para renderizar los botones de paginación en el HTML
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // Cambia a la página indicada, ignorando valores fuera de rango
  irPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.actualizarPagina();
  }

  // Navega a la página de detalle del foro que el usuario pulsó
  abrirForo(f: MiForo): void {
    this.router.navigate(['/foro/detalle', f.id]);
  }

  // Abre el popup de edición precargando los valores actuales del foro
  // stopPropagation evita que el clic también abra el detalle del foro
  abrirEditar(ev: MouseEvent, f: MiForo): void {
    ev.stopPropagation();
    this.foroParaEditar = f;
    this.editTitulo = f.titulo;
    this.editDescripcion = f.descripcion;
    this.errorEdit = null;
  }

  // Cierra el popup de edición y limpia todos sus campos
  cerrarEditar(): void {
    this.foroParaEditar = null;
    this.editTitulo = '';
    this.editDescripcion = '';
    this.errorEdit = null;
    this.guardandoEdit = false;
  }

  // Envía los cambios al servidor y, si tiene éxito, actualiza el foro en la lista local
  guardarEdicion(): void {
    if (!this.foroParaEditar || !this.editTitulo.trim()) return; // Validación mínima antes de enviar
    this.guardandoEdit = true;
    this.auth.actualizarForo({
      IDforo: this.foroParaEditar.id,
      titulo: this.editTitulo,
      contenido: this.editDescripcion
    }).subscribe({
      next: () => {
        // Actualizamos el foro directamente en forosRaw sin recargar toda la lista
        const f = this.forosRaw.find(x => x.id === this.foroParaEditar!.id);
        if (f) {
          f.titulo = this.editTitulo;
          f.descripcion = this.editDescripcion;
        }
        this.aplicarFiltro();
        this.guardandoEdit = false;
        this.cerrarEditar();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardandoEdit = false;
        // El servidor puede devolver errores de validación (objeto) o un mensaje simple (string)
        const e = err?.error?.errors ?? err?.error?.message ?? 'No se pudo actualizar el foro.';
        this.errorEdit = typeof e === 'string' ? e : Object.values(e as Record<string, string[]>).flat().join(' ');
        this.cdr.detectChanges();
      }
    });
  }

  // Abre el popup de confirmación para borrar el foro
  // stopPropagation evita que el clic también abra el detalle del foro
  pedirConfirmacionBorrar(ev: MouseEvent, f: MiForo): void {
    ev.stopPropagation();
    this.foroParaBorrar = f;
  }

  // Cierra el popup de borrado sin hacer nada
  cerrarPopupBorrar(): void {
    this.foroParaBorrar = null;
  }

  // El usuario confirmó que quiere borrar: enviamos la petición al servidor
  confirmarBorrar(): void {
    const f = this.foroParaBorrar;
    if (!f) return;
    this.borrando = true;
    this.auth.borrarForo(f.id).subscribe({
      next: () => {
        // Si el servidor confirmó el borrado, eliminamos el foro de la lista local
        this.forosRaw = this.forosRaw.filter(x => x.id !== f.id);
        this.aplicarFiltro();
        this.borrando = false;
        this.foroParaBorrar = null;
        this.cdr.detectChanges();
      },
      error: () => {
        // Si falla, solo liberamos el bloqueo para que el usuario pueda intentarlo de nuevo
        this.borrando = false;
        this.cdr.detectChanges();
      }
    });
  }
}

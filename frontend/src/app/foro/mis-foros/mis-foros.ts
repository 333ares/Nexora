import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

// Define la estructura de datos de un foro al que el usuario pertenece
export interface ForoUnido {
  id: number;
  IDmembresia: number;  // ID único de la relación usuario-foro (necesario para salir del foro)
  titulo: string;
  descripcion: string;
  creador: string;
  miembro_desde: Date;  // Fecha en la que el usuario se unió al foro
  num_miembros: number;
  num_respuestas: number;
}

@Component({
  selector: 'app-mis-foros',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslateModule],
  templateUrl: './mis-foros.html',
  styleUrl: './mis-foros.css'
})
export class MisForos implements OnInit {

  // Lista original que llega del servidor — nunca se modifica directamente
  private forosRaw: ForoUnido[] = [];

  // Lista filtrada por búsqueda (se usa para calcular paginación)
  forosFiltrados: ForoUnido[] = [];

  // Subconjunto de forosFiltrados que corresponde a la página actual
  forosPaginados: ForoUnido[] = [];

  busqueda = '';  // Texto que el usuario escribe en el buscador
  paginaActual = 1; // Página visible actualmente
  readonly porPagina = 6; // Número fijo de foros por página (readonly = no cambia nunca)
  cargando = true; // true mientras se esperan los datos del servidor
  saliendoId: number | null = null; // ID de la membresía que se está procesando para salir (evita doble clic)
  foroParaSalir: ForoUnido | null = null; // Foro seleccionado para confirmar la salida en el popup

  constructor(private router: Router, private auth: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.auth.getMisForos().subscribe({
      next: (res) => {
        // Transformamos cada foro que llega del servidor al formato ForoUnido que usa el frontend
        this.forosRaw = (res.foros ?? []).map((f: any) => ({
          id: f.IDforo,
          IDmembresia: f.IDmembresia,
          titulo: f.titulo,
          descripcion: f.descripcion,
          creador: f.creador,
          miembro_desde: new Date(f.miembro_desde),
          num_miembros: f.num_miembros,
          num_respuestas: f.num_respuestas
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
  abrirForo(f: ForoUnido): void {
    this.router.navigate(['/foro/detalle', f.id]);
  }

  // Abre el popup de confirmación para salir del foro
  // stopPropagation evita que el clic también abra el detalle del foro
  // Si ya hay una operación de salida en curso (saliendoId != null), no hacemos nada
  pedirConfirmacionSalir(ev: MouseEvent, f: ForoUnido): void {
    ev.stopPropagation();
    if (this.saliendoId !== null) return;
    this.foroParaSalir = f;
  }

  // Cierra el popup de confirmación sin hacer nada
  cerrarPopupSalir(): void {
    this.foroParaSalir = null;
  }

  // El usuario confirmó que quiere salir: enviamos la petición al servidor
  confirmarSalir(): void {
    const f = this.foroParaSalir;
    if (!f) return;

    this.saliendoId = f.IDmembresia; // Marcamos qué membresía se está procesando
    this.auth.salirDeForo(f.IDmembresia).subscribe({
      next: () => {
        // Si el servidor confirmó la salida, eliminamos el foro de la lista local
        this.forosRaw = this.forosRaw.filter(x => x.IDmembresia !== f.IDmembresia);
        this.aplicarFiltro();
        this.saliendoId = null;
        this.foroParaSalir = null;
        this.cdr.detectChanges();
      },
      error: () => {
        // Si falla, solo liberamos el bloqueo para que el usuario pueda intentarlo de nuevo
        this.saliendoId = null;
        this.cdr.detectChanges();
      }
    });
  }
}

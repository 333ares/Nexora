import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

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

  private forosRaw: MiForo[] = [];
  forosFiltrados: MiForo[] = [];
  forosPaginados: MiForo[] = [];

  busqueda = '';
  paginaActual = 1;
  readonly porPagina = 6;
  cargando = true;

  foroParaEditar: MiForo | null = null;
  editTitulo = '';
  editDescripcion = '';
  guardandoEdit = false;
  errorEdit: string | null = null;

  foroParaBorrar: MiForo | null = null;
  borrando = false;

  constructor(private router: Router, private auth: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.auth.listarForosUsuario().subscribe({
      next: (res) => {
        this.forosRaw = (res.foros ?? []).map((f: any) => ({
          id: f.IDforo,
          titulo: f.titulo,
          descripcion: f.contenido,
          respuestas: f.respuestas ?? 0,
          visitas: f.visitas ?? 0,
          miembros: f.miembros ?? 0,
          fecha: new Date(f.created_at)
        }));
        this.aplicarFiltro();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  onBusqueda(): void {
    this.paginaActual = 1;
    this.aplicarFiltro();
  }

  private aplicarFiltro(): void {
    const txt = this.busqueda.toLowerCase().trim();
    this.forosFiltrados = txt
      ? this.forosRaw.filter(f =>
          f.titulo.toLowerCase().includes(txt) ||
          f.descripcion.toLowerCase().includes(txt)
        )
      : [...this.forosRaw];
    this.actualizarPagina();
  }

  private actualizarPagina(): void {
    const inicio = (this.paginaActual - 1) * this.porPagina;
    this.forosPaginados = this.forosFiltrados.slice(inicio, inicio + this.porPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.forosFiltrados.length / this.porPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.actualizarPagina();
  }

  abrirForo(f: MiForo): void {
    this.router.navigate(['/foro/detalle', f.id]);
  }

  abrirEditar(ev: MouseEvent, f: MiForo): void {
    ev.stopPropagation();
    this.foroParaEditar = f;
    this.editTitulo = f.titulo;
    this.editDescripcion = f.descripcion;
    this.errorEdit = null;
  }

  cerrarEditar(): void {
    this.foroParaEditar = null;
    this.editTitulo = '';
    this.editDescripcion = '';
    this.errorEdit = null;
    this.guardandoEdit = false;
  }

  guardarEdicion(): void {
    if (!this.foroParaEditar || !this.editTitulo.trim()) return;
    this.guardandoEdit = true;
    this.auth.actualizarForo({
      IDforo: this.foroParaEditar.id,
      titulo: this.editTitulo,
      contenido: this.editDescripcion
    }).subscribe({
      next: () => {
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
        const e = err?.error?.errors ?? err?.error?.message ?? 'No se pudo actualizar el foro.';
        this.errorEdit = typeof e === 'string' ? e : Object.values(e as Record<string, string[]>).flat().join(' ');
        this.cdr.detectChanges();
      }
    });
  }

  pedirConfirmacionBorrar(ev: MouseEvent, f: MiForo): void {
    ev.stopPropagation();
    this.foroParaBorrar = f;
  }

  cerrarPopupBorrar(): void {
    this.foroParaBorrar = null;
  }

  confirmarBorrar(): void {
    const f = this.foroParaBorrar;
    if (!f) return;
    this.borrando = true;
    this.auth.borrarForo(f.id).subscribe({
      next: () => {
        this.forosRaw = this.forosRaw.filter(x => x.id !== f.id);
        this.aplicarFiltro();
        this.borrando = false;
        this.foroParaBorrar = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.borrando = false;
        this.cdr.detectChanges();
      }
    });
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

export interface ForoUnido {
  id: number;
  IDmembresia: number;
  titulo: string;
  descripcion: string;
  creador: string;
  miembro_desde: Date;
  num_miembros: number;
  num_respuestas: number;
}

@Component({
  selector: 'app-mis-foros',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './mis-foros.html',
  styleUrl: './mis-foros.css'
})
export class MisForos implements OnInit {

  private forosRaw: ForoUnido[] = [];
  forosFiltrados: ForoUnido[] = [];
  forosPaginados: ForoUnido[] = [];

  busqueda = '';
  paginaActual = 1;
  readonly porPagina = 6;
  cargando = true;
  saliendoId: number | null = null;

  constructor(private router: Router, private auth: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.auth.getMisForos().subscribe({
      next: (res) => {
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

  abrirForo(f: ForoUnido): void {
    this.router.navigate(['/foro/detalle', f.id]);
  }

  salirForo(ev: MouseEvent, f: ForoUnido): void {
    ev.stopPropagation();
    if (this.saliendoId !== null) return;
    this.saliendoId = f.IDmembresia;
    this.auth.salirDeForo(f.IDmembresia).subscribe({
      next: () => {
        this.forosRaw = this.forosRaw.filter(x => x.IDmembresia !== f.IDmembresia);
        this.aplicarFiltro();
        this.saliendoId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.saliendoId = null;
        this.cdr.detectChanges();
      }
    });
  }
}

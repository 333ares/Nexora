import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  rango: string;
  estado: string;
  linkedin: string;
  balance_total: number;
}

export interface Contenido {
  id: number;
  titulo: string;
  tipo: string;
  autor: string;
  fecha: string;
  descripcion: string;
  estado: string;
}

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [RouterLink, FormsModule, NgClass],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.css',
})
export class PanelAdmin implements OnInit {

  // ── NAVEGACIÓN 
  vistaActual: 'cuentas' | 'contenido' = 'cuentas';

  cambiarVista(vista: 'cuentas' | 'contenido'): void {
    this.vistaActual = vista;
  }

  // ── DATOS — se rellenarán desde el backend 
  usuarios: Usuario[] = [];
  // TODO: this.usuarioService.getAll().subscribe(data => this.usuarios = data);

  contenidos: Contenido[] = [];
  // TODO: this.contenidoService.getAll().subscribe(data => this.contenidos = data);

  // ── FILTROS 
  busquedaUsuario: string = '';
  filtroUsuario: string = 'todos';
  busquedaContenido: string = '';
  filtroContenido: string = 'todos';

  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter(u => {
      const matchFiltro = this.filtroUsuario === 'todos' || u.estado === this.filtroUsuario;
      const q = this.busquedaUsuario.toLowerCase();
      const matchBusqueda = !q ||
        u.usuario.toLowerCase().includes(q) ||
        u.nombre.toLowerCase().includes(q) ||
        u.apellidos.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return matchFiltro && matchBusqueda;
    });
  }

  get contenidosFiltrados(): Contenido[] {
    return this.contenidos.filter(c => {
      const matchFiltro = this.filtroContenido === 'todos' || c.estado === this.filtroContenido;
      const q = this.busquedaContenido.toLowerCase();
      const matchBusqueda = !q ||
        c.titulo.toLowerCase().includes(q) ||
        c.autor.toLowerCase().includes(q);
      return matchFiltro && matchBusqueda;
    });
  }

  // ── STATS 
  get usuariosActivos(): number    { return this.usuarios.filter(u => u.estado === 'Activo').length; }
  get usuariosBloqueados(): number { return this.usuarios.filter(u => u.estado === 'Bloqueado').length; }
  get usuariosInactivos(): number  { return this.usuarios.filter(u => u.estado === 'Inactivo').length; }

  get contenidosPendientes(): number  { return this.contenidos.filter(c => c.estado === 'Pendiente').length; }
  get contenidosVerificados(): number { return this.contenidos.filter(c => c.estado === 'Verificado').length; }
  get contenidosOcultos(): number     { return this.contenidos.filter(c => c.estado === 'Oculto').length; }

  // ── ACCIONES USUARIOS 
  bloquearUsuario(u: Usuario): void {
    u.estado = 'Bloqueado';
    this.mostrarToast(`Cuenta de ${u.usuario} bloqueada correctamente.`);
  }

  desbloquearUsuario(u: Usuario): void {
    u.estado = 'Activo';
    this.mostrarToast(`Cuenta de ${u.usuario} desbloqueada correctamente.`);
  }

  // ── ACCIONES CONTENIDO 
  verificarContenido(c: Contenido): void {
    c.estado = 'Verificado';
    this.mostrarToast(`"${c.titulo}" verificado correctamente.`);
  }

  ocultarContenido(c: Contenido): void {
    c.estado = 'Oculto';
    this.mostrarToast(`"${c.titulo}" marcado como oculto.`);
  }

  // ── MODALES 
  modalUsuario: boolean = false;
  modalContenido: boolean = false;
  modalConfirmar: boolean = false;

  usuarioSeleccionado: Usuario | null = null;
  contenidoSeleccionado: Contenido | null = null;
  mensajeConfirmar: string = '';
  private accionEliminar: (() => void) | null = null;

  abrirDetalleUsuario(u: Usuario): void {
    this.usuarioSeleccionado = u;
    this.modalUsuario = true;
  }

  abrirDetalleContenido(c: Contenido): void {
    this.contenidoSeleccionado = c;
    this.modalContenido = true;
  }

  confirmarEliminarUsuario(u: Usuario): void {
    this.mensajeConfirmar = `¿Eliminar la cuenta de "${u.usuario}" (${u.nombre} ${u.apellidos})?`;
    this.accionEliminar = () => {
      this.usuarios = this.usuarios.filter(x => x.id !== u.id);
      this.mostrarToast(`Cuenta de ${u.usuario} eliminada.`);
    };
    this.modalConfirmar = true;
  }

  confirmarEliminarContenido(c: Contenido): void {
    this.mensajeConfirmar = `¿Eliminar el contenido "${c.titulo}"?`;
    this.accionEliminar = () => {
      this.contenidos = this.contenidos.filter(x => x.id !== c.id);
      this.mostrarToast(`"${c.titulo}" eliminado correctamente.`);
    };
    this.modalConfirmar = true;
  }

  ejecutarEliminar(): void {
    if (this.accionEliminar) this.accionEliminar();
    this.cerrarModales();
  }

  cerrarModales(): void {
    this.modalUsuario = false;
    this.modalContenido = false;
    this.modalConfirmar = false;
    this.usuarioSeleccionado = null;
    this.contenidoSeleccionado = null;
    this.accionEliminar = null;
  }

  // ── TOAST 
  toastVisible: boolean = false;
  toastMsg: string = '';
  toastError: boolean = false;
  private toastTimer: any;

  mostrarToast(msg: string, error = false): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg = msg;
    this.toastError = error;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => this.toastVisible = false, 3000);
  }

  ngOnInit(): void {
    // TODO: cargar usuarios desde el servicio cuando el backend esté listo
    // this.usuarioService.getAll().subscribe(data => this.usuarios = data);

    // TODO: cargar contenido desde el servicio cuando el backend esté listo
    // this.contenidoService.getAll().subscribe(data => this.contenidos = data);
  }}
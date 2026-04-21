import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  apellidos: string;
  email: string;
  estado: string; // 'activo' | 'bloqueado'  (minúsculas, como devuelve el back)
}

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [FormsModule, NgClass, TitleCasePipe],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.css',
})
export class PanelAdmin implements OnInit {

  usuarios: Usuario[] = [];
  cargando = false;

  busquedaUsuario: string = '';
  filtroUsuario: string = 'todos';

  // Control de modales
  modalConfirmar = false;
  tituloModal = '';
  mensajeConfirmar = '';
  tipoAccion: 'bloquear' | 'desbloquear' | 'eliminar' | null = null;
  usuarioSeleccionado: Usuario | null = null;
  ejecutando = false;

  // Toast
  toastMsg = '';
  toastError = false;
  private toastTimer: any;

  constructor(private authService: Auth, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // CARGA INICIAL
  // El backend devuelve IDusuario en lugar de id, se mapea aquí
  cargarUsuarios(): void {
    this.cargando = true;
    this.authService.listarUsuarios().subscribe({
      next: (res) => {
        const raw = Array.isArray(res.usuarios) ? res.usuarios : [];
        this.usuarios = raw.map((u: any) => ({
          id: u.IDusuario ?? u.id,
          usuario: u.usuario,
          nombre: u.nombre,
          apellidos: u.apellidos,
          email: u.email,
          estado: u.estado,
        }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        const msg = err.status === 403
          ? 'No tienes permisos de administrador.'
          : 'Error al cargar usuarios.';
        this.mostrarToast(msg, true);
        this.cdr.detectChanges();
      }
    });
  }

  // FILTROS
  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter(u => {
      const matchFiltro =
        this.filtroUsuario === 'todos' ||
        u.estado.toLowerCase() === this.filtroUsuario.toLowerCase();
      const q = this.busquedaUsuario.toLowerCase();
      return matchFiltro && (!q ||
        u.usuario.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.nombre.toLowerCase().includes(q));
    });
  }

  get usuariosActivos(): number {
    return this.usuarios.filter(u => u.estado.toLowerCase() === 'activo').length;
  }

  get usuariosBloqueados(): number {
    return this.usuarios.filter(u => u.estado.toLowerCase() === 'bloqueado').length;
  }

  // MODAL
  abrirConfirmacion(accion: 'bloquear' | 'desbloquear' | 'eliminar', u: Usuario): void {
    this.usuarioSeleccionado = u;
    this.tipoAccion = accion;
    this.modalConfirmar = true;

    const nombres: Record<typeof accion, string> = {
      bloquear: 'Bloquear usuario',
      desbloquear: 'Desbloquear usuario',
      eliminar: 'Eliminar usuario',
    };
    const mensajes: Record<typeof accion, string> = {
      bloquear: `¿Estás seguro de que quieres bloquear a ${u.usuario}?`,
      desbloquear: `¿Quieres restaurar el acceso para ${u.usuario}?`,
      eliminar: `¿Eliminar permanentemente a ${u.usuario}?`,
    };

    this.tituloModal = nombres[accion];
    this.mensajeConfirmar = mensajes[accion];
  }

  cerrarModales(): void {
    if (this.ejecutando) return;
    this.modalConfirmar = false;
    this.usuarioSeleccionado = null;
    this.tipoAccion = null;
  }

  // CONFIRMAR ACCIÓN
  confirmarAccion(): void {
    if (!this.usuarioSeleccionado || !this.tipoAccion || this.ejecutando) return;

    const { id } = this.usuarioSeleccionado;
    const accion = this.tipoAccion;
    this.ejecutando = true;

    const peticion$ =
      accion === 'bloquear' ? this.authService.bloquearUsuario(id) :
        accion === 'desbloquear' ? this.authService.desbloquearUsuario(id) :
          this.authService.eliminarUsuario(id);

    peticion$.subscribe({
      next: () => {
        this.ejecutando = false;

        if (accion === 'eliminar') {
          this.usuarios = this.usuarios.filter(u => u.id !== id);
          this.mostrarToast('Usuario eliminado correctamente.');
        } else {
          const nuevoEstado = accion === 'bloquear' ? 'bloqueado' : 'activo';
          this.usuarios = this.usuarios.map(u =>
            u.id === id ? { ...u, estado: nuevoEstado } : u
          );
          this.mostrarToast(
            accion === 'bloquear'
              ? `${this.usuarioSeleccionado?.usuario} ha sido bloqueado.`
              : `${this.usuarioSeleccionado?.usuario} ha sido desbloqueado.`
          );
        }

        this.cerrarModales();
        this.cdr.detectChanges();

      },
      error: (err) => {
        this.ejecutando = false;
        const msg =
          err.status === 404 ? 'Usuario no encontrado.' :
            err.status === 403 ? 'No tienes permisos.' :
              'Error al realizar la acción.';
        this.mostrarToast(msg, true);
        this.cdr.detectChanges();

      }
    });
  }

  // LOGOUT
  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.removeToken();
        this.authService.removeUsuario();
        this.router.navigate(['/inicio']);
      },
      error: () => {
        this.authService.removeToken();
        this.authService.removeUsuario();
        this.router.navigate(['/inicio']);
      }
    });
  }

  // TOAST
  mostrarToast(msg: string, esError = false): void {
    clearTimeout(this.toastTimer);
    this.toastMsg = msg;
    this.toastError = esError;
    this.toastTimer = setTimeout(() => this.toastMsg = '', 3500);
  }

  // HELPERS
  claseEstado(estado: string): string {
    return 'estado--' + estado.toLowerCase();
  }

  esBloqueado(u: Usuario): boolean {
    return u.estado.toLowerCase() === 'bloqueado';
  }
}
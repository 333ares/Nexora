import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  apellidos: string;
  email: string;
  estado: string; // Activo o Bloqueado
}

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [ FormsModule, NgClass],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.css',
})
export class PanelAdmin implements OnInit {
  vistaActual: 'cuentas' = 'cuentas';
  
  // Datos de prueba mínimos para testing
  usuarios: Usuario[] = [
    { id: 1, usuario: 'alejandro_c', nombre: 'Alejandro', apellidos: 'Crespo', email: 'alejandro@nexora.app', estado: 'Activo' },
    { id: 2, usuario: 'dayron_v', nombre: 'Dayron', apellidos: 'Varsendan', email: 'dayron@nexora.app', estado: 'Activo' },
    { id: 3, usuario: 'dani_a', nombre: 'Dani', apellidos: 'Alcaraz', email: 'dani@gmail.com', estado: 'Bloqueado' }
  ];

  busquedaUsuario: string = '';
  filtroUsuario: string = 'todos';

  // Control de Modales
  modalConfirmar = false;
  tituloModal = '';
  mensajeConfirmar = '';
  tipoAccion: 'bloquear' | 'desbloquear' | 'eliminar' | null = null;
  usuarioSeleccionado: Usuario | null = null;

  ngOnInit(): void {}

  // --- FILTROS ---
  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter(u => {
      const matchFiltro = this.filtroUsuario === 'todos' || u.estado === this.filtroUsuario;
      const q = this.busquedaUsuario.toLowerCase();
      return matchFiltro && (!q || u.usuario.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    });
  }

  get usuariosActivos(): number { return this.usuarios.filter(u => u.estado === 'Activo').length; }
  get usuariosBloqueados(): number { return this.usuarios.filter(u => u.estado === 'Bloqueado').length; }
  
  // --- GESTIÓN DE MODAL ---
  abrirConfirmacion(accion: 'bloquear' | 'desbloquear' | 'eliminar', u: Usuario): void {
    this.usuarioSeleccionado = u;
    this.tipoAccion = accion;
    this.modalConfirmar = true;

    if (accion === 'bloquear') {
      this.tituloModal = '⚠️ Bloquear usuario';
      this.mensajeConfirmar = `¿Estás seguro de que quieres bloquear a ${u.usuario}?`;
    } else if (accion === 'desbloquear') {
      this.tituloModal = '🔓 Desbloquear usuario';
      this.mensajeConfirmar = `¿Quieres restaurar el acceso para ${u.usuario}?`;
    } else {
      this.tituloModal = '🗑 Eliminar usuario';
      this.mensajeConfirmar = `¿Eliminar permanentemente a ${u.usuario}?`;
    }
  }

  cerrarModales(): void {
    this.modalConfirmar = false;
    this.usuarioSeleccionado = null;
    this.tipoAccion = null;
  }
}
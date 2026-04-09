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
  vistaActual: 'cuentas' | 'contenido' = 'cuentas';
  
  usuarios: Usuario[] = [
  { id: 1, usuario: 'alejandro_c', nombre: 'Alejandro', apellidos: 'Crespo', email: 'alejandro@nexora.app', rol: 'admin', rango: 'A', estado: 'Activo', linkedin: 'linkedin.com/in/alejandro', balance_total: 2450.00 },
  { id: 2, usuario: 'dayron_v', nombre: 'Dayron', apellidos: 'Varsendan', email: 'dayron@nexora.app', rol: 'admin', rango: 'A', estado: 'Activo', linkedin: 'linkedin.com/in/dayron', balance_total: 1800.50 },
  { id: 3, usuario: 'dani_alcaraz', nombre: 'Dani', apellidos: 'Alcaraz', email: 'dani@nexora.app', rol: 'admin', rango: 'A', estado: 'Activo', linkedin: 'linkedin.com/in/dani', balance_total: 3100.75 },
  { id: 4, usuario: 'ares_gomez', nombre: 'Ares', apellidos: 'Gomez', email: 'ares@nexora.app', rol: 'admin', rango: 'A', estado: 'Activo', linkedin: 'linkedin.com/in/ares', balance_total: 950.00 },
  { id: 5, usuario: 'maria_garcia', nombre: 'María', apellidos: 'García', email: 'maria@gmail.com', rol: 'usuario', rango: 'B', estado: 'Activo', linkedin: '', balance_total: 340.20 },
  { id: 6, usuario: 'carlos_lopez', nombre: 'Carlos', apellidos: 'López', email: 'carlos@gmail.com', rol: 'usuario', rango: 'C', estado: 'Activo', linkedin: '', balance_total: 120.00 },
  { id: 7, usuario: 'ana_martinez', nombre: 'Ana', apellidos: 'Martínez', email: 'ana@gmail.com', rol: 'usuario', rango: 'B', estado: 'Bloqueado', linkedin: 'linkedin.com/in/ana', balance_total: 780.00 },
  { id: 8, usuario: 'pedro_ruiz', nombre: 'Pedro', apellidos: 'Ruiz', email: 'pedro@gmail.com', rol: 'usuario', rango: 'D', estado: 'Activo', linkedin: '', balance_total: 0.00 },
  { id: 9, usuario: 'lucia_torres', nombre: 'Lucía', apellidos: 'Torres', email: 'lucia@gmail.com', rol: 'usuario', rango: 'C', estado: 'Activo', linkedin: '', balance_total: 550.30 },
  { id: 10, usuario: 'javier_mena', nombre: 'Javier', apellidos: 'Mena', email: 'javier@gmail.com', rol: 'usuario', rango: 'D', estado: 'Bloqueado', linkedin: '', balance_total: 0.00 },
];

contenidos: Contenido[] = [
  { id: 1, titulo: 'Cómo crear un fondo de emergencia', tipo: 'video', autor: 'María García', fecha: '12/03/2025', descripcion: 'Guía práctica para crear y mantener un fondo de emergencia personal.', estado: 'Verificado' },
  { id: 2, titulo: 'Inversión en ETFs para principiantes', tipo: 'video', autor: 'Carlos López', fecha: '18/03/2025', descripcion: 'Introducción a los fondos cotizados y cómo empezar a invertir con poco capital.', estado: 'Pendiente' },
  { id: 3, titulo: 'Guía completa de presupuesto personal', tipo: 'pdf', autor: 'Lucía Torres', fecha: '02/04/2025', descripcion: 'Manual paso a paso para elaborar un presupuesto mensual efectivo.', estado: 'Verificado' },
  { id: 4, titulo: 'Errores financieros más comunes', tipo: 'articulo', autor: 'Javier Mena', fecha: '10/04/2025', descripcion: 'Los 10 errores más frecuentes al gestionar el dinero personal.', estado: 'Pendiente' },
  { id: 5, titulo: 'Fiscalidad para autónomos 2025', tipo: 'pdf', autor: 'María García', fecha: '15/04/2025', descripcion: 'Resumen de obligaciones fiscales y deducciones para trabajadores autónomos.', estado: 'Pendiente' },
  { id: 6, titulo: 'Criptomonedas: riesgos y oportunidades', tipo: 'video', autor: 'Carlos López', fecha: '20/04/2025', descripcion: 'Análisis equilibrado del mercado cripto para inversores conservadores.', estado: 'Pendiente' },
  { id: 7, titulo: 'Ahorro inteligente a largo plazo', tipo: 'articulo', autor: 'Lucía Torres', fecha: '25/04/2025', descripcion: 'Estrategias de ahorro con horizonte de 10 a 30 años.', estado: 'Verificado' },
];

  busquedaUsuario: string = '';
  filtroUsuario: string = 'todos';
  busquedaContenido: string = '';
  filtroContenido: string = 'todos';

  // Modales
  modalUsuario = false;
  modalConfirmar = false;
  usuarioSeleccionado: Usuario | null = null;
  mensajeConfirmar = '';
  private accionEliminar: (() => void) | null = null;

  // Toast
  toastVisible = false;
  toastMsg = '';
  toastError = false;
  private toastTimer: any;

  ngOnInit(): void {}

  cambiarVista(vista: 'cuentas' | 'contenido'): void {
    this.vistaActual = vista;
  }

  // --- GETTERS FILTRADOS ---
  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter(u => {
      const matchFiltro = this.filtroUsuario === 'todos' || u.estado === this.filtroUsuario;
      const q = this.busquedaUsuario.toLowerCase();
      return matchFiltro && (!q || u.usuario.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    });
  }

  get contenidosFiltrados(): Contenido[] {
    return this.contenidos.filter(c => {
      const matchFiltro = this.filtroContenido === 'todos' || c.estado === this.filtroContenido;
      const q = this.busquedaContenido.toLowerCase();
      return matchFiltro && (!q || c.titulo.toLowerCase().includes(q) || c.autor.toLowerCase().includes(q));
    });
  }

  // --- STATS ---
  get usuariosActivos(): number { return this.usuarios.filter(u => u.estado === 'Activo').length; }
  get usuariosBloqueados(): number { return this.usuarios.filter(u => u.estado === 'Bloqueado').length; }
  
  get contenidosPendientes(): number { return this.contenidos.filter(c => c.estado === 'Pendiente').length; }
  get contenidosVerificados(): number { return this.contenidos.filter(c => c.estado === 'Verificado').length; }

  // --- ACCIONES ---
  bloquearUsuario(u: Usuario): void {
    u.estado = 'Bloqueado';
    this.mostrarToast(`Usuario ${u.usuario} bloqueado.`);
  }

  desbloquearUsuario(u: Usuario): void {
    u.estado = 'Activo';
    this.mostrarToast(`Usuario ${u.usuario} activado.`);
  }

  verificarContenido(c: Contenido): void {
    c.estado = 'Verificado';
    this.mostrarToast(`"${c.titulo}" verificado.`);
  }

  // --- MODALES Y ELIMINACIÓN ---
  abrirDetalleUsuario(u: Usuario): void {
    this.usuarioSeleccionado = u;
    this.modalUsuario = true;
  }

  confirmarEliminarUsuario(u: Usuario): void {
    this.mensajeConfirmar = `¿Eliminar permanentemente a ${u.usuario}?`;
    this.accionEliminar = () => {
      this.usuarios = this.usuarios.filter(x => x.id !== u.id);
      this.mostrarToast("Usuario eliminado.");
    };
    this.modalConfirmar = true;
  }

  confirmarEliminarContenido(c: Contenido): void {
    this.mensajeConfirmar = `¿Eliminar "${c.titulo}"?`;
    this.accionEliminar = () => {
      this.contenidos = this.contenidos.filter(x => x.id !== c.id);
      this.mostrarToast("Contenido eliminado.");
    };
    this.modalConfirmar = true;
  }

  ejecutarEliminar(): void {
    if (this.accionEliminar) this.accionEliminar();
    this.cerrarModales();
  }

  cerrarModales(): void {
    this.modalUsuario = false;
    this.modalConfirmar = false;
    this.accionEliminar = null;
  }

  mostrarToast(msg: string, error = false): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg = msg;
    this.toastError = error;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => this.toastVisible = false, 3000);
  }
}
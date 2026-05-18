import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateCategoryPipe } from '../pipes/translate-category';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, TranslateModule, TranslateCategoryPipe],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css'
})
export class PerfilUsuario implements OnInit {

  showPassword = false;    // Alterna entre mostrar el password en texto plano o como puntos
  successMessage = '';
  errorMessage = '';
  movimientos: any[] = []; // Últimos movimientos del usuario para mostrar en la card de la derecha

  // Campos del formulario de perfil, inicializados vacíos hasta que carga ngOnInit
  nombre = '';
  apellidos = '';
  usuario = '';
  email = '';
  password = '';

  constructor(private authService: Auth, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // Cargamos los datos actuales del usuario desde localStorage para pre-rellenar el formulario
    const usuario = this.authService.getUsuario();
    if (usuario) {
      this.nombre = usuario.nombre ?? '';
      this.apellidos = usuario.apellidos ?? '';
      this.usuario = usuario.usuario ?? '';
      this.email = usuario.email ?? '';
    }
    this.cargarHistorialMovimientos();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  isSaving = false;

  onGuardar() {
    const usuarioActual = this.authService.getUsuario();
    if (!usuarioActual) return;

    // Solo enviamos los campos que realmente cambiaron para evitar sobrescribir datos sin querer
    const datos: any = {};
    if (this.nombre !== usuarioActual.nombre) datos.nombre = this.nombre;
    if (this.apellidos !== usuarioActual.apellidos) datos.apellidos = this.apellidos;
    if (this.usuario !== usuarioActual.usuario) datos.usuario = this.usuario;
    if (this.email !== usuarioActual.email) datos.email = this.email;
    if (this.password) datos.password = this.password; // Solo se incluye si el usuario escribió algo en el campo

    if (Object.keys(datos).length === 0) {
      this.successMessage = 'No has realizado ningún cambio';
      return;
    }

    this.isSaving = true;

    this.authService.actualizarUsuario(datos).subscribe({
      next: (response: any) => {
        // Actualizamos localStorage con los datos nuevos para que el resto de la app los vea
        this.authService.saveUsuario(response.usuario);
        this.successMessage = 'Cambios guardados correctamente';
        this.errorMessage = '';
        this.password = '';  // Limpiamos el campo de contraseña tras guardar
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        const errors = error.error?.errors;
        if (typeof errors === 'string') {
          this.errorMessage = errors;
        } else if (typeof errors === 'object') {
          this.errorMessage = Object.values(errors).flat().join(', ');
        } else {
          this.errorMessage = 'Error al guardar los cambios';
        }
        this.successMessage = '';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  isLoggingOut = false;

  onLogout() {
    this.isLoggingOut = true;

    this.authService.logout().subscribe({
      next: () => {
        // Eliminamos el token y datos del usuario de localStorage antes de redirigir
        this.authService.removeToken();
        this.authService.removeUsuario();
        this.router.navigate(['/inicio']);
      },
      error: () => {
        // Incluso si el servidor falla (token ya expirado), limpiamos localStorage y redirigimos
        this.authService.removeToken();
        this.authService.removeUsuario();
        this.router.navigate(['/inicio']);
      }
    });
  }

  showDeleteModal = false;
  isDeleting = false;

  // Abre el modal de confirmación antes de borrar; no borra directamente al hacer clic
  onDelete() {
    this.showDeleteModal = true;
  }

  confirmDelete() {
    const usuario = this.authService.getUsuario();
    if (!usuario) return;

    this.isDeleting = true;

    this.authService.eliminarCuenta().subscribe({
      next: () => {
        // Limpiamos sesión y redirigimos aunque el borrado haya ido bien o haya fallado
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

  cancelDelete() {
    this.showDeleteModal = false;
  }

  // Navega a la pantalla de planes de suscripción
  onUpgrade(): void {
    this.router.navigate(['/planes']);
  }

  cargarHistorialMovimientos(): void {
    this.authService.getHistorialMovimientos().subscribe({
      next: (response) => {
        this.movimientos = response.movimientos;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 400) {
          this.movimientos = []; // 400 significa que no hay movimientos, no es un error real
        } else {
          console.error('Error al obtener el historial:', err);
        }
      }
    });
  }

  // Genera la URL del avatar usando las iniciales del nombre a través del servicio gratuito ui-avatars.com
  getAvatarUrl(): string {
    if (!this.nombre) return '';
    const nombreLimpio = encodeURIComponent(this.nombre.trim());
    return `https://ui-avatars.com/api/?name=${nombreLimpio}&background=random`;
  }

}

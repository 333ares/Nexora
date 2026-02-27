import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css'
})
export class PerfilUsuario implements OnInit {

  showPassword = false;
  successMessage = '';
  errorMessage = '';

  nombre = '';
  apellidos = '';
  usuario = '';
  email = '';
  password = '';

  constructor(private authService: Auth, private router: Router) { }

  ngOnInit() {
    const usuario = this.authService.getUsuario();
    if (usuario) {
      this.nombre = usuario.nombre ?? '';
      this.apellidos = usuario.apellidos ?? '';
      this.usuario = usuario.usuario ?? '';
      this.email = usuario.email ?? '';
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onGuardar() {
    const usuarioActual = this.authService.getUsuario();
    if (!usuarioActual) return;

    const datos: any = {};

    if (this.nombre !== usuarioActual.nombre) datos.nombre = this.nombre;
    if (this.apellidos !== usuarioActual.apellidos) datos.apellidos = this.apellidos;
    if (this.usuario !== usuarioActual.usuario) datos.usuario = this.usuario;
    if (this.email !== usuarioActual.email) datos.email = this.email;
    if (this.password) datos.password = this.password;

    // Si no ha cambiado nada, no hacemos la petición
    if (Object.keys(datos).length === 0) {
      this.successMessage = 'No has realizado ningún cambio';
      return;
    }

    this.authService.actualizarUsuario(datos).subscribe({
      next: (response: any) => {
        this.authService.saveUsuario(response.usuario);
        this.successMessage = 'Cambios guardados correctamente';
        this.errorMessage = '';
        this.password = '';
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
      }
    });
  }


  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.removeToken();
        this.authService.removeUsuario();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.removeToken();
        this.authService.removeUsuario();
        this.router.navigate(['/login']);
      }
    });
  }

  onDelete() {
    const usuario = this.authService.getUsuario();
    if (!usuario) return;

    this.authService.eliminarCuenta().subscribe({
      next: () => {
        this.authService.removeToken();
        this.authService.removeUsuario();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.removeToken();
        this.authService.removeUsuario();
        this.router.navigate(['/login']);
      }
    });
  }
}
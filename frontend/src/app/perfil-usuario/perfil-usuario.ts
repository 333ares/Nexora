import { Component } from '@angular/core';
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
export class PerfilUsuario {

  showPassword = false;

  constructor(private authService: Auth, private router: Router) { }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
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
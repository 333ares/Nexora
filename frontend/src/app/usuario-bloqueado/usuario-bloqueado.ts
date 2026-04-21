import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-usuario-bloqueado',
  imports: [],
  templateUrl: './usuario-bloqueado.html',
  styleUrl: './usuario-bloqueado.css',
})
export class UsuarioBloqueado implements OnInit {
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

  volverInicio() {
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

  getAvatarUrl(): string {
    if (!this.nombre) return '';

    const nombreLimpio = encodeURIComponent(this.nombre.trim());

    return `https://ui-avatars.com/api/?name=${nombreLimpio}&background=random`;
  }
}

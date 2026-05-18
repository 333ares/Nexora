import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) { }

  canActivate(): boolean {
    const usuario = this.auth.getUsuario();

    // Si el usuario está bloqueado, redirigimos a la pantalla de bloqueo
    if (usuario?.estado?.toLowerCase() === 'bloqueado') {
      this.router.navigate(['/usuario-bloqueado']);
      return false;
    }

    // Si el usuario es admin (id=1), lo redirigimos al panel de administración
    if (Number(usuario?.id) === 1) {
      this.router.navigate(['/panel-admin']);
      return false;
    }

    return true;
  }
}
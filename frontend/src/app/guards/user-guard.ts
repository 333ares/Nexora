import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) { }

  canActivate(): boolean {
    // Miramos si el usuario esta logueado
    const usuario = this.auth.getUsuario();

    // Si el usuario no es admin (id=1), puede acceder a la ruta
    if (Number(usuario?.id) !== 1) {
      return true;
    }

    // Si el usuario es admin, lo redirigimos al panel de administración
    this.router.navigate(['/panel-admin']);
    return false;

  }
}
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) { }

  canActivate(): boolean {
    // Miramos si el usuario esta logueado
    const usuario = this.auth.getUsuario();

    // Si el usuario es admin (id=1), puede acceder a la ruta
    if (Number(usuario?.id) === 1) {
      return true;
    }

    // Si el usuario no es admin, lo redirigimos a la página de movimientos
    this.router.navigate(['/movimientos']);
    return false;

  }
}
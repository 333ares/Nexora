import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): boolean {
    const usuario = this.auth.getUsuario();

    if (usuario?.id === 1) {
      return true;
    }

    this.router.navigate(['/inicio']);
    return false;
  }
}

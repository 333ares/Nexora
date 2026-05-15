import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) { }

  canActivate(): boolean {
    const usuario = this.auth.getUsuario();

    if (Number(usuario?.id) !== 1) {
      return true;
    }

    this.router.navigate(['/panel-admin']);
    return false;

  }
}
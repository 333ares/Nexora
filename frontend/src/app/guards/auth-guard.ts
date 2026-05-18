import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: Auth, private router: Router) {}

  canActivate(): boolean {
    // Si el usuario tiene un token válido, puede acceder a la ruta
    if (this.authService.getToken()) {
      return true;
    }
    // Si no tiene token, lo redirigimos a la página de login
    this.router.navigate(['/login']);
    return false;
  }
}
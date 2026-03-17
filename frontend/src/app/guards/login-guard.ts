import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private authService: Auth, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.getToken()) {
      // Si ya tiene sesión, lo mandamos a movimientos
      this.router.navigate(['/movimientos']);
      return false;
    }
    // Si no tiene sesión, permitimos el acceso a login/registro
    return true;
  }
}

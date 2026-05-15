import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationStart } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelector } from '../language-selector/language-selector';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, LanguageSelector],
  templateUrl: './landing-layout.html',
  styleUrl: './landing-layout.css',
})
export class LandingLayout {

  // Controla si el usuario está logueado
  isLoggedIn = false;
  // Controla si el menú hamburguesa del nav móvil está abierto
  menuOpen = false;

  constructor(private authService: Auth, private router: Router) {
    // Comprobamos si el usuario tiene un token para determinar si está logueado
    this.isLoggedIn = !!this.authService.getToken();
    // Nos suscribimos a los eventos del router para cerrar el menú al navegar a otra sección
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) this.menuOpen = false;
    });
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; } // Abre o cierra el menú hamburguesa del nav móvil
  closeMenu():  void { this.menuOpen = false; } // Cierra el menú (útil cuando el usuario pulsa fuera de él)

  // HostListener para detectar el scroll y aplicar una sombra al nav cuando se baja la página
  @HostListener('window:scroll')
  onScroll(): void {
    const nav = document.querySelector('nav.landing-nav') as HTMLElement;
    if (nav) {
      nav.style.boxShadow = window.scrollY > 20
        ? '0 8px 32px rgba(78,156,37,0.18)'
        : '0 4px 24px rgba(78,156,37,0.12)';
    }
  }
}

import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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

  isLoggedIn = false;

  constructor(private authService: Auth) {
    this.isLoggedIn = !!this.authService.getToken();
  }

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

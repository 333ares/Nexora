import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelector } from '../language-selector/language-selector';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, FormsModule, TranslatePipe, LanguageSelector],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  isLoggedIn = false;

  constructor(private authService: Auth) {
    this.isLoggedIn = !!this.authService.getToken();
  }

  emailNewsletter: string = '';

  suscribirse(): void {
    if (this.emailNewsletter) {
      // TODO: conectar con backend
      console.log('Newsletter:', this.emailNewsletter);
      this.emailNewsletter = '';
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const nav = document.querySelector('nav') as HTMLElement;
    if (nav) {
      nav.style.boxShadow = window.scrollY > 20
        ? '0 8px 32px rgba(78,156,37,0.18)'
        : '0 4px 24px rgba(78,156,37,0.12)';
    }
  }
}

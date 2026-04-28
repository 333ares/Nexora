import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Auth } from './services/auth';
import { filter } from 'rxjs/operators';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageSelector } from './language-selector/language-selector';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSelector],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isLoggedIn: boolean = false;
  showHeader: boolean = false;

  private rutasConHeader = ['/Foro', '/movimientos', '/perfil'];

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.translate.setDefaultLang('es');
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang') || 'es';
      this.translate.use(savedLang);
    } else {
      this.translate.use('es');
    }
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(value => {
      this.isLoggedIn = value;
      this.actualizarHeader();
      this.cdr.detectChanges();
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.actualizarHeader();
      this.cdr.detectChanges();
    });
  }

  private actualizarHeader(): void {
    const rutaActual = this.router.url;
    const esRutaConHeader = this.rutasConHeader.some(ruta => rutaActual.startsWith(ruta));
    this.showHeader = this.isLoggedIn && esRutaConHeader;
  }
}

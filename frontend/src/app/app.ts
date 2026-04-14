import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from './services/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isLoggedIn: boolean = false;
  showHeader: boolean = false;

  private rutasConHeader = ['/foro', '/movimientos', '/perfil'];

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

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
import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationStart } from '@angular/router';
import { Auth } from '../services/auth';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './foro.html',
  styleUrl: './foro.css',
  encapsulation: ViewEncapsulation.None
})
// OnDestroy permite ejecutar código de limpieza cuando el componente se destruye (ej: al salir de la sección)
export class Foro implements OnDestroy {

  usuario: any; // Datos del usuario logueado (nombre, rol, etc.)
  subnavOpen = false; // Controla si el menú hamburguesa del subnav móvil está abierto

  // Guardamos la suscripción al router para poder cancelarla cuando el componente se destruya
  // Si no la cancelamos, seguiría escuchando eventos aunque el componente ya no exista
  private routerSub: Subscription;

  constructor(private authService: Auth, private router: Router) {
    this.usuario = this.authService.getUsuario();

    // Nos suscribimos a los eventos del router para cerrar el subnav al navegar a otra sección
    // NavigationStart se dispara justo antes de que empiece la navegación
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) this.subnavOpen = false;
    });
  }

  // Abre o cierra el menú hamburguesa del subnav móvil
  toggleSubnav(): void { this.subnavOpen = !this.subnavOpen; }

  // Cierra el menú (útil cuando el usuario pulsa fuera de él)
  closeSubnav(): void  { this.subnavOpen = false; }

  // ngOnDestroy se ejecuta automáticamente cuando el componente se elimina del DOM
  // Cancelamos la suscripción al router para evitar fugas de memoria
  ngOnDestroy(): void { this.routerSub.unsubscribe(); }
}

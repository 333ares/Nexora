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
export class Foro implements OnDestroy {
  usuario: any;
  /* Controla si el menú hamburguesa del subnav móvil está abierto */
  subnavOpen = false;
  private routerSub: Subscription;

  constructor(private authService: Auth, private router: Router) {
    this.usuario = this.authService.getUsuario();
    /* Cerrar el subnav móvil automáticamente al cambiar de sección */
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) this.subnavOpen = false;
    });
  }

  toggleSubnav(): void { this.subnavOpen = !this.subnavOpen; }
  closeSubnav(): void  { this.subnavOpen = false; }

  ngOnDestroy(): void { this.routerSub.unsubscribe(); }
}
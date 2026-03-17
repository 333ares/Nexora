import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css',
  encapsulation: ViewEncapsulation.None
})
export class Movimientos {
  usuario: any;

  constructor(private authService: Auth) {
    this.usuario = this.authService.getUsuario();
  }

}
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './foro.html',
  styleUrl: './foro.css',
  encapsulation: ViewEncapsulation.None
})
export class Foro {
  usuario: any;

  constructor(private authService: Auth) {
    this.usuario = this.authService.getUsuario();
  }
}
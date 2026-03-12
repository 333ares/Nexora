import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css',
  encapsulation: ViewEncapsulation.None
})
export class Movimientos {}
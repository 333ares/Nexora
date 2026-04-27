import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-acerca-de',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './acerca-de.html',
  styleUrl: './acerca-de.css',
})
export class AcercaDe {}

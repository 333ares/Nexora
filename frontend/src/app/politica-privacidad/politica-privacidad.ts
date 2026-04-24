import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './politica-privacidad.html',
  styleUrl: './politica-privacidad.css',
})
export class PoliticaPrivacidad {}

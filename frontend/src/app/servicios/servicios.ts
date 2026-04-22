import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelector } from '../language-selector/language-selector';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LanguageSelector],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios {}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios {}

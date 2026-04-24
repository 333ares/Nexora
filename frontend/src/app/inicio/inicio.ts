import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  isLoggedIn = false;


  emailNewsletter: string = '';

  suscribirse(): void {
    if (this.emailNewsletter) {
      console.log('Newsletter:', this.emailNewsletter);
      this.emailNewsletter = '';
    }
  }
}


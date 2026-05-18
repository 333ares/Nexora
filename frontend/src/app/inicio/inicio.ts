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
  isLoggedIn = false; // Variable para controlar si el usuario está logueado o no

  // Variable para almacenar el email del formulario de newsletter
  emailNewsletter: string = '';

  // Método para manejar el envío del formulario de newsletter
  suscribirse(): void {
    if (this.emailNewsletter) {
      console.log('Newsletter:', this.emailNewsletter);
      this.emailNewsletter = '';
    }
  }
}


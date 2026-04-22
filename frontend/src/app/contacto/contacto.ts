import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelector } from '../language-selector/language-selector';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslatePipe, LanguageSelector],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {
  nombre = '';
  email = '';
  asunto = '';
  mensaje = '';
  enviado = false;

  enviarFormulario(): void {
    if (this.nombre && this.email && this.asunto && this.mensaje) {
      // TODO: conectar con backend
      console.log('Contacto:', { nombre: this.nombre, email: this.email, asunto: this.asunto, mensaje: this.mensaje });
      this.enviado = true;
      this.nombre = '';
      this.email = '';
      this.asunto = '';
      this.mensaje = '';
    }
  }
}

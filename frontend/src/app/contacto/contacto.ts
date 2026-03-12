import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contacto',
  imports: [RouterLink],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {
  // Añade esto para solucionar el error TS2339
  onSubmit(event: any) {
    event.preventDefault(); // Evita que la página se recargue
    console.log('Formulario enviado');
    // Aquí irá la lógica para conectar con tu API de Laravel más adelante
  }
}

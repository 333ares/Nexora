import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {
  nombre: string = '';
  email: string = '';
  asunto: string = '';
  mensaje: string = '';
  enviado: boolean = false;

  enviarFormulario() {
    console.log('Formulario enviado:', {
      nombre: this.nombre,
      email: this.email,
      asunto: this.asunto,
      mensaje: this.mensaje
    });
    
    // Simular envío exitoso
    this.enviado = true;
    
    // Limpiar formulario después de 3 segundos
    setTimeout(() => {
      this.enviado = false;
      this.nombre = '';
      this.email = '';
      this.asunto = '';
      this.mensaje = '';
    }, 3000);
  }
}

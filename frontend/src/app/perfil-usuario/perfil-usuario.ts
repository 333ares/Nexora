import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [RouterLink,FormsModule],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css',
})
export class PerfilUsuario {

  user = {
    nombre: 'Arn',
    apellidos: 'Gómez',
    username: 'arngomez',
    email: 'arn@email.com'
  };

  transactions  = [
    { tipo: 'ingreso', concepto: 'Ingreso nómina', cantidad: 2000 },
    { tipo: 'gasto', concepto: 'Ocio', cantidad: 120 },
    { tipo: 'gasto', concepto: 'Comida', cantidad: 80 }
  ];



}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planes',
  imports: [CommonModule],
  templateUrl: './planes.html',
  styleUrl: './planes.css',
})
export class Planes {

  // Plan actualmente contratado por el usuario
  // Cambia este valor según lo que devuelva tu backend
  planActual: string = 'free';

  constructor(private router: Router) {}

  // Navega de vuelta a la pantalla de perfil
  onBack(): void {
    this.router.navigate(['/perfil']);
  }

  // Lógica para seleccionar un nuevo plan
  seleccionarPlan(plan: string): void {
    // TODO: conectar con el backend para actualizar el plan
    console.log('Plan seleccionado:', plan);
    this.planActual = plan;
  }

}

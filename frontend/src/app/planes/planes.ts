import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planes.html',
  styleUrl: './planes.css'
})
export class Planes {

  // Plan actualmente contratado por el usuario
  // TODO: obtener del backend / servicio de auth
  planActual: string = 'free';

  // Índice de la pregunta FAQ abierta (-1 = ninguna)
  faqAbierta: number = -1;

  constructor(private router: Router) {}

  // Navega de vuelta a la pantalla de perfil
  onBack(): void {
    this.router.navigate(['/perfil']);
  }

  // Selecciona un nuevo plan
  seleccionarPlan(plan: string): void {
    // TODO: conectar con el backend para actualizar el plan
    this.planActual = plan;
  }

  // Abre/cierra una pregunta del FAQ (acordeón: solo una abierta a la vez)
  toggleFaq(index: number): void {
    this.faqAbierta = this.faqAbierta === index ? -1 : index;
  }

}
import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FaqItem {
  id: number;
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, FormsModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {

emailNewsletter: string = '';
  faqAbierta: number = -1;

  faqItems: FaqItem[] = [
    {
      id: 0,
      pregunta: '¿Nexora es gratuito?',
      respuesta: 'Sí, el plan Free es completamente gratuito y sin límite de tiempo. Podrás registrar gastos e ingresos, visualizar el contenido de la academia y participar en los retos mensuales.'
    },
    {
      id: 1,
      pregunta: '¿Qué diferencia hay entre los planes de pago?',
      respuesta: 'Los planes Go, Advanced y Premium desbloquean estadísticas avanzadas, eliminan los anuncios, dan acceso al chatbot Kiro y a recomendaciones personalizadas. Advanced y Premium ofrecen descuentos al pagar por 6 o 12 meses.'
    },
    {
      id: 2,
      pregunta: '¿Qué es Kiro?',
      respuesta: 'Kiro es el consejero financiero con inteligencia artificial de Nexora. Puedes hacerle preguntas sobre tus gastos, pedir recomendaciones de ahorro o resolver dudas financieras en cualquier momento.'
    },
    {
      id: 3,
      pregunta: '¿Quién sube el contenido de la academia?',
      respuesta: 'Profesionales del ámbito económico y financiero que se registran en Nexora como creadores de contenido. Todo el material pasa por un proceso de validación para garantizar su calidad.'
    },
    {
      id: 4,
      pregunta: '¿Cómo funcionan los retos mensuales?',
      respuesta: 'Cada mes se publican nuevos retos financieros que puedes aceptar y completar. Son desafíos concretos y alcanzables diseñados para ayudarte a mejorar tus hábitos económicos paso a paso.'
    },
    {
      id: 5,
      pregunta: '¿Mis datos financieros están seguros?',
      respuesta: 'Absolutamente. Tus datos son privados y nunca los compartimos con terceros. La seguridad y privacidad de nuestra comunidad es una prioridad.'
    },
    {
      id: 6,
      pregunta: '¿Puedo cancelar mi suscripción en cualquier momento?',
      respuesta: 'Sí, puedes cancelar tu suscripción cuando quieras desde tu perfil. Al cancelar, seguirás teniendo acceso hasta que finalice el período pagado.'
    }
  ];

  toggleFaq(id: number): void {
    this.faqAbierta = this.faqAbierta === id ? -1 : id;
  }

  suscribirse(): void {
    if (this.emailNewsletter) {
      // TODO: conectar con backend
      console.log('Newsletter:', this.emailNewsletter);
      this.emailNewsletter = '';
    }
  }

  // Sombra del nav al hacer scroll
  @HostListener('window:scroll')
  onScroll(): void {
    const nav = document.querySelector('nav') as HTMLElement;
    if (nav) {
      nav.style.boxShadow = window.scrollY > 20
        ? '0 8px 32px rgba(78,156,37,0.18)'
        : '0 4px 24px rgba(78,156,37,0.12)';
    }
  }


}

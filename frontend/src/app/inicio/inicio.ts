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

  // Solo 3 preguntas en la home (resumen)
  faqItems: FaqItem[] = [
    {
      id: 0,
      pregunta: '¿Nexora es gratuito?',
      respuesta: 'Sí, el plan Free es completamente gratuito y sin límite de tiempo. Podrás registrar gastos e ingresos, visualizar el contenido de la academia y participar en los retos mensuales.'
    },
    {
      id: 1,
      pregunta: '¿Qué es Kiro?',
      respuesta: 'Kiro es el consejero financiero con inteligencia artificial de Nexora. Puedes hacerle preguntas sobre tus gastos, pedir recomendaciones de ahorro o resolver dudas financieras en cualquier momento.'
    },
    {
      id: 2,
      pregunta: '¿Mis datos financieros están seguros?',
      respuesta: 'Absolutamente. Tus datos son privados y nunca los compartimos con terceros. La seguridad y privacidad de nuestra comunidad es una prioridad.'
    }
  ];


  suscribirse(): void {
    if (this.emailNewsletter) {
      // TODO: conectar con backend
      console.log('Newsletter:', this.emailNewsletter);
      this.emailNewsletter = '';
    }
  }

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

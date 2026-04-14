import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FaqItem {
  id: number;
  pregunta: string;
  respuesta: string;
  categoria: string;
}

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './faqs.html',
  styleUrl: './faqs.css',
})
export class Faqs {
  faqItems: FaqItem[] = [
    {
      id: 0,
      categoria: 'general',
      pregunta: '¿Qué es Nexora?',
      respuesta: 'Nexora es una plataforma de gestión financiera personal que te ayuda a registrar y monitorizar tus gastos e ingresos, acceder a contenido educativo financiero y mejorar tus hábitos económicos día a día.'
    },
    {
      id: 1,
      categoria: 'planes',
      pregunta: '¿Nexora es gratuito?',
      respuesta: 'Sí, el plan Free es completamente gratuito y sin límite de tiempo. Podrás registrar gastos e ingresos, participar en el foro y en los retos mensuales.'
    },
    {
      id: 2,
      categoria: 'planes',
      pregunta: '¿Qué diferencia hay entre los planes de pago?',
      respuesta: 'Los planes Go, Advanced y Premium desbloquean estadísticas avanzadas, eliminan los anuncios, dan acceso al chatbot Kiro y a recomendaciones personalizadas. Advanced y Premium ofrecen descuentos al pagar por 6 o 12 meses.'
    },
    {
      id: 3,
      categoria: 'funcionalidades',
      pregunta: '¿Qué es Kiro?',
      respuesta: 'Kiro es el consejero financiero con inteligencia artificial de Nexora. Puedes hacerle preguntas sobre tus gastos, pedir recomendaciones de ahorro o resolver dudas financieras en cualquier momento.'
    },
    {
      id: 4,
      categoria: 'funcionalidades',
      pregunta: '¿Quién puede participar en el foro?',
      respuesta: 'Cualquier usuario registrado en Nexora puede hacer preguntas, responder a las dudas de otros y debatir sobre economía y finanzas personales.'
    },
    {
      id: 5,
      categoria: 'funcionalidades',
      pregunta: '¿Cómo funcionan los retos mensuales?',
      respuesta: 'Cada mes se publican nuevos retos financieros que puedes aceptar y completar. Son desafíos concretos y alcanzables diseñados para ayudarte a mejorar tus hábitos económicos paso a paso.'
    },
    {
      id: 6,
      categoria: 'seguridad',
      pregunta: '¿Mis datos financieros están seguros?',
      respuesta: 'Absolutamente. Utilizamos cifrado AES-256 para todos tus datos y nunca compartimos tu información con terceros. Tu privacidad es nuestra prioridad.'
    },
    {
      id: 7,
      categoria: 'planes',
      pregunta: '¿Puedo cancelar mi suscripción en cualquier momento?',
      respuesta: 'Sí, puedes cancelar tu suscripción cuando quieras desde tu perfil. Al cancelar, seguirás teniendo acceso hasta que finalice el período pagado y luego pasarás al plan Free.'
    },
    {
      id: 8,
      categoria: 'planes',
      pregunta: '¿Puedo cambiar de plan en cualquier momento?',
      respuesta: 'Sí, puedes cambiar de plan cuando quieras desde tu perfil. Los cambios se aplican inmediatamente y el ajuste de precio se calcula de forma proporcional al tiempo restante.'
    },
    {
      id: 9,
      categoria: 'planes',
      pregunta: '¿Qué métodos de pago aceptáis?',
      respuesta: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) y PayPal. Todos los pagos se procesan de forma segura con cifrado SSL.'
    },
    {
      id: 10,
      categoria: 'general',
      pregunta: '¿Hay período de prueba gratuito?',
      respuesta: 'El plan Free es gratuito para siempre y no requiere tarjeta. Te permite registrar gastos, participar en el foro y en retos mensuales sin coste alguno.'
    },
    {
      id: 11,
      categoria: 'funcionalidades',
      pregunta: '¿Qué es el método Kakebo?',
      respuesta: 'Kakebo es un método japonés de gestión financiera personal que consiste en registrar todos tus ingresos y gastos divididos en categorías (supervivencia, ocio, cultura e imprevistos) para tomar conciencia de tus hábitos de consumo y ahorrar de forma progresiva.'
    },
    {
      id: 12,
      categoria: 'seguridad',
      pregunta: '¿Nexora vende mis datos a terceros?',
      respuesta: 'No, nunca vendemos ni compartimos tus datos personales o financieros con terceros. Tu información es privada y está protegida conforme al RGPD.'
    },
    {
      id: 13,
      categoria: 'general',
      pregunta: '¿En qué dispositivos puedo usar Nexora?',
      respuesta: 'Nexora es una aplicación web responsive que funciona en cualquier navegador moderno, tanto en ordenador como en tablet o móvil.'
    },
    {
      id: 14,
      categoria: 'funcionalidades',
      pregunta: '¿Puedo exportar mis datos?',
      respuesta: 'Sí, puedes exportar tus movimientos financieros en formato CSV desde la sección de movimientos. Esta funcionalidad está disponible en todos los planes.'
    }
  ];
}

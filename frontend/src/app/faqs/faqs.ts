import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageSelector } from '../language-selector/language-selector';

interface FaqItem {
  id: number;
  pregunta: string;
  respuesta: string;
  categoria: string;
}

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslatePipe, LanguageSelector],
  templateUrl: './faqs.html',
  styleUrl: './faqs.css',
})
export class Faqs {
  faqKeys = [
    { id: 0, categoria: 'general', qKey: 'FAQS_PAGE.Q0', aKey: 'FAQS_PAGE.A0' },
    { id: 1, categoria: 'planes', qKey: 'FAQS_PAGE.Q1', aKey: 'FAQS_PAGE.A1' },
    { id: 2, categoria: 'planes', qKey: 'FAQS_PAGE.Q2', aKey: 'FAQS_PAGE.A2' },
    { id: 3, categoria: 'funcionalidades', qKey: 'FAQS_PAGE.Q3', aKey: 'FAQS_PAGE.A3' },
    { id: 4, categoria: 'funcionalidades', qKey: 'FAQS_PAGE.Q4', aKey: 'FAQS_PAGE.A4' },
    { id: 5, categoria: 'funcionalidades', qKey: 'FAQS_PAGE.Q5', aKey: 'FAQS_PAGE.A5' },
    { id: 6, categoria: 'seguridad', qKey: 'FAQS_PAGE.Q6', aKey: 'FAQS_PAGE.A6' },
    { id: 7, categoria: 'planes', qKey: 'FAQS_PAGE.Q7', aKey: 'FAQS_PAGE.A7' },
    { id: 8, categoria: 'planes', qKey: 'FAQS_PAGE.Q8', aKey: 'FAQS_PAGE.A8' },
    { id: 9, categoria: 'planes', qKey: 'FAQS_PAGE.Q9', aKey: 'FAQS_PAGE.A9' },
    { id: 10, categoria: 'general', qKey: 'FAQS_PAGE.Q10', aKey: 'FAQS_PAGE.A10' },
    { id: 11, categoria: 'funcionalidades', qKey: 'FAQS_PAGE.Q11', aKey: 'FAQS_PAGE.A11' },
    { id: 12, categoria: 'seguridad', qKey: 'FAQS_PAGE.Q12', aKey: 'FAQS_PAGE.A12' },
    { id: 13, categoria: 'general', qKey: 'FAQS_PAGE.Q13', aKey: 'FAQS_PAGE.A13' },
    { id: 14, categoria: 'funcionalidades', qKey: 'FAQS_PAGE.Q14', aKey: 'FAQS_PAGE.A14' }
  ];
}

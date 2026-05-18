import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.css'
})
export class LanguageSelector {
  // Controla si el menú de selección de idioma está abierto o cerrado
  isOpen = false;

  // Lista de idiomas disponibles con su código, etiqueta y bandera
  languages = [
    { code: 'es', label: 'Español', flag: '' },
    { code: 'en', label: 'English', flag: '' },
    { code: 'ca', label: 'Català', flag: '' }
  ];

  // El idioma actualmente seleccionado (por defecto el primero de la lista)
  currentLang: { code: string; label: string; flag: string };

  constructor(private translate: TranslateService) {
    // Intentamos cargar el idioma guardado en localStorage, si no hay ninguno, usamos el español por defecto
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null;
    const langCode = saved || 'es';
    this.currentLang = this.languages.find(l => l.code === langCode) || this.languages[0];
  }

  // Abre o cierra el menú de selección de idioma
  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  // Cierra el menú de selección de idioma
  close(): void {
    this.isOpen = false;
  }

  // Cambia el idioma de la aplicación y lo guarda en localStorage
  selectLang(lang: { code: string; label: string; flag: string }): void {
    // Cambiamos el idioma actual, le decimos a ngx-translate que use el nuevo idioma y lo guardamos en localStorage para futuras visitas
    this.currentLang = lang;
    this.translate.use(lang.code);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', lang.code);
    }
    this.isOpen = false;
  }
}

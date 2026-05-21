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
  isOpen = false;

  languages = [
    { code: 'es', label: 'Español', flag: '' },
    { code: 'en', label: 'English', flag: '' },
    { code: 'ca', label: 'Català', flag: '' }
  ];

  currentLang: { code: string; label: string; flag: string };

  constructor(private translate: TranslateService) {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null;
    const langCode = saved || 'es';
    this.currentLang = this.languages.find(l => l.code === langCode) || this.languages[0];
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  close(): void {
    this.isOpen = false;
  }

  selectLang(lang: { code: string; label: string; flag: string }): void {
    this.currentLang = lang;
    this.translate.use(lang.code);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', lang.code);
    }
    this.isOpen = false;
  }
}

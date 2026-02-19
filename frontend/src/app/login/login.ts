import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit, OnDestroy {

  showPassword = false;

  quotes = [
    { text: '"El precio es lo que pagas, el valor es lo que recibes"', author: '– Warren Buffett' },
    { text: '"No ahorres lo que te queda después de gastar, gasta lo que te queda después de ahorrar"', author: '– Warren Buffett' },
    { text: '"La inversión en conocimiento paga el mejor interés"', author: '– Benjamin Franklin' },
    { text: '"El dinero es un buen sirviente pero un mal amo"', author: '– Francis Bacon' },
    { text: '"Nunca gastes tu dinero antes de ganarlo"', author: '– Thomas Jefferson' },
  ];

  currentIndex = 0;
  private carouselTimer: any;

  // NgZone es necesario para que el setInterval dispare la detección
  // de cambios de Angular correctamente
  constructor(private zone: NgZone) {}

  ngOnInit() {
    // Ejecutamos el timer DENTRO de la zona de Angular
    this.zone.run(() => {
      this.carouselTimer = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
      }, 3000);
    });
  }

  ngOnDestroy() {
    clearInterval(this.carouselTimer);
  }

  goTo(index: number) {
    this.currentIndex = index;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
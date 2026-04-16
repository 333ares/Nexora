import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass, isPlatformBrowser } from '@angular/common';
import { Auth } from '../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit, OnDestroy {
  showPassword = false;
  currentIndex = 0;
  successMessage: string = '';
  private timer: any;
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: Auth, private router: Router, private cdr: ChangeDetectorRef) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['registrado']) {
      this.successMessage = 'Te has registrado correctamente, inicia sesión';
    }
  }

  isLoading = false;

  onLogin() {
    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.authService.saveUsuario(response.usuario);
        this.router.navigate(['/movimientos']);
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        if (typeof error.error?.errors === 'object') {
          const firstErrorKey = Object.keys(error.error.errors)[0];
          this.errorMessage = error.error.errors[firstErrorKey][0];
        } else {
          this.errorMessage = error.error?.errors || 'Error al iniciar sesión';
        }
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  quotes = [
    { text: '"El precio es lo que pagas, el valor es lo que recibes"', author: '– Warren Buffett' },
    { text: '"Comprar por impulso es pagar por ansiedad"', author: '– Antonie de Saint-Exupéry' },
    { text: '"La inversión en conocimiento paga el mejor interés"', author: '– Benjamin Franklin' },
    { text: '"El dinero es un buen sirviente pero un mal amo"', author: '– Francis Bacon' },
    { text: '"Nunca gastes tu dinero antes de ganarlo"', author: '– Thomas Jefferson' },
  ];

  ngOnInit(): void {
    this.timer = setInterval(() => this.next(), 4000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
    this.cdr.detectChanges();
  }

  goTo(index: number): void {
    this.currentIndex = index;
  }
}
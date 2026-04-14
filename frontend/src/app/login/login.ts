import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID
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

  quotes = [
    { text: '"El precio es lo que pagas, el valor es lo que recibes"', author: '– Warren Buffett' },
    { text: '"Comprar por impulso es pagar por ansiedad"', author: '– Antonie de Saint-Exupéry' },
    { text: '"La inversión en conocimiento paga el mejor interés"', author: '– Benjamin Franklin' },
    { text: '"El dinero es un buen sirviente pero un mal amo"', author: '– Francis Bacon' },
    { text: '"Nunca gastes tu dinero antes de ganarlo"', author: '– Thomas Jefferson' },
  ];

  currentIndex = 0;
  private intervalId?: ReturnType<typeof setInterval>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: Auth,
    private router: Router
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['registrado']) {
      this.successMessage = 'Te has registrado correctamente, inicia sesión';
    }
  }

  successMessage: string = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => {
        this.currentIndex =
          this.currentIndex + 1 >= this.quotes.length
            ? 0
            : this.currentIndex + 1;
      }, 3000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  goTo(index: number): void {
    this.currentIndex = index;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  email: string = '';
  password: string = '';
  errorMessage: string = '';
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
        if (typeof error.error?.errors === 'object') {
          const firstErrorKey = Object.keys(error.error.errors)[0];
          this.errorMessage = error.error.errors[firstErrorKey][0];
        } else {
          this.errorMessage = error.error?.errors || 'Error al iniciar sesión';
        }
      }
    });
  }

}
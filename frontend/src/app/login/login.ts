import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass, isPlatformBrowser } from '@angular/common';
import { Auth } from '../services/auth';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit, OnDestroy {

  showPassword = false;

  quotes = [
    { text: 'QUOTES.Q1.text', author: 'QUOTES.Q1.author' },
    { text: 'QUOTES.Q2.text', author: 'QUOTES.Q2.author' },
    { text: 'QUOTES.Q3.text', author: 'QUOTES.Q3.author' },
    { text: 'QUOTES.Q4.text', author: 'QUOTES.Q4.author' },
    { text: 'QUOTES.Q5.text', author: 'QUOTES.Q5.author' },
  ];

  currentIndex = 0;
  private intervalId?: ReturnType<typeof setInterval>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: Auth,
    private router: Router,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['registrado']) {
      this.successMessage = this.translateService.instant('LOGIN.SUCCESS_REGISTERED');
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
        this.cdr.markForCheck();
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
          this.errorMessage = error.error?.errors || this.translateService.instant('LOGIN.ERROR_DEFAULT');
        }
      }
    });
  }

}
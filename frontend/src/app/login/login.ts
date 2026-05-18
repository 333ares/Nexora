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

  // Para mostrar el password en texto plano o no
  showPassword = false;

  // Frases motivadoras para mostrar en el login
  quotes = [
    { text: 'QUOTES.Q1.text', author: 'QUOTES.Q1.author' },
    { text: 'QUOTES.Q2.text', author: 'QUOTES.Q2.author' },
    { text: 'QUOTES.Q3.text', author: 'QUOTES.Q3.author' },
    { text: 'QUOTES.Q4.text', author: 'QUOTES.Q4.author' },
    { text: 'QUOTES.Q5.text', author: 'QUOTES.Q5.author' },
  ];

  // Índice para mostrar la frase actual
  currentIndex = 0;
  // Intervalo para cambiar la frase cada 3 segundos
  private intervalId?: ReturnType<typeof setInterval>;

  // Constructor con inyección de dependencias
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: Auth,
    private router: Router,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    // Comprobamos si venimos de la página de registro para mostrar un mensaje de éxito
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['registrado']) {
      this.successMessage = this.translateService.instant('LOGIN.SUCCESS_REGISTERED'); // Mensaje de éxito traducido
    }
  }

  // Mensaje de éxito para mostrar si venimos de la página de registro
  successMessage: string = '';

  // Método para iniciar el cambio de frases motivadoras al cargar el componente
  ngOnInit(): void {
    // Si estamos en el navegador, iniciamos el intervalo para cambiar las frases cada 3 segundos
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

  // Método para limpiar el intervalo al salir del componente 
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Método para cambiar manualmente a una frase específica al hacer clic en los puntos de navegación
  goTo(index: number): void {
    this.currentIndex = index;
  }

  // Método para alternar la visibilidad del password
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Variables para almacenar el email, etc
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading = false;

  onLogin() {
    // Limpiamos el mensaje de error y mostramos el spinner de carga
    this.isLoading = true;
    //
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        // Guardamos el token del usuario y a este en localstorage
        this.authService.saveToken(response.token);
        this.authService.saveUsuario(response.usuario);

        // Se redirige en base a si eres admin o usuario normal
        if (Number(response.usuario?.id) === 1) {
          this.router.navigate(['/panel-admin']);
        } else {
          this.router.navigate(['/movimientos']);
        }
      },
      error: (error) => {
        this.cdr.detectChanges();
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
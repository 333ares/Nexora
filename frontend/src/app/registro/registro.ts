import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../services/auth';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit, OnDestroy {
  formulario: FormGroup;
  showPassword = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: Auth, private router: Router, private cdr: ChangeDetectorRef) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      nombre_usuario: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)]],
    });
  }

  isLoading = false;

  onSubmit() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const datos = {
      nombre: this.formulario.value.nombre,
      apellidos: this.formulario.value.apellidos,
      usuario: this.formulario.value.nombre_usuario,
      email: this.formulario.value.correo,
      password: this.formulario.value.contrasena,
    };

    this.authService.registro(datos).subscribe({
      next: () => {
        this.router.navigate(['/login'], { state: { registrado: true } });
      },
      error: (error) => {
        this.isLoading = false;
        if (typeof error.error?.errors === 'object') {
          const firstErrorKey = Object.keys(error.error.errors)[0];
          this.errorMessage = error.error.errors[firstErrorKey][0];
        } else {
          this.errorMessage = error.error?.errors || 'Error al registrarse';
        }
      }
    });
  }


  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  quotes = [
    { text: 'QUOTES.Q1.text', author: 'QUOTES.Q1.author' },
    { text: 'QUOTES.Q6.text', author: 'QUOTES.Q6.author' },
    { text: 'QUOTES.Q3.text', author: 'QUOTES.Q3.author' },
    { text: 'QUOTES.Q4.text', author: 'QUOTES.Q4.author' },
    { text: 'QUOTES.Q5.text', author: 'QUOTES.Q5.author' },
  ];

  currentIndex = 0;
  private timer: any;

  ngOnInit() {
    this.timer = setInterval(() => this.next(), 4000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
    this.cdr.markForCheck();
  }

  goTo(i: number) {
    this.currentIndex = i;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.next(), 4000);
  }
}
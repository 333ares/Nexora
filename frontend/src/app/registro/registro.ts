import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit, OnDestroy {
  formulario: FormGroup;
  showPassword = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: Auth, private router: Router) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      nombre_usuario: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)]],
    });
  }

  onSubmit() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

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
        console.error(error);
        this.errorMessage = error.error?.errors || 'Error al registrarse';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  quotes = [
    { text: '"El precio es lo que pagas, el valor es lo que recibes"', author: '– Warren Buffett' },
    { text: '"No ahorres lo que te queda después de gastar, gasta lo que te queda después de ahorrar"', author: '– Warren Buffett' },
    { text: '"La inversión en conocimiento paga el mejor interés"', author: '– Benjamin Franklin' },
    { text: '"El dinero es un buen sirviente pero un mal amo"', author: '– Francis Bacon' },
    { text: '"Nunca gastes tu dinero antes de ganarlo"', author: '– Thomas Jefferson' },
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
  }

  goTo(i: number) {
    this.currentIndex = i;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.next(), 4000);
  }
}
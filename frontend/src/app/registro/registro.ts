import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
formulario: FormGroup; //Se define el objeto formulario

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      nombre_usuario: ['', [Validators.required]],
      correo_electronico: ['', [Validators.required]],
      contraseña: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)]],
    });
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
  
  /* NMO SABEMOS SI SE VA A USAR FINALMENTE
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  */


}

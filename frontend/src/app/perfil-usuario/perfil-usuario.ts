import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css'
})
export class PerfilUsuario {

  showPassword = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
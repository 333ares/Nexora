import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [RouterLink,FormsModule],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css',
})
export class PerfilUsuario {

  showPassword = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }



}

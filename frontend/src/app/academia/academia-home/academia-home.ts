import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-academia-home',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf],
  templateUrl: './academia-home.html',
  styleUrls: ['./academia-home.css']
})
export class AcademiaHome {

  mostrarModalVerificar = false;
  linkedinUrl = '';
  declarado = false;
  linkedinError = '';

  abrirVerificacion(): void {
    this.mostrarModalVerificar = true;
  }

  cerrarVerificacion(): void {
    this.mostrarModalVerificar = false;
    this.linkedinError = '';
  }

  enviarVerificacion(): void {
    this.linkedinError = '';

    if (!this.linkedinUrl.trim()) {
      this.linkedinError = 'El enlace de LinkedIn es obligatorio.';
      return;
    }

    if (!this.linkedinUrl.includes('linkedin.com')) {
      this.linkedinError = 'Introduce un enlace válido de LinkedIn.';
      return;
    }

    if (!this.declarado) {
      this.linkedinError = 'Debes declarar que la información es veraz.';
      return;
    }

    // Aquí iría la llamada al backend
    this.mostrarModalVerificar = false;
    this.linkedinUrl = '';
    this.declarado = false;
  }
}
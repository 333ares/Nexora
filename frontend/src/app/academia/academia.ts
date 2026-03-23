import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../services/auth';

declare var bootstrap: any;

@Component({
  selector: 'app-academia',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './academia.html',
  styleUrl: './academia.css'
})
export class Academia implements OnInit {

  linkedinUrl = '';
  declarado = false;
  linkedinError = '';

  constructor(private authService: Auth) {}

  ngOnInit(): void {}

  // ── Botón "Subir contenido" ──────────────────────────────────────────
  // Si el usuario ya está verificado → abre modal subir
  // Si no → abre modal verificar
  abrirSubirOVerificar(): void {
    const usuario = this.authService.getUsuario();
    const modalId = usuario?.verificado ? 'modalSubir' : 'modalVerificar';
    const el = document.getElementById(modalId);
    if (el) {
      const modal = new bootstrap.Modal(el);
      modal.show();
    }
  }

  // ── Enviar verificación ──────────────────────────────────────────────
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

    // Aquí iría la llamada al servicio cuando el backend esté listo
    // this.authService.verificarCuenta({ linkedin: this.linkedinUrl }).subscribe(...)

    // Mientras tanto cerramos el modal y mostramos confirmación
    const el = document.getElementById('modalVerificar');
    if (el) {
      const modal = bootstrap.Modal.getInstance(el);
      modal?.hide();
    }

    // Resetear estado
    this.linkedinUrl = '';
    this.declarado = false;
  }
}
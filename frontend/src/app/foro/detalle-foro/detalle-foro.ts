import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';

export interface Respuesta {
  id: number;
  autor: string;
  contenido: string;
  fecha: Date;
  votos: number;
  yaVotada?: boolean;
}

export interface PreguntaDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  respuestas: number;
  visitas: number;
  miembros: number;
  fecha: Date;
  autor: string;
  unido: boolean;
}

export interface Notificacion {
  id: number;
  tipo: 'error' | 'exito';
  mensaje: string;
}

@Component({
  selector: 'app-detalle-foro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-foro.html',
  styleUrl: './detalle-foro.css'
})
export class DetalleForo implements OnInit {

  pregunta: PreguntaDetalle | null = null;
  respuestas: Respuesta[] = [];
  nuevaRespuesta = '';
  popupUnirseAbierto = false;
  popupSalirAbierto = false;
  cargando = true;
  uniendose = false;
  saliendo = false;
  errorUnirse: string | null = null;
  publicando = false;
  notificaciones: Notificacion[] = [];
  private IDmembresia: number | null = null;
  private notifId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.auth.visitarForo(id).subscribe({
      next: (res) => {
        const f = res.foro;
        const miUsuario = this.auth.getUsuario()?.id;
        const membresia = Array.isArray(f.miembros)
          ? f.miembros.find((m: any) => m.IDusuario === miUsuario)
          : null;
        this.IDmembresia = membresia?.IDmiembro ?? null;
        this.pregunta = {
          id: f.IDforo,
          titulo: f.titulo,
          descripcion: f.contenido,
          respuestas: f.respuestas?.length ?? 0,
          visitas: f.visitas,
          miembros: f.miembros?.length ?? 0,
          fecha: new Date(f.created_at),
          autor: f.creador ?? f.IDusuario,
          unido: !!membresia
        };
        this.respuestas = (f.respuestas ?? []).map((r: any) => ({
          id: r.IDrespuesta,
          autor: r.creador ?? r.IDusuario,
          contenido: r.respuesta,
          fecha: new Date(r.created_at),
          votos: r.votos ?? 0,
          yaVotada: r.yaVotada ?? false
        }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando foro', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirUnirse() { this.popupUnirseAbierto = true; }
  cerrarUnirse() { this.popupUnirseAbierto = false; this.errorUnirse = null; }

  abrirSalir() { this.popupSalirAbierto = true; }
  cerrarSalir() { this.popupSalirAbierto = false; }

  mostrarError(err: any, mensajeFront: string) {
    const mensaje = err?.error?.message ?? err?.error?.error ?? err?.message ?? mensajeFront;
    const id = ++this.notifId;
    this.notificaciones.push({ id, tipo: 'error', mensaje });
    setTimeout(() => this.cerrarNotificacion(id), 5000);
  }

  cerrarNotificacion(id: number) {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
  }

  confirmarUnirse() {
    if (!this.pregunta) return;
    this.uniendose = true;
    this.auth.unirseAForo(this.pregunta.id).subscribe({
      next: (res) => {
        this.IDmembresia = res.miembro.IDmiembro;
        this.pregunta!.unido = true;
        this.pregunta!.miembros++;
        this.uniendose = false;
        this.cerrarUnirse();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uniendose = false;
        this.errorUnirse = err?.error?.errors ?? err?.error?.message ?? 'No se pudo unir al foro.';
        this.cdr.detectChanges();
      }
    });
  }

  confirmarSalir() {
    if (!this.pregunta || !this.IDmembresia) return;
    this.saliendo = true;
    this.auth.salirDeForo(this.IDmembresia).subscribe({
      next: () => {
        this.IDmembresia = null;
        this.pregunta!.unido = false;
        this.pregunta!.miembros--;
        this.saliendo = false;
        this.cerrarSalir();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saliendo = false;
        this.mostrarError(err, 'No se pudo salir del foro');
        this.cdr.detectChanges();
      }
    });
  }

  publicarRespuesta() {
    if (!this.pregunta || !this.nuevaRespuesta.trim()) return;
    this.publicando = true;
    this.auth.responderForo({ IDforo: this.pregunta.id, respuesta: this.nuevaRespuesta }).subscribe({
      next: (res) => {
        const r = res.respuesta;
        this.respuestas.push({
          id: r.IDrespuesta,
          autor: r.creador ?? r.IDusuario,
          contenido: r.respuesta,
          fecha: new Date(r.created_at),
          votos: 0,
          yaVotada: false
        });
        this.pregunta!.respuestas++;
        this.nuevaRespuesta = '';
        this.publicando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.publicando = false;
        this.mostrarError(err, 'No se pudo publicar la respuesta');
        this.cdr.detectChanges();
      }
    });
  }

  getAvatarUrl(nombre: string): string {
    if (!nombre) return '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre.trim())}&background=random`;
  }

  toggleVotoRespuesta(r: Respuesta) {
    this.auth.toggleVotoRespuesta(r.id).subscribe({
      next: (res) => {
        const votado = res.votado ?? !r.yaVotada;
        r.votos += votado ? 1 : -1;
        r.yaVotada = votado;
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError(err, 'No se pudo registrar el voto')
    });
  }
}
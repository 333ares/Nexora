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
  cargando = true;
  private IDmembresia: number | null = null;

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
        const miUsuario = this.auth.getUsuario()?.IDusuario;
        const membresia = Array.isArray(f.miembros)
          ? f.miembros.find((m: any) => m.IDusuario === miUsuario)
          : null;
        this.IDmembresia = membresia?.IDmembresia ?? null;
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
          contenido: r.contenido,
          fecha: new Date(r.created_at),
          votos: r.votos ?? 0,
          yaVotada: false
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

  volver() {
    this.router.navigate(['/foro/ver']);
  }

  abrirUnirse() { this.popupUnirseAbierto = true; }
  cerrarUnirse() { this.popupUnirseAbierto = false; }

  confirmarUnirse() {
    if (!this.pregunta) return;
    this.auth.unirseAForo(this.pregunta.id).subscribe({
      next: (res) => {
        this.IDmembresia = res.miembro.IDmembresia;
        this.pregunta!.unido = true;
        this.pregunta!.miembros++;
        this.cerrarUnirse();
      },
      error: (err) => console.error('Error al unirse', err)
    });
  }

  salirDelForo() {
    if (!this.pregunta || !this.IDmembresia) return;
    this.auth.salirDeForo(this.IDmembresia).subscribe({
      next: () => {
        this.IDmembresia = null;
        this.pregunta!.unido = false;
        this.pregunta!.miembros--;
      },
      error: (err) => console.error('Error al salir', err)
    });
  }

  publicarRespuesta() {
    if (!this.pregunta || !this.nuevaRespuesta.trim()) return;
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
      },
      error: (err) => console.error('Error publicando respuesta', err)
    });
  }

  toggleVotoRespuesta(r: Respuesta) {
    this.auth.toggleVotoRespuesta(r.id).subscribe({
      next: (res) => {
        // El back devuelve si se añadió o quitó el voto
        const votado = res.votado ?? !r.yaVotada;
        r.votos += votado ? 1 : -1;
        r.yaVotada = votado;
      },
      error: (err) => console.error('Error al votar', err)
    });
  }
}
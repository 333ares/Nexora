import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

// Define la estructura de datos de una respuesta dentro de un foro
export interface Respuesta {
  id: number;
  autor: string;
  contenido: string;
  fecha: Date;
  votos: number;
  yaVotada?: boolean; // true si el usuario actual ya votó esta respuesta (opcional porque llega del servidor)
}

// Define la estructura de datos del foro que se muestra en detalle
export interface PreguntaDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  respuestas: number;
  visitas: number;
  miembros: number;
  fecha: Date;
  autor: string;
  unido: boolean; // true si el usuario actual ya es miembro de este foro
}

// Define la estructura de una notificación flotante (toast) que aparece en pantalla
export interface Notificacion {
  id: number; // ID único para poder cerrarla individualmente
  tipo: 'error' | 'exito'; // Controla el color/estilo de la notificación
  mensaje: string;
}

@Component({
  selector: 'app-visitar-foro',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './visitar-foro.html',
  styleUrl: './visitar-foro.css'
})
export class VisitarForo implements OnInit {

  pregunta: PreguntaDetalle | null = null; // Datos del foro que se está viendo (null mientras carga)
  respuestas: Respuesta[] = []; // Lista de respuestas del foro
  nuevaRespuesta = ''; // Texto que el usuario escribe para responder

  // Estado de los popups de membresía
  popupUnirseAbierto = false; // Controla si el popup "¿Unirse al foro?" está visible
  popupSalirAbierto = false; // Controla si el popup "¿Salir del foro?" está visible

  cargando = true; // true mientras se cargan los datos del servidor
  uniendose = false; // true mientras se procesa la petición de unirse
  saliendo = false; // true mientras se procesa la petición de salir
  errorUnirse: string | null = null;  // Error específico del popup de unirse

  publicando = false; // true mientras se envía una nueva respuesta al servidor
  errorRespuesta: string | null = null; // Error inline bajo el textarea de nueva respuesta

  // Variables de la edición inline de respuestas
  editandoId: number | null = null;  // ID de la respuesta que se está editando (null = ninguna)
  editContenido = ''; // Texto nuevo que el usuario escribe al editar
  guardandoEdit = false; // true mientras se envía la edición al servidor

  // Variables del popup de borrado de respuestas
  respuestaParaBorrar: Respuesta | null = null; // Respuesta seleccionada para borrar (null = popup cerrado)
  borrando = false; // true mientras se procesa el borrado

  notificaciones: Notificacion[] = [];  // Lista de notificaciones flotantes activas en pantalla
  private IDmembresia: number | null = null;  // ID de la membresía del usuario en este foro (necesario para salir)
  private notifId = 0;  // Contador que genera IDs únicos para cada notificación

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) { }

  // ngOnInit se ejecuta automáticamente cuando el componente carga por primera vez
  ngOnInit(): void {
    // Leemos el :id de la URL (ej: /foro/detalle/42 → id = 42)
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.auth.visitarForo(id).subscribe({
      next: (res) => {
        const f = res.foro;
        const miUsuario = this.auth.getUsuario()?.id;

        // Buscamos si el usuario actual está en la lista de miembros del foro
        const membresia = Array.isArray(f.miembros)
          ? f.miembros.find((m: any) => m.IDusuario === miUsuario)
          : null;

        this.IDmembresia = membresia?.IDmiembro ?? null; // Guardamos el ID de membresía para usarlo al salir

        // Construimos el objeto PreguntaDetalle con los datos del servidor
        this.pregunta = {
          id: f.IDforo,
          titulo: f.titulo,
          descripcion: f.contenido,
          respuestas: f.respuestas?.length ?? 0,
          visitas: f.visitas,
          miembros: f.miembros?.length ?? 0,
          fecha: new Date(f.created_at),
          autor: f.creador ?? f.IDusuario,
          unido: !!membresia  // !! convierte el objeto (truthy) o null (falsy) a boolean
        };

        // Transformamos las respuestas al formato Respuesta que usa el frontend
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

  // Abre y cierra el popup de unirse al foro
  abrirUnirse() { this.popupUnirseAbierto = true; }
  cerrarUnirse() { this.popupUnirseAbierto = false; this.errorUnirse = null; }

  // Abre y cierra el popup de salir del foro
  abrirSalir() { this.popupSalirAbierto = true; }
  cerrarSalir() { this.popupSalirAbierto = false; }

  // Muestra una notificación de error flotante que desaparece sola después de 5 segundos
  // mensajeFront es el texto por defecto si el servidor no devuelve ninguno
  mostrarError(err: any, mensajeFront: string) {
    const mensaje = err?.error?.message ?? err?.error?.error ?? err?.message ?? mensajeFront;
    const id = ++this.notifId; // Generamos un ID único incrementando el contador
    this.notificaciones.push({ id, tipo: 'error', mensaje });
    setTimeout(() => this.cerrarNotificacion(id), 5000); // Cierra automáticamente tras 5 segundos
  }

  // Elimina una notificación concreta de la lista por su ID
  cerrarNotificacion(id: number) {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
  }

  // El usuario confirmó que quiere unirse: enviamos la petición al servidor
  confirmarUnirse() {
    if (!this.pregunta) return;
    this.uniendose = true;
    this.auth.unirseAForo(this.pregunta.id).subscribe({
      next: (res) => {
        // Actualizamos el estado local sin recargar la página
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

  // El usuario confirmó que quiere salir: enviamos la petición al servidor
  confirmarSalir() {
    if (!this.pregunta || !this.IDmembresia) return;
    this.saliendo = true;
    this.auth.salirDeForo(this.IDmembresia).subscribe({
      next: () => {
        // Actualizamos el estado local sin recargar la página
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

  // Envía una nueva respuesta al servidor y la añade al final de la lista local
  publicarRespuesta() {
    if (!this.pregunta || !this.nuevaRespuesta.trim()) return; // Validación mínima
    this.publicando = true;
    this.errorRespuesta = null;
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
        this.pregunta!.respuestas++; // Incrementamos el contador del foro
        this.nuevaRespuesta = '';    // Limpiamos el campo de texto
        this.errorRespuesta = null;
        this.publicando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.publicando = false;
        this.errorRespuesta = err?.error?.message ?? err?.error?.error ?? err?.message ?? 'No se pudo publicar la respuesta';
        this.cdr.detectChanges();
      }
    });
  }

  // Genera una URL de avatar con las iniciales del autor usando el servicio gratuito ui-avatars.com
  getAvatarUrl(nombre: string): string {
    if (!nombre) return '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre.trim())}&background=random`;
  }

  // Alterna el voto de una respuesta: si ya votó la quita, si no votó la añade
  toggleVotoRespuesta(r: Respuesta) {
    this.auth.toggleVotoRespuesta(r.id).subscribe({
      next: (res) => {
        const votado = res.votado ?? !r.yaVotada; // Confiamos en el servidor; si no responde, invertimos localmente
        r.votos += votado ? 1 : -1;
        r.yaVotada = votado;
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError(err, 'No se pudo registrar el voto')
    });
  }

  // Comprueba si una respuesta fue escrita por el usuario que está logueado
  // Sirve para mostrar u ocultar los botones de editar/borrar en el HTML
  esPropia(r: Respuesta): boolean {
    return r.autor === this.auth.getUsuario()?.usuario;
  }

  // Activa el modo edición en línea para una respuesta concreta
  iniciarEdicion(r: Respuesta): void {
    this.editandoId = r.id;
    this.editContenido = r.contenido; // Precargamos el texto actual para que el usuario lo modifique
  }

  // Cancela la edición sin guardar cambios
  cancelarEdicion(): void {
    this.editandoId = null;
    this.editContenido = '';
  }

  // Envía el texto editado al servidor y, si tiene éxito, actualiza la respuesta en la lista local
  guardarEdicion(r: Respuesta): void {
    if (!this.editContenido.trim()) return; // No enviamos si el contenido está vacío
    this.guardandoEdit = true;
    this.auth.modificarRespuesta({ IDrespuesta: r.id, respuesta: this.editContenido }).subscribe({
      next: () => {
        r.contenido = this.editContenido; // Actualizamos el texto directamente en el objeto local
        this.editandoId = null;
        this.editContenido = '';
        this.guardandoEdit = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardandoEdit = false;
        this.mostrarError(err, 'No se pudo editar la respuesta');
        this.cdr.detectChanges();
      }
    });
  }

  // Abre el popup de confirmación para borrar una respuesta
  pedirConfirmacionBorrar(r: Respuesta): void {
    this.respuestaParaBorrar = r;
  }

  // Cierra el popup de borrado sin hacer nada
  cerrarPopupBorrar(): void {
    this.respuestaParaBorrar = null;
  }

  // El usuario confirmó el borrado: enviamos la petición al servidor
  confirmarBorrar(): void {
    const r = this.respuestaParaBorrar;
    if (!r) return;
    this.borrando = true;
    this.auth.borrarRespuesta(r.id).subscribe({
      next: () => {
        // Si el servidor confirma, eliminamos la respuesta de la lista local y decrementamos el contador
        this.respuestas = this.respuestas.filter(x => x.id !== r.id);
        if (this.pregunta) this.pregunta.respuestas--;
        this.respuestaParaBorrar = null;
        this.borrando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.borrando = false;
        this.mostrarError(err, 'No se pudo borrar la respuesta');
        this.cdr.detectChanges();
      }
    });
  }
}

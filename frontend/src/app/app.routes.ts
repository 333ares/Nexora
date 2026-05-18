import { Routes } from '@angular/router';
import { Login } from './login/login';
import { PerfilUsuario } from './perfil-usuario/perfil-usuario';
import { Registro } from './registro/registro';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';
import { UserGuard } from './guards/user-guard';
import { Planes } from './planes/planes';
import { Movimientos } from './movimientos/movimientos';
import { Contacto } from './contacto/contacto';
import { Calendario } from './movimientos/calendario/calendario';
import { Estadisticas } from './movimientos/estadisticas/estadisticas';
import { Retos } from './movimientos/retos/retos';
import { Lista } from './movimientos/lista/lista';
import { Resumen } from './movimientos/resumen/resumen';
import { Inicio } from './inicio/inicio';
import { Servicios } from './servicios/servicios';
import { AcercaDe } from './acerca-de/acerca-de';
import { Faqs } from './faqs/faqs';
import { PoliticaPrivacidad } from './politica-privacidad/politica-privacidad';
import { PanelAdmin } from './panel-admin/panel-admin';
import { Foro } from './foro/foro';
import { UsuarioBloqueado } from './usuario-bloqueado/usuario-bloqueado';
import { LandingLayout } from './landing-layout/landing-layout';
import { ListarForos } from './foro/listar-foros/listar-foros';
import { MisForos } from './foro/mis-foros/mis-foros';
import { MisPreguntas } from './foro/mis-preguntas/mis-preguntas';
import { VisitarForo } from './foro/visitar-foro/visitar-foro';

export const routes: Routes = [

  // Rutas públicas agrupadas bajo LandingLayout (cabecera y footer de la landing)
  {
    path: '',
    component: LandingLayout,
    children: [
      { path: 'inicio', component: Inicio },
      { path: 'servicios', component: Servicios },
      { path: 'planes', component: Planes },
      { path: 'acerca-de', component: AcercaDe },
      { path: 'faqs', component: Faqs },
      { path: 'contacto', component: Contacto },
      { path: 'politica-privacidad', component: PoliticaPrivacidad },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ]
  },
  // Solo el admin (id=1) puede acceder; AuthGuard comprueba token y AdminGuard comprueba el id
  {
    path: 'panel-admin',
    component: PanelAdmin,
    canActivate: [AuthGuard, AdminGuard]
  },
  // Rutas sin guard: cualquiera puede acceder aunque no esté logueado
  {
    path: 'login',
    component: Login,
  },
  // AuthGuard exige token; UserGuard redirige al admin a su panel y a usuarios bloqueados a /usuario-bloqueado
  {
    path: 'perfil',
    component: PerfilUsuario,
    canActivate: [AuthGuard, UserGuard]
  },
  // Solo AuthGuard (sin UserGuard) para que un usuario bloqueado pueda ver esta pantalla sin bucle infinito
  {
    path: 'usuario-bloqueado',
    component: UsuarioBloqueado,
    canActivate: [AuthGuard]
  },
  {
    path: 'registro',
    component: Registro,
  },
  // Sección del foro con subrutas anidadas; todas protegidas por AuthGuard + UserGuard
  {
    path: 'foro',
    component: Foro,
    canActivate: [AuthGuard, UserGuard],
    children: [
      { path: 'ver', component: ListarForos },
      { path: 'mis-foros', component: MisForos },
      { path: 'mis-preguntas', component: MisPreguntas },
      { path: 'detalle/:id', component: VisitarForo }, // :id es el IDforo que pasa el componente padre
      { path: '', redirectTo: 'ver', pathMatch: 'full' }
    ]
  },
  // Sección de movimientos con subrutas anidadas; todas protegidas por AuthGuard + UserGuard
  {
    path: 'movimientos',
    component: Movimientos,
    canActivate: [AuthGuard, UserGuard],
    children: [
      { path: 'resumen', component: Resumen },
      { path: 'lista', component: Lista },
      { path: 'calendario', component: Calendario },
      { path: 'estadisticas', component: Estadisticas },
      { path: 'retos', component: Retos },
      { path: '', redirectTo: 'resumen', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' }
];

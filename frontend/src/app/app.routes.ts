import { Routes } from '@angular/router';
import { Login } from './login/login';
import { PerfilUsuario } from './perfil-usuario/perfil-usuario';
import { Registro } from './registro/registro';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';
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
import { VerForo } from './foro/ver-foro/ver-foro';
import { MisForos } from './foro/mis-foros/mis-foros';
import { MisPreguntas } from './foro/mis-preguntas/mis-preguntas';
import { Kiro } from './foro/kiro/kiro';
import { DetalleForo } from './foro/detalle-foro/detalle-foro';

export const routes: Routes = [

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
  {
    path: 'panel-admin',
    component: PanelAdmin,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'login', //es lo que aparece en la URL.
    component: Login, // Login es el componente que se mostrará
  },
  {
    path: 'perfil',
    component: PerfilUsuario,
    canActivate: [AuthGuard]
  },
  {
    path: 'usuario-bloqueado',
    component: UsuarioBloqueado,
    canActivate: [AuthGuard]
  },
  {
    path: 'registro',
    component: Registro,
  },
  {
    path: 'foro',
    component: Foro,
    canActivate: [AuthGuard],
    children: [
      { path: 'ver', component: VerForo },
      { path: 'mis-foros', component: MisForos },
      { path: 'mis-preguntas', component: MisPreguntas },
      { path: 'kiro', component: Kiro },
      { path: 'detalle/:id', component: DetalleForo },
      { path: '', redirectTo: 'ver', pathMatch: 'full' }
    ]
  },
  {
    path: 'movimientos',
    component: Movimientos,
    canActivate: [AuthGuard],
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
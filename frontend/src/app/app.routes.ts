import { Routes } from '@angular/router';
import { Login } from './login/login';
import { PerfilUsuario } from './perfil-usuario/perfil-usuario';
import { Registro } from './registro/registro';
import { AuthGuard } from './guards/auth-guard';
import { Planes } from './planes/planes';
import { Movimientos } from './movimientos/movimientos';
import { Contacto } from './contacto/contacto';
import { Calendario } from './movimientos/calendario/calendario';
import { Estadisticas } from './movimientos/estadisticas/estadisticas';
import { Retos } from './movimientos/retos/retos';
import { Lista } from './movimientos/lista/lista';
import { Resumen } from './movimientos/resumen/resumen';
import { Academia } from './academia/academia';
import { VerVideo } from './academia/ver-video/ver-video';
import { AdministrarContenido } from './academia/administrar-contenido/administrar-contenido';
import { AcademiaHome } from './academia/academia-home/academia-home';

export const routes: Routes = [
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
    path: 'registro',
    component: Registro,
  },
  {
    path: 'planes',
    component: Planes,
    canActivate: [AuthGuard]
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
  {
    path: 'contacto',
    component: Contacto,
    canActivate: [AuthGuard]
  },
  {
    path: 'academia',
    component: Academia,
    // canActivate: [AuthGuard],  
    children: [
      {
        path: '',
        component: AcademiaHome,          // pantalla principal (slider + popular)
      },
      {
        path: 'ver-video',
        component: VerVideo,              // vista detalle de video (estilo YouTube)
      },
      {
        path: 'administrar',
        component: AdministrarContenido,  // gestión de contenido propio
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' //Esto es para que si no pones nada en la URL te rerdiriga a el login
  }


];

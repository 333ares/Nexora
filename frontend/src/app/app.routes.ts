import { Routes } from '@angular/router';
import { Login } from './login/login';
import { PerfilUsuario } from './perfil-usuario/perfil-usuario';
import { Registro } from './registro/registro';
import { AuthGuard } from './guards/auth-guard';
import { Planes } from './planes/planes';

export const routes: Routes = [
  {
    path: 'login', //es lo que aparece en la URL.
    component: Login, // Login es el componente que se mostrará
  },
  {
    path: 'perfil',
    component: PerfilUsuario,
    //canActivate: [AuthGuard]
  },
  {
    path: 'registro',
    component: Registro,
  },
  {
    path: 'planes',
    component: Planes,
    //canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' //Esto es para que si no pones nada en la URL te rerdiriga a el login
  }




];

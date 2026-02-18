import { Routes } from '@angular/router';
import { Login } from './login/login';
import { PerfilUsuario } from './perfil-usuario/perfil-usuario';
import { Registro } from './registro/registro';


export const routes: Routes = [
  {
    path: 'login', //es lo que aparece en la URL.
    component: Login, // Login es el componente que se mostrará
  },
  {
    path: 'perfil',
    component: PerfilUsuario,
  },
  {
    path: 'registro',
    component: Registro,
  },
  {
  path: '',
  redirectTo: 'login',
  pathMatch: 'full' //Esto es para que ci no pones nada en la URL te rerdiriga a el login
}

];

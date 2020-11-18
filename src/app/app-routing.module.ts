import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadChildren: () => import('./page/inicio/inicio.module').then( m => m.InicioPageModule)
  },
  {
    path: 'registrar-proveedor',
    loadChildren: () => import('./page/registrar-proveedor/registrar-proveedor.module').then( m => m.RegistrarProveedorPageModule)
  },
  {
    path: 'registrar-usuario',
    loadChildren: () => import('./page/registrar-usuario/registrar-usuario.module').then( m => m.RegistrarUsuarioPageModule)
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

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
    loadChildren: () => import('./pages/inicio/inicio.module').then( m => m.InicioPageModule)
  },
  {
    path: 'registrar-proveedor',
    loadChildren: () => import('./page/pages/registrar-proveedor/registrar-proveedor.module').then( m => m.RegistrarProveedorPageModule)
  },
  {
    path: 'registrar-usuario',
    loadChildren: () => import('./page/pages/registrar-usuario/registrar-usuario.module').then( m => m.RegistrarUsuarioPageModule)
  },
  {
    path: 'venta',
    loadChildren: () => import('./page/venta/venta.module').then( m => m.VentaPageModule)
  },
  {
    path: 'registrar-cliente',
    loadChildren: () => import('./page/pages/registrar-cliente/registrar-cliente.module').then( m => m.RegistrarClientePageModule)
  },
  {
    path: 'ingreso-egreso',
    loadChildren: () => import('./page/pages/ingreso-egreso/ingreso-egreso.module').then( m => m.IngresoEgresoPageModule)
  },
  {
    path: 'pushpop-products',
    loadChildren: () => import('./page/pages/pushpop-products/pushpop-products.module').then( m => m.PushpopProductsPageModule)
  },




  {
    path: 'lista-de-usarios',
    loadChildren: () => import('./pages/lista-de-usarios/lista-de-usarios.module').then( m => m.ListaDeUsariosPageModule)
  },
  {
    path: 'lista-de-clientes',
    loadChildren: () => import('./pages/lista-de-clientes/lista-de-clientes.module').then( m => m.ListaDeClientesPageModule)
  },
  {
    path: 'lista-de-proveedores',
    loadChildren: () => import('./pages/lista-de-proveedores/lista-de-proveedores.module').then( m => m.ListaDeProveedoresPageModule)
  },
  {
    path: 'punto-venta',
    loadChildren: () => import('./pages/punto-venta/punto-venta.module').then( m => m.PuntoVentaPageModule)
  },
  {
    path: 'ingreso-egreso-gestor',
    loadChildren: () => import('./pages/ingreso-egreso-gestor/ingreso-egreso-gestor.module').then( m => m.IngresoEgresoGestorPageModule)
  }





];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

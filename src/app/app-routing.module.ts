import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoLoginGuard } from './guards/no-login.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canActivate: [NoLoginGuard]
  },
  {
    path: 'categorias-page',
    loadChildren: () => import('./pages/categorias-page/categorias-page.module').then( m => m.CategoriasPagePageModule),
    canActivate: [AuthGuard]
  },
  // {
  //   path: 'agregar-producto',
  //   loadChildren: () => import('./modals/agregar-producto/agregar-producto.module').then( m => m.AgregarProductoPageModule),
  //   canActivate: [AuthGuard]
  // },
  {
    path: 'detalles-producto/:id/:categoria/:sede',
    loadChildren: () => import('./pages/detalles-producto/detalles-producto.module').then( m => m.DetallesProductoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'editar-producto',
    loadChildren: () => import('./modals/editar-producto/editar-producto.module').then( m => m.EditarProductoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'agregar-producto/:sede/:categoria',
    loadChildren: () => import('./pages/agregar-producto/agregar-producto.module').then( m => m.AgregarProductoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'modal-agregar-producto',
    // tslint:disable-next-line:max-line-length
    loadChildren: () => import('./modals/modal-agregar-producto/modal-agregar-producto.module').then( m => m.ModalAgregarProductoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes',
    loadChildren: () => import('./pages/clientes/clientes.module').then( m => m.ClientesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'productos-lista/:categoria/:sede',
    loadChildren: () => import('./pages/productos-lista/productos-lista.module').then( m => m.ProductosListaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'buscador',
    loadChildren: () => import('./pages/buscador/buscador.module').then( m => m.BuscadorPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'ofertas',
    loadChildren: () => import('./pages/ofertas/ofertas.module').then( m => m.OfertasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'modal-subir-oferta',
    loadChildren: () => import('./modals/modal-subir-oferta/modal-subir-oferta.module').then( m => m.ModalSubirOfertaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pedidos',
    loadChildren: () => import('./pages/pedidos/pedidos.module').then( m => m.PedidosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'detalles-pedido/:id',
    loadChildren: () => import('./pages/detalles-pedido/detalles-pedido.module').then( m => m.DetallesPedidoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'modal-detalles-servicios',
    // tslint:disable-next-line:max-line-length
    loadChildren: () => import('./modals/modal-detalles-servicios/modal-detalles-servicios.module').then( m => m.ModalDetallesServiciosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tips',
    loadChildren: () => import('./pages/tips/tips.module').then( m => m.TipsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'modal-agregar-ver-tips',
    loadChildren: () => import('./modals/modal-agregar-ver-tips/modal-agregar-ver-tips.module').then( m => m.ModalAgregarVerTipsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'descuentos',
    loadChildren: () => import('./pages/descuentos/descuentos.module').then( m => m.DescuentosPageModule)
  },
  {
    path: 'modal-agregar-descuento',
    // tslint:disable-next-line:max-line-length
    loadChildren: () => import('./modals/modal-agregar-descuento/modal-agregar-descuento.module').then( m => m.ModalAgregarDescuentoPageModule)
  },
  {
    path: 'servicios/:tipo',
    loadChildren: () => import('./pages/servicios/servicios.module').then( m => m.ServiciosPageModule)
  },
  {
    path: 'punto-venta',
    loadChildren: () => import('./pages/punto-venta/punto-venta.module').then( m => m.PuntoVentaPageModule)
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

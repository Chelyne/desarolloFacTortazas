import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoLoginGuard } from './guards/no-login.guard';
import { NoVendedorGuard } from './guards/no-vendedor.guard';

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
    path: 'modal-detalles-servicios',
    // tslint:disable-next-line:max-line-length
    loadChildren: () => import('./modals/modal-detalles-servicios/modal-detalles-servicios.module').then( m => m.ModalDetallesServiciosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'punto-venta',
    loadChildren: () => import('./pages/punto-venta/punto-venta.module').then( m => m.PuntoVentaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'lista-de-clientes',
    loadChildren: () => import('./pages/lista-de-clientes/lista-de-clientes.module').then( m => m.ListaDeClientesPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
  },
  {
    path: 'lista-de-proveedores',
    loadChildren: () => import('./pages/lista-de-proveedores/lista-de-proveedores.module').then( m => m.ListaDeProveedoresPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
  },
  {
    path: 'caja-chica',
    loadChildren: () => import('./pages/caja-chica/caja-chica.module').then( m => m.CajaChicaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'abrir-cerrar-caja',
    loadChildren: () => import('./modals/abrir-cerrar-caja/abrir-cerrar-caja.module').then( m => m.AbrirCerrarCajaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
  },
  {
    path: 'catalogo',
    loadChildren: () => import('./pages/catalogo/catalogo.module').then( m => m.CatalogoPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
  },
  {
    path: 'lista-de-compras',
    loadChildren: () => import('./pages/lista-de-compras/lista-de-compras.module').then( m => m.ListaDeComprasPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
  },
  {
    path: 'confirmar-venta',
    loadChildren: () => import('./pages/confirmar-venta/confirmar-venta.module').then( m => m.ConfirmarVentaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'compras',
    loadChildren: () => import('./pages/compras/compras.module').then( m => m.ComprasPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
  },
  {
    path: 'modal-proveedores',
    loadChildren: () => import('./modals/modal-proveedores/modal-proveedores.module').then( m => m.ModalProveedoresPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'detalles-de-compra',
    loadChildren: () => import('./modals/detalles-de-compra/detalles-de-compra.module').then( m => m.DetallesDeCompraPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'ventas-congeladas',
    loadChildren: () => import('./modals/ventas-congeladas/ventas-congeladas.module').then( m => m.VentasCongeladasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'lista-de-ventas',
    loadChildren: () => import('./pages/lista-de-ventas/lista-de-ventas.module').then( m => m.ListaDeVentasPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
  },
  {
    path: 'categorias',
    loadChildren: () => import('./pages/categorias/categorias.module').then( m => m.CategoriasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'modal-agregar-categorias',
    loadChildren: () => import('./modals/modal-agregar-categorias/modal-agregar-categorias.module')
.then( m => m.ModalAgregarCategoriasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'modal-ventas',
    loadChildren: () => import('./modals/modal-ventas/modal-ventas.module').then( m => m.ModalVentasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'buscar',
    loadChildren: () => import('./pages/buscar/buscar.module').then( m => m.BuscarPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'reporte-ventas',
    loadChildren: () => import('./pages/reporte-ventas/reporte-ventas.module').then( m => m.ReporteVentasPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./pages/usuarios/usuarios.module').then( m => m.UsuariosPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
  },
  {
    path: 'modal-editar-item-compra',
    loadChildren: () => import('./modals/modal-editar-item-compra/modal-editar-item-compra.module').
    then( m => m.ModalEditarItemCompraPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'modal-ingresos-egresos',
    // tslint:disable-next-line:max-line-length
    loadChildren: () => import('./modals/modal-ingresos-egresos/modal-ingresos-egresos.module').then( m => m.ModalIngresosEgresosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'print/:sede/:fecha/:id',
    loadChildren: () => import('./pages/print/print.module').then( m => m.PrintPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

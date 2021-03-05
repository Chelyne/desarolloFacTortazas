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
    loadChildren: () => import('./pages/descuentos/descuentos.module').then( m => m.DescuentosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'modal-agregar-descuento',
    // tslint:disable-next-line:max-line-length
    loadChildren: () => import('./modals/modal-agregar-descuento/modal-agregar-descuento.module').then( m => m.ModalAgregarDescuentoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'servicios/:tipo',
    loadChildren: () => import('./pages/servicios/servicios.module').then( m => m.ServiciosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'punto-venta',
    loadChildren: () => import('./pages/punto-venta/punto-venta.module').then( m => m.PuntoVentaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'lista-de-usarios',
    loadChildren: () => import('./pages/lista-de-usarios/lista-de-usarios.module').then( m => m.ListaDeUsariosPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
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
    path: 'ingreso-egreso-gestor',
    loadChildren: () => import('./pages/ingreso-egreso-gestor/ingreso-egreso-gestor.module').then( m => m.IngresoEgresoGestorPageModule),
    canActivate: [AuthGuard]
  },

  // {
  //   path: 'compras',
  //   loadChildren: () => import('./pages/compras/compras.module').then( m => m.ComprasPageModule)
  // },
  // {
  //   path: 'lista-de-productos',
  //   loadChildren: () => import('./pages/lista-de-productos/lista-de-productos.module').then( m => m.ListaDeProductosPageModule)
  // },

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
    path: 'modal-producto-compra',
    loadChildren: () => import('./modals/modal-producto-compra/modal-producto-compra.module').then( m => m.ModalProductoCompraPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'modal-buscador',
    loadChildren: () => import('./modals/modal-buscador/modal-buscador.module').then( m => m.ModalBuscadorPageModule),
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
    path: 'productos-compuestos',
    loadChildren: () => import('./pages/productos-compuestos/productos-compuestos.module').then( m => m.ProductosCompuestosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'agregar-editar-prod-compuestos',
    // tslint:disable-next-line:max-line-length
    loadChildren: () => import('./modals/agregar-editar-prod-compuestos/agregar-editar-prod-compuestos.module').then( m => m.AgregarEditarProdCompuestosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'test-page',
    loadChildren: () => import('./pages/test-page/test-page.module').then( m => m.TestPagePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'comprobante',
    loadChildren: () => import('./modals/comprobante/comprobante.module').then( m => m.ComprobantePageModule),
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
    loadChildren: () => import('./pages/buscar/buscar.module').then( m => m.BuscarPageModule)
  },
  {
    path: 'reporte-ventas',
    loadChildren: () => import('./pages/reporte-ventas/reporte-ventas.module').then( m => m.ReporteVentasPageModule),
    canActivate: [AuthGuard, NoVendedorGuard]
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./pages/usuarios/usuarios.module').then( m => m.UsuariosPageModule)
  }



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

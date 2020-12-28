import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductosCompuestosPage } from './productos-compuestos.page';

const routes: Routes = [
  {
    path: '',
    component: ProductosCompuestosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductosCompuestosPageRoutingModule {}

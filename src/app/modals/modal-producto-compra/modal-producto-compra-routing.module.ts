import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalProductoCompraPage } from './modal-producto-compra.page';

const routes: Routes = [
  {
    path: '',
    component: ModalProductoCompraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalProductoCompraPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalEditarItemCompraPage } from './modal-editar-item-compra.page';

const routes: Routes = [
  {
    path: '',
    component: ModalEditarItemCompraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalEditarItemCompraPageRoutingModule {}

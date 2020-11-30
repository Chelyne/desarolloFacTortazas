import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAgregarProductoPage } from './modal-agregar-producto.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAgregarProductoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAgregarProductoPageRoutingModule {}

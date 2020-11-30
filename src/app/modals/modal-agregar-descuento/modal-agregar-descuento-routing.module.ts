import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAgregarDescuentoPage } from './modal-agregar-descuento.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAgregarDescuentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAgregarDescuentoPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAgregarVerTipsPage } from './modal-agregar-ver-tips.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAgregarVerTipsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAgregarVerTipsPageRoutingModule {}

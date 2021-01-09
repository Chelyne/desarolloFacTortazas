import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalVentasPage } from './modal-ventas.page';

const routes: Routes = [
  {
    path: '',
    component: ModalVentasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalVentasPageRoutingModule {}

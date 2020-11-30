import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalDetallesServiciosPage } from './modal-detalles-servicios.page';

const routes: Routes = [
  {
    path: '',
    component: ModalDetallesServiciosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalDetallesServiciosPageRoutingModule {}

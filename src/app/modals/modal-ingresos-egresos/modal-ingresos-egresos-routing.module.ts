import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalIngresosEgresosPage } from './modal-ingresos-egresos.page';

const routes: Routes = [
  {
    path: '',
    component: ModalIngresosEgresosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalIngresosEgresosPageRoutingModule {}

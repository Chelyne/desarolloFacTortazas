import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IngresoEgresoModalPage } from './ingreso-egreso-modal.page';

const routes: Routes = [
  {
    path: '',
    component: IngresoEgresoModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IngresoEgresoModalPageRoutingModule {}

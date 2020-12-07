import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IngresoEgresoPage } from './ingreso-egreso.page';

const routes: Routes = [
  {
    path: '',
    component: IngresoEgresoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IngresoEgresoPageRoutingModule {}

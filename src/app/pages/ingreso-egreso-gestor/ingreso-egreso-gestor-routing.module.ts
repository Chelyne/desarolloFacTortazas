import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IngresoEgresoGestorPage } from './ingreso-egreso-gestor.page';

const routes: Routes = [
  {
    path: '',
    component: IngresoEgresoGestorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IngresoEgresoGestorPageRoutingModule {}

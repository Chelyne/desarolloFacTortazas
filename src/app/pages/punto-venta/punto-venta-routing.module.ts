import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PuntoVentaPage } from './punto-venta.page';

const routes: Routes = [
  {
    path: '',
    component: PuntoVentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PuntoVentaPageRoutingModule {}

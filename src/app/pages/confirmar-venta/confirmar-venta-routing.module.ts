import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmarVentaPage } from './confirmar-venta.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmarVentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmarVentaPageRoutingModule {}

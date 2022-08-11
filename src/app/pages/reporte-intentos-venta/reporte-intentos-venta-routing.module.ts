import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteIntentosVentaPage } from './reporte-intentos-venta.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteIntentosVentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteIntentosVentaPageRoutingModule {}

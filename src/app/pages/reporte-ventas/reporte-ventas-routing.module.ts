import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteVentasPage } from './reporte-ventas.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteVentasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteVentasPageRoutingModule {}

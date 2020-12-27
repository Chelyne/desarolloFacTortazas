import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VentasCongeladasPage } from './ventas-congeladas.page';

const routes: Routes = [
  {
    path: '',
    component: VentasCongeladasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VentasCongeladasPageRoutingModule {}

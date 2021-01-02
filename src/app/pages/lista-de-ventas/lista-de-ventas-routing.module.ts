import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaDeVentasPage } from './lista-de-ventas.page';

const routes: Routes = [
  {
    path: '',
    component: ListaDeVentasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaDeVentasPageRoutingModule {}

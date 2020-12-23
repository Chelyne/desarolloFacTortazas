import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaDeComprasPage } from './lista-de-compras.page';

const routes: Routes = [
  {
    path: '',
    component: ListaDeComprasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaDeComprasPageRoutingModule {}

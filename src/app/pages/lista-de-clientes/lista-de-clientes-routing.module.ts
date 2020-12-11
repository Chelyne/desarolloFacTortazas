import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaDeClientesPage } from './lista-de-clientes.page';

const routes: Routes = [
  {
    path: '',
    component: ListaDeClientesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaDeClientesPageRoutingModule {}

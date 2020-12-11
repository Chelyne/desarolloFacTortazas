import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaDeUsariosPage } from './lista-de-usarios.page';

const routes: Routes = [
  {
    path: '',
    component: ListaDeUsariosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaDeUsariosPageRoutingModule {}

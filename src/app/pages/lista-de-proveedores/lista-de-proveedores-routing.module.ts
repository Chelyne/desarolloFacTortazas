import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaDeProveedoresPage } from './lista-de-proveedores.page';

const routes: Routes = [
  {
    path: '',
    component: ListaDeProveedoresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaDeProveedoresPageRoutingModule {}

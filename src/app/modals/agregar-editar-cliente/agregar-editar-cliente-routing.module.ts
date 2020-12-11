import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarEditarClientePage } from './agregar-editar-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarEditarClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarEditarClientePageRoutingModule {}

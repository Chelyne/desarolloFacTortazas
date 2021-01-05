import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAgregarCategoriasPage } from './modal-agregar-categorias.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAgregarCategoriasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAgregarCategoriasPageRoutingModule {}

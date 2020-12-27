import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalBuscadorPage } from './modal-buscador.page';

const routes: Routes = [
  {
    path: '',
    component: ModalBuscadorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalBuscadorPageRoutingModule {}

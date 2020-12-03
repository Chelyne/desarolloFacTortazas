import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalSubirOfertaPage } from './modal-subir-oferta.page';

const routes: Routes = [
  {
    path: '',
    component: ModalSubirOfertaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalSubirOfertaPageRoutingModule {}

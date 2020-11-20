import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalUsuarioPage } from './modal-usuario.page';

const routes: Routes = [
  {
    path: '',
    component: ModalUsuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalUsuarioPageRoutingModule {}

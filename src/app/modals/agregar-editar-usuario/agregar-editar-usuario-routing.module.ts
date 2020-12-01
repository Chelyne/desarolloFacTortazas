import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarEditarUsuarioPage } from './agregar-editar-usuario.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarEditarUsuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarEditarUsuarioPageRoutingModule {}

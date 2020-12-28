import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarEditarProdCompuestosPage } from './agregar-editar-prod-compuestos.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarEditarProdCompuestosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarEditarProdCompuestosPageRoutingModule {}

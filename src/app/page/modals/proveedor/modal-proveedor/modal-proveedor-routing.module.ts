import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalProveedorPage } from './modal-proveedor.page';

const routes: Routes = [
  {
    path: '',
    component: ModalProveedorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalProveedorPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrarProveedorPage } from './registrar-proveedor.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrarProveedorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrarProveedorPageRoutingModule {}
